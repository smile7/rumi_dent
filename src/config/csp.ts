import type { AnalyticsConfig } from '../lib/analytics/config'

/**
 * Security headers and the CSP allowlists (ARCHITECTURE §10), applied by `next.config.ts`.
 * Prerendered pages can't carry nonces and the Next RSC payload scripts change per page and build,
 * so `script-src` keeps `'unsafe-inline'` and the other directives stay strict.
 *
 * Switch to enforcing by setting `CSP_HEADER` to `'Content-Security-Policy'` (NEW-CLIENT §9).
 */
export const CSP_HEADER = 'Content-Security-Policy-Report-Only'

type Directives = Record<string, string[]>

export type AnalyticsHosts = { script: string[]; connect: string[]; img: string[] }

export function analyticsHosts(config: AnalyticsConfig): AnalyticsHosts {
  switch (config.provider) {
    case 'cloudflare':
      return {
        script: ['https://static.cloudflareinsights.com'],
        connect: ['https://cloudflareinsights.com'],
        img: [],
      }
    case 'umami': {
      const origin = new URL(config.src).origin
      return { script: [origin], connect: [origin], img: [] }
    }
    case 'ga4':
      return {
        script: ['https://www.googletagmanager.com'],
        connect: [
          'https://*.google-analytics.com',
          'https://*.analytics.google.com',
          'https://*.googletagmanager.com',
        ],
        img: ['https://*.google-analytics.com', 'https://*.googletagmanager.com'],
      }
    default:
      return { script: [], connect: [], img: [] }
  }
}

/** The Studio origin when it is hosted elsewhere (`https://x.sanity.studio`), else nothing. */
function externalStudioOrigin(studioUrl: string): string[] {
  return /^https?:\/\//.test(studioUrl) ? [new URL(studioUrl).origin] : []
}

function serialize(directives: Directives): string {
  return Object.entries(directives)
    .map(([name, sources]) => [name, ...sources].join(' '))
    .join('; ')
}

export type PublicCspOptions = { analytics: AnalyticsConfig; studioUrl: string }

/** Public pages. `*.api.sanity.io` is only used in draft mode (Presentation). */
export function publicCsp({ analytics, studioUrl }: PublicCspOptions): string {
  const hosts = analyticsHosts(analytics)
  return serialize({
    'default-src': ["'self'"],
    'script-src': [
      "'self'",
      "'unsafe-inline'",
      'https://challenges.cloudflare.com',
      ...hosts.script,
    ],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https://cdn.sanity.io', ...hosts.img],
    'font-src': ["'self'"],
    'connect-src': ["'self'", 'https://*.api.sanity.io', ...hosts.connect],
    'frame-src': ['https://www.google.com/maps/', 'https://challenges.cloudflare.com'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'", ...externalStudioOrigin(studioUrl)],
  })
}

/** The embedded Studio (`/admin`): Sanity APIs and websockets, user avatars from any https host. */
export function adminCsp(): string {
  return serialize({
    'default-src': ["'self'"],
    'script-src': ["'self'", "'unsafe-inline'", 'https://core.sanity-cdn.com'],
    'style-src': ["'self'", "'unsafe-inline'"],
    'img-src': ["'self'", 'data:', 'blob:', 'https:'],
    'font-src': ["'self'", 'data:', 'https:'],
    'connect-src': [
      "'self'",
      'https://*.sanity.io',
      'wss://*.sanity.io',
      'https://*.sanity-cdn.com',
    ],
    'frame-src': ["'self'"],
    'worker-src': ["'self'", 'blob:'],
    'object-src': ["'none'"],
    'base-uri': ["'self'"],
    'form-action': ["'self'"],
    'frame-ancestors': ["'self'"],
  })
}

type Header = { key: string; value: string }
type HeaderRule = { source: string; headers: Header[] }

/** `next.config.ts` `headers()`. The public and `/admin` CSP rules never overlap. */
export function securityHeaders(options: PublicCspOptions): HeaderRule[] {
  const frameOptions = externalStudioOrigin(options.studioUrl).length
    ? []
    : [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }]
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
        },
        ...frameOptions,
      ],
    },
    { source: '/((?!admin(?:/|$)).*)', headers: [{ key: CSP_HEADER, value: publicCsp(options) }] },
    { source: '/admin/:path*', headers: [{ key: CSP_HEADER, value: adminCsp() }] },
  ]
}
