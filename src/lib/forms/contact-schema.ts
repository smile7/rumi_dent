import { z } from 'zod'

// Zod's JIT probes `new Function('')`, which the CSP reports as `script-src` eval on the contact page.
z.config({ jitless: true })

/**
 * Contact form schema, shared by `ContactForm` (client) and the contact Server Action.
 * Error messages are keys of `ContactForm.errors` in `messages/*.json`, so the schema stays
 * locale-free; `contactErrorKey` turns them back into translatable keys.
 */

export const contactTopics = ['general', 'childAppointment', 'adultAppointment', 'other'] as const
export type ContactTopic = (typeof contactTopics)[number]

export const contactErrorKeys = [
  'nameLength',
  'phoneInvalid',
  'emailInvalid',
  'contactRequired',
  'messageLength',
  'topicRequired',
  'childAgeInvalid',
  'consentRequired',
] as const
export type ContactErrorKey = (typeof contactErrorKeys)[number]

/** Version of the `ContactForm.consent` wording, quoted in every notification. Bump when it changes. */
export const CONSENT_TEXT_VERSION = '2026-11-22'

/** Minimum time between rendering the form and submitting it; faster is treated as a bot. */
export const MIN_FILL_MS = 3000

const SEPARATORS = /[\s\-().\/]/g
const BG_E164 = /^\+359\d{8,9}$/
const E164 = /^\+[1-9]\d{7,14}$/

/**
 * Normalizes a phone number to E.164. Bulgarian formats (`0888 123 456`, `+359 888 123 456`,
 * `00359888123456`) become `+359…`; other international numbers must start with `+` or `00`.
 * Returns `null` when the input isn't a valid number.
 */
export function normalizePhone(input: string): string | null {
  const compact = input.replace(SEPARATORS, '')
  const international = compact.startsWith('00') ? `+${compact.slice(2)}` : compact
  const e164 = international.startsWith('0') ? `+359${international.slice(1)}` : international
  if (e164.startsWith('+359')) return BG_E164.test(e164) ? e164 : null
  return E164.test(e164) ? e164 : null
}

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()

export const contactSchema = z
  .object({
    name: z.string().trim().min(2, 'nameLength').max(80, 'nameLength'),
    phone: optionalText.refine(
      (v) => v === undefined || normalizePhone(v) !== null,
      'phoneInvalid',
    ),
    email: optionalText.pipe(z.email('emailInvalid').optional()),
    topic: z.enum(contactTopics, 'topicRequired'),
    childAge: z
      .union([z.number(), z.string()])
      .optional()
      .transform((v) => (v === '' || v === undefined ? undefined : Number(v)))
      .pipe(
        z
          .number('childAgeInvalid')
          .int('childAgeInvalid')
          .min(0, 'childAgeInvalid')
          .max(17, 'childAgeInvalid')
          .optional(),
      ),
    message: z.string().trim().min(10, 'messageLength').max(2000, 'messageLength'),
    consent: z.boolean().refine((v) => v, 'consentRequired'),
    website: z.string().optional(),
    startedAt: z.coerce.number().optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.phone && !data.email) {
      ctx.addIssue({ code: 'custom', path: ['phone'], message: 'contactRequired' })
    }
  })
  .transform(({ phone, childAge, ...data }) => ({
    ...data,
    phone: phone ? (normalizePhone(phone) ?? undefined) : undefined,
    // Only the child topic asks for an age (data minimization).
    childAge: data.topic === 'childAppointment' ? childAge : undefined,
  }))

export type ContactInput = z.input<typeof contactSchema>
export type ContactData = z.output<typeof contactSchema>
export type ContactField = 'name' | 'phone' | 'email' | 'topic' | 'childAge' | 'message' | 'consent'

export type ContactFormError = 'invalid' | 'verificationFailed' | 'sendFailed' | 'unavailable'

/** What the contact Server Action returns to the form. */
export type ContactResult =
  | { ok: true }
  | {
      ok: false
      fieldErrors?: Partial<Record<ContactField, ContactErrorKey>>
      formError: ContactFormError
    }

/** The message key of an issue, or `null` for messages the schema didn't set (Zod defaults). */
export function contactErrorKey(message: string | undefined): ContactErrorKey | null {
  return contactErrorKeys.find((key) => key === message) ?? null
}

/** FormData (the Server Action input) → the object shape the schema parses. */
export function contactFormDataToInput(form: FormData): Record<string, unknown> {
  const text = (key: string) => {
    const value = form.get(key)
    return typeof value === 'string' ? value : undefined
  }
  return {
    name: text('name') ?? '',
    phone: text('phone'),
    email: text('email'),
    topic: text('topic'),
    childAge: text('childAge'),
    message: text('message') ?? '',
    consent: form.get('consent') === 'on',
    website: text('website'),
    startedAt: text('startedAt'),
  }
}

/** Honeypot filled or submitted faster than a person could: answer with a silent success. */
export function isLikelyBot(
  data: Pick<ContactData, 'website' | 'startedAt'>,
  now: number = Date.now(),
): boolean {
  if (data.website) return true
  if (!data.startedAt || !Number.isFinite(data.startedAt)) return true
  return now - data.startedAt < MIN_FILL_MS
}
