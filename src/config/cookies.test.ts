import { describe, expect, it } from 'vitest'

import {
  choosableCategories,
  cookiePrefixesFor,
  enabledCookies,
  requiresConsent,
  type CookieContext,
} from './cookies'

const ctx = (analytics: CookieContext['analytics']): CookieContext => ({ analytics })

describe('requiresConsent', () => {
  it.each(['none', 'cloudflare', 'umami'] as const)('is false for %s (cookieless)', (provider) => {
    expect(requiresConsent(ctx(provider))).toBe(false)
  })

  it('is true for ga4', () => {
    expect(requiresConsent(ctx('ga4'))).toBe(true)
  })
})

describe('enabledCookies', () => {
  it('lists only the active analytics provider', () => {
    const ids = (provider: CookieContext['analytics']) =>
      enabledCookies(ctx(provider)).map((entry) => entry.id)
    expect(ids('none')).not.toEqual(expect.arrayContaining(['cfAnalytics']))
    expect(ids('cloudflare')).toContain('cfAnalytics')
    expect(ids('ga4')).toContain('ga4')
    expect(ids('ga4')).not.toContain('umami')
  })

  it('always lists Turnstile as strictly necessary', () => {
    const turnstile = enabledCookies(ctx('none')).find((entry) => entry.id === 'turnstile')
    expect(turnstile?.category).toBe('necessary')
  })
})

describe('choosableCategories', () => {
  it('offers only click-to-load embeds when analytics is cookieless', () => {
    expect(choosableCategories(ctx('cloudflare'))).toEqual(['embeds'])
  })

  it('adds analytics for ga4', () => {
    expect(choosableCategories(ctx('ga4'))).toEqual(['analytics', 'embeds'])
  })
})

describe('cookiePrefixesFor', () => {
  it('returns the GA prefixes when analytics is withdrawn', () => {
    expect(cookiePrefixesFor(['analytics'], ctx('ga4'))).toEqual(['_ga'])
    expect(cookiePrefixesFor(['analytics'], ctx('none'))).toEqual([])
  })
})
