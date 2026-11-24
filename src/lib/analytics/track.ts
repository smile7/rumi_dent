import { analyticsConfig } from './config'

export type AnalyticsEvent =
  | 'call_click'
  | 'directions_click'
  | 'booking_click'
  | 'form_submit_success'
  | 'viber_click'
  | 'whatsapp_click'
  | 'web_vital'

export type AnalyticsProps = Record<string, string | number | boolean>

declare global {
  interface Window {
    umami?: { track: (event: string, props?: AnalyticsProps) => void }
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}

/**
 * Analytics entry point (PRD F-11). Sends to Umami or GA4; a no-op for `none` and `cloudflare`
 * (the beacon has no custom events), before the script loaded, and for GA4 until analytics consent
 * (`gtag` only exists after it).
 */
export function track(event: AnalyticsEvent, props?: AnalyticsProps): void {
  if (typeof window === 'undefined') return
  if (process.env.NODE_ENV === 'development') console.debug('[track]', event, props ?? {})
  const { provider } = analyticsConfig()
  if (provider === 'umami') window.umami?.track(event, props)
  else if (provider === 'ga4') window.gtag?.('event', event, props ?? {})
}
