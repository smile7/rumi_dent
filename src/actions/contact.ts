'use server'

import { headers } from 'next/headers'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'
import { createElement } from 'react'
import { render } from 'react-email'
import { Resend } from 'resend'

import { defaultLocale, locales, type Locale } from '@/config/i18n'
import {
  ContactNotification,
  contactNotificationText,
  type ContactNotificationProps,
} from '@/emails/ContactNotification'
import { readServerEnv } from '@/env.server'
import { getContactFormSettings, type ContactFormSettings } from '@/lib/content'
import {
  CONSENT_TEXT_VERSION,
  contactErrorKey,
  contactFormDataToInput,
  contactSchema,
  isLikelyBot,
  type ContactData,
  type ContactField,
  type ContactResult,
} from '@/lib/forms/contact-schema'
import { verifyTurnstile } from '@/lib/forms/turnstile'

type Outcome =
  'sent' | 'dry_run' | 'bot' | 'invalid' | 'verification_failed' | 'config_missing' | 'send_failed'

/** Outcome and error code only: never names, contacts or message text. */
function log(outcome: Outcome, code?: string) {
  const line = JSON.stringify({ event: 'contact_submit', outcome, ...(code ? { code } : {}) })
  if (outcome === 'sent' || outcome === 'dry_run' || outcome === 'bot') console.info(line)
  else console.warn(line)
}

type ServerEnvKey = Parameters<typeof readServerEnv>[number]

function envOrNull<K extends ServerEnvKey>(
  ...keys: K[]
): ReturnType<typeof readServerEnv<K>> | null {
  try {
    return readServerEnv(...keys)
  } catch {
    return null
  }
}

const unavailable: ContactResult = { ok: false, formError: 'unavailable' }

async function sha256(value: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

async function buildEmail(locale: Locale, data: ContactData, settings: ContactFormSettings) {
  const t = await getTranslations({ locale })
  const topic = t(`ContactForm.topics.${data.topic}`)
  const props: ContactNotificationProps = {
    lang: locale,
    heading: t('ContactEmail.heading'),
    rows: [
      { label: t('ContactForm.name'), value: data.name },
      ...(data.phone ? [{ label: t('ContactForm.phone'), value: data.phone }] : []),
      ...(data.email ? [{ label: t('ContactForm.email'), value: data.email }] : []),
      { label: t('ContactForm.topic'), value: topic },
      ...(data.childAge !== undefined
        ? [{ label: t('ContactForm.childAge'), value: String(data.childAge) }]
        : []),
    ],
    message: { label: t('ContactForm.message'), value: data.message },
    footer: t('ContactEmail.footer', {
      sentAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
      version: CONSENT_TEXT_VERSION,
    }),
  }
  const prefix = settings.subjectPrefix || settings.brandName || props.heading
  return {
    subject: t('ContactEmail.subject', { prefix, topic }),
    html: await render(createElement(ContactNotification, props)),
    text: contactNotificationText(props),
  }
}

/**
 * Contact form → email (PRD F-09). Order: schema → bot traps (silent success) → Turnstile →
 * Resend. Nothing is stored. Missing configuration answers `unavailable`, so the form shows the
 * phone number instead of breaking.
 */
export async function submitContact(
  locale: Locale,
  _previous: ContactResult | null,
  form: FormData,
): Promise<ContactResult> {
  if (!hasLocale(locales, locale)) {
    log('invalid', 'locale')
    return { ok: false, formError: 'invalid' }
  }

  const parsed = contactSchema.safeParse(contactFormDataToInput(form))
  if (!parsed.success) {
    const fieldErrors: NonNullable<Extract<ContactResult, { ok: false }>['fieldErrors']> = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as ContactField
      const key = contactErrorKey(issue.message)
      if (key && !fieldErrors[field]) fieldErrors[field] = key
    }
    log('invalid')
    return { ok: false, formError: 'invalid', fieldErrors }
  }
  const data = parsed.data
  if (isLikelyBot(data)) {
    log('bot')
    return { ok: true }
  }

  const turnstileEnv = envOrNull('TURNSTILE_SECRET_KEY')
  if (!turnstileEnv) {
    log('config_missing', 'turnstile')
    return unavailable
  }
  const requestHeaders = await headers()
  const token = form.get('cf-turnstile-response')
  const verified = await verifyTurnstile({
    secret: turnstileEnv.TURNSTILE_SECRET_KEY,
    token: typeof token === 'string' ? token : '',
    remoteIp: requestHeaders.get('cf-connecting-ip') ?? undefined,
    hostname: requestHeaders.get('host')?.split(':')[0],
  })
  if (!verified) {
    log('verification_failed')
    return { ok: false, formError: 'verificationFailed' }
  }

  const dryRun = envOrNull('CONTACT_DRY_RUN')?.CONTACT_DRY_RUN ?? false
  const resendEnv = dryRun ? null : envOrNull('RESEND_API_KEY', 'CONTACT_FROM_EMAIL')
  if (!dryRun && !resendEnv) {
    log('config_missing', 'resend')
    return unavailable
  }

  let settings: ContactFormSettings = {}
  try {
    settings = await getContactFormSettings(locale)
  } catch {
    // Subject prefix and recipient fall back to env / defaults below.
  }
  const to = envOrNull('CONTACT_TO_EMAIL')?.CONTACT_TO_EMAIL ?? settings.recipient
  if (!dryRun && !to) {
    log('config_missing', 'recipient')
    return unavailable
  }

  const email = await buildEmail(defaultLocale, data, settings)
  if (dryRun || !resendEnv || !to) {
    log('dry_run')
    return { ok: true }
  }

  try {
    const { error } = await new Resend(resendEnv.RESEND_API_KEY).emails.send(
      {
        from: resendEnv.CONTACT_FROM_EMAIL,
        to,
        ...(data.email ? { replyTo: data.email } : {}),
        subject: email.subject,
        html: email.html,
        text: email.text,
      },
      { idempotencyKey: `contact-${await sha256(String(token))}` },
    )
    if (error) {
      log('send_failed', error.name)
      return { ok: false, formError: 'sendFailed' }
    }
  } catch {
    log('send_failed', 'exception')
    return { ok: false, formError: 'sendFailed' }
  }
  log('sent')
  return { ok: true }
}
