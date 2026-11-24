'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import {
  startTransition,
  useActionState,
  useEffect,
  useId,
  useRef,
  type BaseSyntheticEvent,
  type ReactNode,
} from 'react'
import { useForm, useWatch, type FieldErrors } from 'react-hook-form'

import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { track } from '@/lib/analytics/track'
import {
  contactErrorKey,
  contactSchema,
  contactTopics,
  type ContactData,
  type ContactField,
  type ContactInput,
  type ContactResult,
} from '@/lib/forms/contact-schema'
import type { PhoneLink } from '@/lib/site/actions'

import { TurnstileField } from './TurnstileField'

export type ContactAction = (
  previous: ContactResult | null,
  form: FormData,
) => Promise<ContactResult>

export type ContactFormProps = {
  action: ContactAction
  phone: PhoneLink | null
  /** Localized path of the privacy policy, if published. */
  privacyHref?: string
  /** Editor's success text from the site settings. */
  successMessage?: string
  /** Turnstile site key; without it no widget renders and the server refuses the submit. */
  turnstileSiteKey?: string
}

const FIELD_ORDER: ContactField[] = [
  'name',
  'phone',
  'email',
  'topic',
  'childAge',
  'message',
  'consent',
]

const defaultValues: ContactInput = {
  name: '',
  phone: '',
  email: '',
  topic: 'general',
  childAge: '',
  message: '',
  consent: false,
}

type FieldMessageProps = { id: string; children: ReactNode }

function FieldError({ id, children }: FieldMessageProps) {
  return (
    <p id={id} className="text-step--1 font-semibold text-danger">
      {children}
    </p>
  )
}

function FieldHint({ id, children }: FieldMessageProps) {
  return (
    <p id={id} className="text-step--1 text-fg-muted">
      {children}
    </p>
  )
}

function describedBy(...ids: (string | false | null | undefined)[]) {
  return ids.filter(Boolean).join(' ') || undefined
}

export function ContactForm({
  action,
  phone,
  privacyHref,
  successMessage,
  turnstileSiteKey,
}: ContactFormProps) {
  const t = useTranslations('ContactForm')
  const locale = useLocale()
  const id = useId()
  const fieldId = (field: ContactField) => `${id}-${field}`
  const errorId = (field: ContactField) => `${id}-${field}-error`

  const [state, formAction, pending] = useActionState(action, null)
  const startedAtRef = useRef<HTMLInputElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, submitCount },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues,
    shouldFocusError: true,
  })

  // Set on the client: the prerendered HTML would otherwise carry the build time.
  useEffect(() => {
    if (startedAtRef.current) startedAtRef.current.value = String(Date.now())
  }, [])

  useEffect(() => {
    if (!state) return
    if (state.ok) track('form_submit_success')
    resultRef.current?.focus()
  }, [state])

  const serverErrors = state && !state.ok ? state.fieldErrors : undefined
  const message = (field: ContactField): string | null => {
    const raw = (errors as FieldErrors<ContactInput>)[field]?.message ?? serverErrors?.[field]
    if (!raw) return null
    const key = contactErrorKey(raw)
    return key ? t(`errors.${key}`) : t('errors.generic')
  }
  const invalidFields = FIELD_ORDER.filter((field) => message(field))
  const topic = useWatch({ control, name: 'topic' })

  const onValid = (_data: ContactData, event?: BaseSyntheticEvent) => {
    const form = event?.target
    if (!(form instanceof HTMLFormElement) || pending) return
    startTransition(() => formAction(new FormData(form)))
  }

  const phoneFallback = phone
    ? t.rich('phoneFallback', {
        phone: () => (
          <a href={phone.href} className="font-semibold text-link tabular-nums underline">
            {phone.display}
          </a>
        ),
      })
    : null

  if (state?.ok) {
    return (
      <div
        ref={resultRef}
        tabIndex={-1}
        role="status"
        className="rounded-card border border-border bg-surface p-6"
      >
        <Heading as="h3" size="step-2">
          {t('successTitle')}
        </Heading>
        <Text className="mt-2">{successMessage || t('successText')}</Text>
      </div>
    )
  }

  const labelText = (text: string, required: boolean) => (
    <>
      {text}
      {required ? <span className="font-normal text-fg-muted"> {t('required')}</span> : null}
    </>
  )

  const privacyLink = (chunks: ReactNode) =>
    privacyHref ? (
      <Link href={privacyHref} target="_blank" className="text-link underline underline-offset-4">
        {chunks}
        <span className="sr-only"> {t('opensInNewTab')}</span>
      </Link>
    ) : (
      chunks
    )

  return (
    <div className="rounded-card border border-border bg-surface p-5 sm:p-8">
      <Heading as="h3" size="step-2" id={`${id}-title`}>
        {t('title')}
      </Heading>

      {state && !state.ok ? (
        <div
          ref={resultRef}
          tabIndex={-1}
          role="alert"
          className="mt-6 rounded-field border-2 border-danger p-4"
        >
          <p className="font-semibold">{t(`formErrors.${state.formError}`)}</p>
          {phoneFallback ? <p className="mt-1">{phoneFallback}</p> : null}
        </div>
      ) : null}

      {submitCount > 0 && invalidFields.length > 0 && !(state && !state.ok) ? (
        <div role="alert" className="mt-6 rounded-field border-2 border-danger p-4">
          <p className="font-semibold">{t('summary', { count: invalidFields.length })}</p>
          <ul className="mt-2 list-disc ps-5">
            {invalidFields.map((field) => (
              <li key={field}>
                <a href={`#${fieldId(field)}`} className="text-link underline">
                  {message(field)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form
        action={formAction}
        onSubmit={handleSubmit(onValid)}
        noValidate
        aria-labelledby={`${id}-title`}
        className="mt-6 grid gap-6"
      >
        <div className="grid gap-2">
          <Label htmlFor={fieldId('name')} className="gap-0">
            {labelText(t('name'), true)}
          </Label>
          <Input
            id={fieldId('name')}
            autoComplete="name"
            aria-required="true"
            aria-invalid={message('name') ? true : undefined}
            aria-describedby={describedBy(message('name') && errorId('name'))}
            {...register('name')}
          />
          {message('name') ? <FieldError id={errorId('name')}>{message('name')}</FieldError> : null}
        </div>

        <fieldset className="grid gap-4">
          <legend className="sr-only">{t('contactHint')}</legend>
          <FieldHint id={`${id}-contact-hint`}>{t('contactHint')}</FieldHint>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid content-start gap-2">
              <Label htmlFor={fieldId('phone')}>{t('phone')}</Label>
              <Input
                id={fieldId('phone')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                aria-invalid={message('phone') ? true : undefined}
                aria-describedby={describedBy(
                  `${id}-contact-hint`,
                  message('phone') && errorId('phone'),
                )}
                {...register('phone')}
              />
              {message('phone') ? (
                <FieldError id={errorId('phone')}>{message('phone')}</FieldError>
              ) : null}
            </div>
            <div className="grid content-start gap-2">
              <Label htmlFor={fieldId('email')}>{t('email')}</Label>
              <Input
                id={fieldId('email')}
                type="email"
                inputMode="email"
                autoComplete="email"
                aria-invalid={message('email') ? true : undefined}
                aria-describedby={describedBy(
                  `${id}-contact-hint`,
                  message('email') && errorId('email'),
                )}
                {...register('email')}
              />
              {message('email') ? (
                <FieldError id={errorId('email')}>{message('email')}</FieldError>
              ) : null}
            </div>
          </div>
        </fieldset>

        <fieldset
          className="grid gap-3"
          aria-invalid={message('topic') ? true : undefined}
          aria-describedby={describedBy(message('topic') && errorId('topic'))}
        >
          <legend className="mb-1 text-step--1 font-semibold">{labelText(t('topic'), true)}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {contactTopics.map((value, i) => (
              <label
                key={value}
                className="flex min-h-11 cursor-pointer items-center gap-3 rounded-field border-2 border-input px-3.5 has-checked:border-primary"
              >
                <input
                  type="radio"
                  value={value}
                  id={i === 0 ? fieldId('topic') : undefined}
                  className="size-5 accent-primary"
                  {...register('topic')}
                />
                {t(`topics.${value}`)}
              </label>
            ))}
          </div>
          {message('topic') ? (
            <FieldError id={errorId('topic')}>{message('topic')}</FieldError>
          ) : null}
        </fieldset>

        {topic === 'childAppointment' ? (
          <div className="grid gap-2 sm:max-w-48">
            <Label htmlFor={fieldId('childAge')}>{t('childAge')}</Label>
            <Input
              id={fieldId('childAge')}
              inputMode="numeric"
              autoComplete="off"
              aria-invalid={message('childAge') ? true : undefined}
              aria-describedby={describedBy(
                `${id}-age-hint`,
                message('childAge') && errorId('childAge'),
              )}
              {...register('childAge')}
            />
            <FieldHint id={`${id}-age-hint`}>{t('childAgeHint')}</FieldHint>
            {message('childAge') ? (
              <FieldError id={errorId('childAge')}>{message('childAge')}</FieldError>
            ) : null}
          </div>
        ) : null}

        <div className="grid gap-2">
          <Label htmlFor={fieldId('message')} className="gap-0">
            {labelText(t('message'), true)}
          </Label>
          <Textarea
            id={fieldId('message')}
            rows={5}
            maxLength={2000}
            aria-required="true"
            aria-invalid={message('message') ? true : undefined}
            aria-describedby={describedBy(
              `${id}-message-hint`,
              message('message') && errorId('message'),
            )}
            {...register('message')}
          />
          <FieldHint id={`${id}-message-hint`}>{t('messageHint')}</FieldHint>
          {message('message') ? (
            <FieldError id={errorId('message')}>{message('message')}</FieldError>
          ) : null}
        </div>

        <div className="grid gap-2">
          <div className="flex items-start gap-3">
            <input
              id={fieldId('consent')}
              type="checkbox"
              aria-required="true"
              aria-invalid={message('consent') ? true : undefined}
              aria-describedby={describedBy(message('consent') && errorId('consent'))}
              className="mt-0.5 size-6 shrink-0 cursor-pointer accent-primary"
              {...register('consent')}
            />
            <label htmlFor={fieldId('consent')} className="cursor-pointer text-step--1">
              {t.rich('consent', { link: privacyLink })}
              <span className="text-fg-muted"> {t('required')}</span>
            </label>
          </div>
          {message('consent') ? (
            <FieldError id={errorId('consent')}>{message('consent')}</FieldError>
          ) : null}
        </div>

        {/* Bot traps: a field people don't see and the time the form became interactive. */}
        <div aria-hidden="true" className="hidden">
          <label htmlFor={`${id}-website`}>{t('honeypot')}</label>
          <input id={`${id}-website`} name="website" tabIndex={-1} autoComplete="off" />
        </div>
        <input ref={startedAtRef} type="hidden" name="startedAt" />

        {turnstileSiteKey ? (
          <TurnstileField siteKey={turnstileSiteKey} language={locale} resetSignal={state} />
        ) : null}

        <div className="grid gap-3">
          <Button
            type="submit"
            size="lg"
            loading={pending}
            className="w-full sm:w-auto sm:justify-self-start"
          >
            {t('submit')}
          </Button>
          <Text size="small" tone="muted">
            {t('notice')} {privacyHref ? privacyLink(t('privacyLink')) : null}
          </Text>
        </div>
      </form>
    </div>
  )
}
