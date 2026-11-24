'use client'

import { usePathname } from 'next/navigation'
import Script from 'next/script'
import { useEffect } from 'react'

import { useConsent } from '@/components/consent/ConsentProvider'

type Ga4Props = { measurementId: string }

/** GA's documented opt-out switch (`window['ga-disable-<id>']`). */
function setGaDisabled(measurementId: string, disabled: boolean) {
  Reflect.set(window, `ga-disable-${measurementId}`, disabled)
}

function ensureGtag(measurementId: string) {
  if (window.gtag) return
  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag() {
    // gtag.js expects the `arguments` object itself, not an array.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer?.push(arguments)
  }
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500,
  })
  window.gtag('js', new Date())
  window.gtag('config', measurementId, { send_page_view: false })
}

/**
 * GA4 in Consent Mode v2 basic mode (LEGAL-GDPR §4): nothing loads before analytics consent.
 * Page views are sent on route changes; withdrawal switches GA off for the rest of the visit.
 */
export function Ga4({ measurementId }: Ga4Props) {
  const granted = useConsent().has('analytics')
  const pathname = usePathname()

  useEffect(() => {
    if (!granted) {
      if (window.gtag) {
        window.gtag('consent', 'update', { analytics_storage: 'denied' })
        setGaDisabled(measurementId, true)
      }
      return
    }
    setGaDisabled(measurementId, false)
    ensureGtag(measurementId)
    window.gtag?.('consent', 'update', { analytics_storage: 'granted' })
  }, [granted, measurementId])

  useEffect(() => {
    if (granted) window.gtag?.('event', 'page_view', { page_location: window.location.href })
  }, [granted, pathname])

  return granted ? (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`}
      strategy="afterInteractive"
    />
  ) : null
}
