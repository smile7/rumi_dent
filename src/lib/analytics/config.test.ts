import { describe, expect, it } from 'vitest'

import { resolveAnalytics } from './config'

describe('resolveAnalytics', () => {
  it('defaults to none', () => {
    expect(resolveAnalytics({ NEXT_PUBLIC_ANALYTICS: 'none' })).toEqual({ provider: 'none' })
  })

  it('picks each provider from env with its ID', () => {
    expect(
      resolveAnalytics({ NEXT_PUBLIC_ANALYTICS: 'cloudflare', NEXT_PUBLIC_CF_BEACON_TOKEN: 't' }),
    ).toEqual({ provider: 'cloudflare', token: 't' })
    expect(
      resolveAnalytics({
        NEXT_PUBLIC_ANALYTICS: 'umami',
        NEXT_PUBLIC_UMAMI_WEBSITE_ID: 'id',
        NEXT_PUBLIC_UMAMI_SRC: 'https://cloud.umami.is/script.js',
      }),
    ).toEqual({ provider: 'umami', websiteId: 'id', src: 'https://cloud.umami.is/script.js' })
    expect(resolveAnalytics({ NEXT_PUBLIC_ANALYTICS: 'ga4', NEXT_PUBLIC_GA_ID: 'G-1' })).toEqual({
      provider: 'ga4',
      measurementId: 'G-1',
    })
  })

  it('falls back to none when the provider ID is missing', () => {
    expect(resolveAnalytics({ NEXT_PUBLIC_ANALYTICS: 'cloudflare' })).toEqual({ provider: 'none' })
    expect(
      resolveAnalytics({ NEXT_PUBLIC_ANALYTICS: 'umami', NEXT_PUBLIC_UMAMI_WEBSITE_ID: 'id' }),
    ).toEqual({
      provider: 'none',
    })
    expect(resolveAnalytics({ NEXT_PUBLIC_ANALYTICS: 'ga4' })).toEqual({ provider: 'none' })
  })
})
