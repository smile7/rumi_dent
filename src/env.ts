import { z } from 'zod'
import { createEnvReader } from './lib/env/reader'

const isDevelopment = process.env.NODE_ENV === 'development'

/** Cloudflare Turnstile test keys (always pass). Used as defaults in development only. */
export const TURNSTILE_TEST_SITE_KEY = '1x00000000000000000000AA'
export const TURNSTILE_TEST_SECRET_KEY = '1x0000000000000000000000000000000AA'

const publicShape = {
  NEXT_PUBLIC_SITE_URL: z.url({ protocol: /^https?$/ }),
  NEXT_PUBLIC_ENV: z.enum(['production', 'preview', 'development']).default('development'),
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().min(1),
  NEXT_PUBLIC_SANITY_STUDIO_URL: z.string().min(1).default('/admin'),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1),
  NEXT_PUBLIC_ANALYTICS: z.enum(['none', 'cloudflare', 'umami', 'ga4']).default('none'),
  NEXT_PUBLIC_CF_BEACON_TOKEN: z.string().min(1).optional(),
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_UMAMI_SRC: z.url().optional(),
  NEXT_PUBLIC_GA_ID: z.string().min(1).optional(),
  NEXT_PUBLIC_ENABLE_STYLEGUIDE: z.stringbool().default(false),
}

/**
 * Public (`NEXT_PUBLIC_*`) variables. Each one is referenced literally so Next inlines it into
 * client bundles. Safe to import anywhere.
 *
 * @example const { NEXT_PUBLIC_SITE_URL } = readPublicEnv('NEXT_PUBLIC_SITE_URL')
 */
export const readPublicEnv = createEnvReader('public', publicShape, () => ({
  NEXT_PUBLIC_SITE_URL:
    process.env.NEXT_PUBLIC_SITE_URL || (isDevelopment ? 'http://localhost:3000' : undefined),
  NEXT_PUBLIC_ENV: process.env.NEXT_PUBLIC_ENV,
  NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
  NEXT_PUBLIC_SANITY_STUDIO_URL: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY:
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    (isDevelopment ? TURNSTILE_TEST_SITE_KEY : undefined),
  NEXT_PUBLIC_ANALYTICS: process.env.NEXT_PUBLIC_ANALYTICS,
  NEXT_PUBLIC_CF_BEACON_TOKEN: process.env.NEXT_PUBLIC_CF_BEACON_TOKEN,
  NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
  NEXT_PUBLIC_UMAMI_SRC: process.env.NEXT_PUBLIC_UMAMI_SRC,
  NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
  NEXT_PUBLIC_ENABLE_STYLEGUIDE: process.env.NEXT_PUBLIC_ENABLE_STYLEGUIDE,
}))

/** Variables every build needs. Validated in `next.config.ts` so a bad build fails fast. */
export const BUILD_REQUIRED_PUBLIC_ENV = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_ENV'] as const

/** Read raw by `analyticsConfig()` (no zod on the client), so `next.config.ts` validates them. */
export const ANALYTICS_PUBLIC_ENV = [
  'NEXT_PUBLIC_ANALYTICS',
  'NEXT_PUBLIC_CF_BEACON_TOKEN',
  'NEXT_PUBLIC_UMAMI_WEBSITE_ID',
  'NEXT_PUBLIC_UMAMI_SRC',
  'NEXT_PUBLIC_GA_ID',
] as const
