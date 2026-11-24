import Script from 'next/script'

import { analyticsConfig } from './config'
import { Ga4 } from './Ga4'
import { WebVitals } from './WebVitals'

/**
 * The analytics adapter for this build, chosen by `NEXT_PUBLIC_ANALYTICS` only. The layout leaves
 * it out in draft mode; `/admin` has its own root layout, so it never gets it.
 */
export function Analytics() {
  const config = analyticsConfig()
  switch (config.provider) {
    case 'cloudflare':
      return (
        <Script
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon={JSON.stringify({ token: config.token })}
          strategy="afterInteractive"
        />
      )
    case 'umami':
      return (
        <>
          <Script
            src={config.src}
            data-website-id={config.websiteId}
            data-do-not-track="true"
            strategy="afterInteractive"
          />
          <WebVitals />
        </>
      )
    case 'ga4':
      return (
        <>
          <Ga4 measurementId={config.measurementId} />
          <WebVitals />
        </>
      )
    default:
      return null
  }
}
