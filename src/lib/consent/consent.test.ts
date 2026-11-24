import { describe, expect, it } from 'vitest'

import {
  consentCookieString,
  expireCookieStrings,
  parseConsent,
  readConsentCookie,
  type ConsentRecord,
} from './consent'

const record: ConsentRecord = {
  version: 1,
  categories: ['analytics'],
  timestamp: '2026-11-22T10:00:00.000Z',
}

function rawValue(cookieString: string) {
  return readConsentCookie(cookieString.split(';')[0] ?? '')
}

describe('consent cookie', () => {
  it('round-trips a choice', () => {
    expect(parseConsent(rawValue(consentCookieString(record, true)), 1)).toEqual(record)
  })

  it('sets 6 months, SameSite=Lax and Secure on https', () => {
    const value = consentCookieString(record, true)
    expect(value).toContain('Max-Age=15724800')
    expect(value).toContain('SameSite=Lax')
    expect(value).toContain('Secure')
    expect(consentCookieString(record, false)).not.toContain('Secure')
  })

  it('ignores an outdated version, so the banner asks again', () => {
    expect(parseConsent(rawValue(consentCookieString(record, true)), 2)).toBeNull()
  })

  it('ignores unreadable values and unknown categories', () => {
    expect(parseConsent('not-json', 1)).toBeNull()
    expect(parseConsent(null, 1)).toBeNull()
    const raw = encodeURIComponent(
      JSON.stringify({ v: 1, c: ['necessary', 'x', 'embeds'], t: 'x' }),
    )
    expect(parseConsent(raw, 1)?.categories).toEqual(['embeds'])
  })

  it('reads the consent cookie among others', () => {
    expect(readConsentCookie('NEXT_LOCALE=bg; consent=abc; _ga=1')).toBe('abc')
    expect(readConsentCookie('NEXT_LOCALE=bg')).toBeNull()
  })
})

describe('expireCookieStrings', () => {
  it('expires matching cookies on the host and each parent domain', () => {
    expect(expireCookieStrings('_ga=1; NEXT_LOCALE=bg; _ga_ABC=2', ['_ga'], 'www.rumi.bg')).toEqual(
      [
        '_ga=; Path=/; Max-Age=0',
        '_ga=; Path=/; Max-Age=0; Domain=www.rumi.bg',
        '_ga=; Path=/; Max-Age=0; Domain=rumi.bg',
        '_ga_ABC=; Path=/; Max-Age=0',
        '_ga_ABC=; Path=/; Max-Age=0; Domain=www.rumi.bg',
        '_ga_ABC=; Path=/; Max-Age=0; Domain=rumi.bg',
      ],
    )
  })

  it('does nothing without prefixes', () => {
    expect(expireCookieStrings('_ga=1', [], 'rumi.bg')).toEqual([])
  })
})
