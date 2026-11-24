import { createTranslator } from 'next-intl'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { catalogs } from '@/test/messages'

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  settings: vi.fn(),
  headers: new Map<string, string>(),
}))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({
  headers: async () => ({ get: (key: string) => mocks.headers.get(key) ?? null }),
}))
vi.mock('next-intl/server', () => ({
  getTranslations: async ({ locale }: { locale: 'bg' | 'en' }) =>
    createTranslator({ locale, messages: catalogs[locale] }),
}))
vi.mock('@/lib/content', () => ({ getContactFormSettings: mocks.settings }))
vi.mock('resend', () => ({
  Resend: class {
    emails = { send: mocks.send }
  },
}))

const { submitContact } = await import('./contact')

const SECRET = 'real-secret'
const fetchMock = vi.fn()

function formData(overrides: Record<string, string> = {}) {
  const form = new FormData()
  const values = {
    name: 'Мария',
    phone: '0888 123 456',
    email: 'maria@example.com',
    topic: 'childAppointment',
    childAge: '6',
    message: 'Бих искала да запиша час.',
    consent: 'on',
    website: '',
    startedAt: String(Date.now() - 10_000),
    'cf-turnstile-response': 'token-123',
    ...overrides,
  }
  for (const [key, value] of Object.entries(values)) form.set(key, value)
  return form
}

function siteverify(result: Record<string, unknown>) {
  fetchMock.mockImplementation(async () => new Response(JSON.stringify(result), { status: 200 }))
}

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock)
  vi.stubEnv('TURNSTILE_SECRET_KEY', SECRET)
  vi.stubEnv('RESEND_API_KEY', 're_test')
  vi.stubEnv('CONTACT_FROM_EMAIL', 'Website <noreply@mail.example.bg>')
  vi.stubEnv('CONTACT_TO_EMAIL', 'clinic@example.bg')
  vi.stubEnv('CONTACT_DRY_RUN', 'false')
  mocks.headers.clear()
  mocks.headers.set('host', 'www.example.bg')
  mocks.headers.set('cf-connecting-ip', '203.0.113.7')
  mocks.settings.mockResolvedValue({ brandName: 'Демо Дентал', subjectPrefix: 'Сайт' })
  mocks.send.mockResolvedValue({ data: { id: 'email-1' }, error: null })
  siteverify({ success: true, hostname: 'www.example.bg' })
  vi.spyOn(console, 'info').mockImplementation(() => undefined)
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
  fetchMock.mockReset()
  mocks.send.mockReset()
})

function loggedText() {
  const calls = [...vi.mocked(console.info).mock.calls, ...vi.mocked(console.warn).mock.calls]
  return calls.flat().join('\n')
}

describe('submitContact', () => {
  it('verifies Turnstile and sends a localized email', async () => {
    await expect(submitContact('bg', null, formData())).resolves.toEqual({ ok: true })

    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://challenges.cloudflare.com/turnstile/v0/siteverify')
    const body = init.body as URLSearchParams
    expect(body.get('secret')).toBe(SECRET)
    expect(body.get('response')).toBe('token-123')
    expect(body.get('remoteip')).toBe('203.0.113.7')

    const [payload, options] = mocks.send.mock.calls[0]!
    expect(payload).toMatchObject({
      from: 'Website <noreply@mail.example.bg>',
      to: 'clinic@example.bg',
      replyTo: 'maria@example.com',
      subject: 'Сайт: Час за дете',
    })
    expect(payload.html).toContain('+359888123456')
    expect(payload.html).toContain('Възраст на детето')
    expect(payload.text).toContain('Съобщение:\nБих искала да запиша час.')
    expect(payload.text).toContain('текст версия')
    expect(options.idempotencyKey).toMatch(/^contact-[0-9a-f]{64}$/)
  })

  it('uses the settings recipient without CONTACT_TO_EMAIL, and BG notification copy for EN visitors', async () => {
    vi.stubEnv('CONTACT_TO_EMAIL', '')
    mocks.settings.mockResolvedValue({ brandName: 'Demo Dental', recipient: 'inbox@example.bg' })
    await submitContact('en', null, formData({ topic: 'general', email: '' }))
    const [payload] = mocks.send.mock.calls[0]!
    expect(payload).toMatchObject({
      to: 'inbox@example.bg',
      subject: 'Demo Dental: Общ въпрос',
    })
    expect(payload).not.toHaveProperty('replyTo')
    expect(payload.text).not.toContain("Child's age")
  })

  it('refuses the Turnstile test secret in production', async () => {
    vi.stubEnv('NEXT_PUBLIC_ENV', 'production')
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA')
    await expect(submitContact('bg', null, formData())).resolves.toEqual({
      ok: false,
      formError: 'unavailable',
    })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(loggedText()).toContain('"code":"turnstile"')
  })

  it('returns field errors from the shared schema', async () => {
    const result = await submitContact('bg', null, formData({ name: 'М', consent: '' }))
    expect(result).toEqual({
      ok: false,
      formError: 'invalid',
      fieldErrors: { name: 'nameLength', consent: 'consentRequired' },
    })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it.each([
    ['a filled honeypot', { website: 'https://spam.example' }],
    ['a too fast submit', { startedAt: String(Date.now()) }],
  ])('answers %s with a silent success and sends nothing', async (_label, overrides) => {
    await expect(submitContact('bg', null, formData(overrides))).resolves.toEqual({ ok: true })
    expect(fetchMock).not.toHaveBeenCalled()
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('rejects a failed or foreign-host Turnstile check', async () => {
    siteverify({ success: false, 'error-codes': ['invalid-input-response'] })
    await expect(submitContact('bg', null, formData())).resolves.toEqual({
      ok: false,
      formError: 'verificationFailed',
    })
    siteverify({ success: true, hostname: 'evil.example' })
    await expect(submitContact('bg', null, formData())).resolves.toMatchObject({
      formError: 'verificationFailed',
    })
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('skips the hostname check with the Turnstile test secret', async () => {
    vi.stubEnv('TURNSTILE_SECRET_KEY', '1x0000000000000000000000000000000AA')
    siteverify({ success: true, hostname: 'example.com' })
    await expect(submitContact('bg', null, formData())).resolves.toEqual({ ok: true })
  })

  it('does not call Resend in dry-run mode', async () => {
    vi.stubEnv('CONTACT_DRY_RUN', 'true')
    vi.stubEnv('RESEND_API_KEY', '')
    await expect(submitContact('bg', null, formData())).resolves.toEqual({ ok: true })
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it.each([
    ['the Turnstile secret', 'TURNSTILE_SECRET_KEY'],
    ['the Resend key', 'RESEND_API_KEY'],
    ['the sender', 'CONTACT_FROM_EMAIL'],
  ])('answers "unavailable" without %s', async (_label, key) => {
    vi.stubEnv(key, '')
    await expect(submitContact('bg', null, formData())).resolves.toEqual({
      ok: false,
      formError: 'unavailable',
    })
    expect(mocks.send).not.toHaveBeenCalled()
  })

  it('answers "unavailable" without any recipient', async () => {
    vi.stubEnv('CONTACT_TO_EMAIL', '')
    mocks.settings.mockResolvedValue({})
    await expect(submitContact('bg', null, formData())).resolves.toMatchObject({
      formError: 'unavailable',
    })
  })

  it('reports a Resend failure as sendFailed', async () => {
    mocks.send.mockResolvedValue({
      data: null,
      error: { name: 'rate_limit_exceeded', message: 'x' },
    })
    await expect(submitContact('bg', null, formData())).resolves.toEqual({
      ok: false,
      formError: 'sendFailed',
    })
    mocks.send.mockRejectedValue(new Error('network'))
    await expect(submitContact('bg', null, formData())).resolves.toMatchObject({
      formError: 'sendFailed',
    })
  })

  it('never logs personal data', async () => {
    await submitContact('bg', null, formData())
    mocks.send.mockResolvedValue({ data: null, error: { name: 'validation_error', message: 'x' } })
    await submitContact('bg', null, formData())
    const logged = loggedText()
    expect(logged).toContain('"outcome":"sent"')
    expect(logged).toContain('"code":"validation_error"')
    for (const pii of ['Мария', '0888', '359888', 'maria@example.com', 'запиша', '203.0.113.7']) {
      expect(logged).not.toContain(pii)
    }
  })
})
