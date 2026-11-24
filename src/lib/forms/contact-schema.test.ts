import { describe, expect, it } from 'vitest'

import {
  contactFormDataToInput,
  contactSchema,
  isLikelyBot,
  MIN_FILL_MS,
  normalizePhone,
} from './contact-schema'

const valid = {
  name: 'Мария Иванова',
  phone: '0888 123 456',
  email: '',
  topic: 'general',
  message: 'Бих искала да запиша час.',
  consent: true,
  website: '',
  startedAt: 1,
}

function issues(input: Record<string, unknown>) {
  const result = contactSchema.safeParse(input)
  return result.success
    ? {}
    : Object.fromEntries(result.error.issues.map((i) => [i.path.join('.'), i.message]))
}

describe('normalizePhone', () => {
  it.each([
    ['0888 123 456', '+359888123456'],
    ['0888-123-456', '+359888123456'],
    ['+359888123456', '+359888123456'],
    ['+359 888 123 456', '+359888123456'],
    ['00359888123456', '+359888123456'],
    ['02 987 6543', '+35929876543'],
    ['(082) 82 12 34', '+35982821234'],
    ['+44 20 7946 0958', '+442079460958'],
  ])('%s → %s', (input, expected) => {
    expect(normalizePhone(input)).toBe(expected)
  })

  it.each(['12345', '0888', '+359 12', 'abc', '+3598881234567'])('rejects %s', (input) => {
    expect(normalizePhone(input)).toBeNull()
  })
})

describe('contactSchema', () => {
  it('accepts a valid submission and normalizes the phone', () => {
    const data = contactSchema.parse(valid)
    expect(data.phone).toBe('+359888123456')
    expect(data.email).toBeUndefined()
    expect(data.name).toBe('Мария Иванова')
  })

  it('requires a phone or an email', () => {
    expect(issues({ ...valid, phone: '', email: '' })).toEqual({ phone: 'contactRequired' })
    expect(contactSchema.safeParse({ ...valid, phone: '', email: 'a@b.bg' }).success).toBe(true)
  })

  it('returns message keys for invalid fields', () => {
    expect(
      issues({
        ...valid,
        name: 'М',
        phone: '123',
        email: 'nope',
        message: 'кратко',
        consent: false,
        topic: 'x',
      }),
    ).toEqual({
      name: 'nameLength',
      phone: 'phoneInvalid',
      email: 'emailInvalid',
      message: 'messageLength',
      consent: 'consentRequired',
      topic: 'topicRequired',
    })
  })

  it('enforces the length limits', () => {
    expect(issues({ ...valid, name: 'a'.repeat(81) })).toEqual({ name: 'nameLength' })
    expect(issues({ ...valid, message: 'a'.repeat(2001) })).toEqual({ message: 'messageLength' })
  })

  it('keeps the child age only for the child topic', () => {
    expect(
      contactSchema.parse({ ...valid, topic: 'childAppointment', childAge: '7' }).childAge,
    ).toBe(7)
    expect(
      contactSchema.parse({ ...valid, topic: 'general', childAge: '7' }).childAge,
    ).toBeUndefined()
    expect(
      contactSchema.parse({ ...valid, topic: 'childAppointment', childAge: '' }).childAge,
    ).toBeUndefined()
    expect(issues({ ...valid, topic: 'childAppointment', childAge: '18' })).toEqual({
      childAge: 'childAgeInvalid',
    })
    expect(issues({ ...valid, topic: 'childAppointment', childAge: '2.5' })).toEqual({
      childAge: 'childAgeInvalid',
    })
  })
})

describe('contactFormDataToInput', () => {
  it('reads FormData into the schema shape', () => {
    const form = new FormData()
    for (const [key, value] of Object.entries({ ...valid, consent: 'on', startedAt: '1' })) {
      form.set(key, String(value))
    }
    const data = contactSchema.parse(contactFormDataToInput(form))
    expect(data).toMatchObject({ phone: '+359888123456', consent: true, startedAt: 1 })
    form.delete('consent')
    expect(contactSchema.safeParse(contactFormDataToInput(form)).success).toBe(false)
  })
})

describe('isLikelyBot', () => {
  const now = 10_000_000
  it('flags a filled honeypot', () => {
    expect(isLikelyBot({ website: 'http://spam', startedAt: now - 60_000 }, now)).toBe(true)
  })
  it('flags submissions faster than the minimum fill time or without a start time', () => {
    expect(isLikelyBot({ startedAt: now - MIN_FILL_MS + 1 }, now)).toBe(true)
    expect(isLikelyBot({}, now)).toBe(true)
  })
  it('lets a normal submission through', () => {
    expect(isLikelyBot({ website: '', startedAt: now - MIN_FILL_MS }, now)).toBe(false)
  })
})
