import { afterEach, describe, expect, it, vi } from 'vitest'

import { track } from './track'

function stubWindow() {
  const umami = { track: vi.fn() }
  const gtag = vi.fn()
  vi.stubGlobal('window', { umami, gtag })
  return { umami, gtag }
}

afterEach(() => {
  vi.unstubAllGlobals()
  vi.unstubAllEnvs()
})

describe('track', () => {
  it('sends custom events to Umami', () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS', 'umami')
    vi.stubEnv('NEXT_PUBLIC_UMAMI_WEBSITE_ID', 'id')
    vi.stubEnv('NEXT_PUBLIC_UMAMI_SRC', 'https://cloud.umami.is/script.js')
    const { umami, gtag } = stubWindow()
    track('booking_click', { mode: 'phone' })
    expect(umami.track).toHaveBeenCalledWith('booking_click', { mode: 'phone' })
    expect(gtag).not.toHaveBeenCalled()
  })

  it('sends events to GA4 through gtag', () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS', 'ga4')
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-TEST')
    const { gtag } = stubWindow()
    track('call_click')
    expect(gtag).toHaveBeenCalledWith('event', 'call_click', {})
  })

  it('is a no-op for GA4 before consent (no gtag yet)', () => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS', 'ga4')
    vi.stubEnv('NEXT_PUBLIC_GA_ID', 'G-TEST')
    vi.stubGlobal('window', {})
    expect(() => track('call_click')).not.toThrow()
  })

  it.each(['none', 'cloudflare'] as const)('sends nothing with %s', (provider) => {
    vi.stubEnv('NEXT_PUBLIC_ANALYTICS', provider)
    vi.stubEnv('NEXT_PUBLIC_CF_BEACON_TOKEN', 'token')
    const { umami, gtag } = stubWindow()
    track('call_click')
    expect(umami.track).not.toHaveBeenCalled()
    expect(gtag).not.toHaveBeenCalled()
  })

  it('is a no-op on the server', () => {
    expect(() => track('call_click')).not.toThrow()
  })
})
