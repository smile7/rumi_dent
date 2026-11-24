import type { NextConfig } from 'next'
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare'
import createNextIntlPlugin from 'next-intl/plugin'
import { securityHeaders } from './src/config/csp'
import { siteRedirects, toNextRedirects } from './src/config/redirects'
import { ANALYTICS_PUBLIC_ENV, BUILD_REQUIRED_PUBLIC_ENV, readPublicEnv } from './src/env'
import { analyticsConfig } from './src/lib/analytics/config'

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

readPublicEnv(...BUILD_REQUIRED_PUBLIC_ENV, ...ANALYTICS_PUBLIC_ENV)
const { NEXT_PUBLIC_SANITY_STUDIO_URL } = readPublicEnv('NEXT_PUBLIC_SANITY_STUDIO_URL')

const nextConfig: NextConfig = {
  poweredByHeader: false,
  trailingSlash: false,
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'cdn.sanity.io' }],
    qualities: [60, 75, 85],
  },
  logging: {
    fetches: { fullUrl: process.env.NODE_ENV === 'development' },
  },
  headers: async () =>
    securityHeaders({ analytics: analyticsConfig(), studioUrl: NEXT_PUBLIC_SANITY_STUDIO_URL }),
  redirects: async () => toNextRedirects(siteRedirects),
  rewrites: async () => [
    // The Studio is one prerendered page; its client router reads the deep-link URL.
    { source: '/admin/:path+', destination: '/admin' },
  ],
}

export default withNextIntl(nextConfig)

initOpenNextCloudflareForDev()
