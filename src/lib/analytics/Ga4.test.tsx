import { render } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConsentProvider } from '@/components/consent/ConsentProvider'
import { consentCookieString } from '@/lib/consent/consent'
import { catalogs } from '@/test/messages'
import { NextIntlClientProvider } from 'next-intl'

import { Ga4 } from './Ga4'

vi.mock('next/navigation', () => ({ usePathname: () => '/bg' }))

function renderGa4() {
  return render(
    <NextIntlClientProvider locale="bg" messages={catalogs.bg}>
      <ConsentProvider>
        <Ga4 measurementId="G-TEST" />
      </ConsentProvider>
    </NextIntlClientProvider>,
  )
}

afterEach(() => {
  document.cookie = 'consent=; Path=/; Max-Age=0'
  delete window.gtag
  delete window.dataLayer
})

describe('Ga4', () => {
  it('loads nothing without analytics consent', () => {
    renderGa4()
    expect(window.gtag).toBeUndefined()
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull()
  })

  it('sets Consent Mode defaults to denied, then grants analytics and sends a page view', () => {
    document.cookie = consentCookieString(
      { version: 1, categories: ['analytics'], timestamp: '2026-11-22T10:00:00.000Z' },
      false,
    )
    renderGa4()
    const calls = (window.dataLayer ?? []).map((args) => Array.from(args as ArrayLike<unknown>))
    expect(calls[0]).toEqual([
      'consent',
      'default',
      {
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied',
        analytics_storage: 'denied',
        wait_for_update: 500,
      },
    ])
    expect(calls).toContainEqual(['config', 'G-TEST', { send_page_view: false }])
    expect(calls).toContainEqual(['consent', 'update', { analytics_storage: 'granted' }])
    expect(calls.at(-1)).toEqual(['event', 'page_view', { page_location: window.location.href }])
  })
})
