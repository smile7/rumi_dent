import { analyticsConfig, type AnalyticsProvider } from '@/lib/analytics/config'

/**
 * Cookie and storage registry (LEGAL-GDPR §3): the single source for the consent banner, the
 * preferences dialog and the cookie policy table. Bump the version when an entry that needs
 * consent is added or changes purpose: every visitor is asked again.
 */
export const cookieRegistryVersion = 1

export const consentCategories = [
  'necessary',
  'preferences',
  'analytics',
  'marketing',
  'embeds',
] as const
export type ConsentCategory = (typeof consentCategories)[number]

export type CookieContext = { analytics: AnalyticsProvider }

export type CookieEntry = {
  /** Message key under `Cookies.items` (purpose + duration, both locales). */
  id:
    | 'locale'
    | 'consent'
    | 'announcement'
    | 'preview'
    | 'turnstile'
    | 'cfAnalytics'
    | 'umami'
    | 'ga4'
    | 'googleMaps'
  /** What appears in the "Name" column. */
  name: string
  /** Message key under `Cookies.providers`. */
  provider: 'firstParty' | 'cloudflare' | 'umami' | 'google'
  category: ConsentCategory
  /** `none`: nothing is stored on the device (ePrivacy art. 5(3) doesn't apply). */
  storage: 'cookie' | 'localStorage' | 'sessionStorage' | 'none'
  /** Click-to-load embeds ask at the embed itself, so they never trigger the banner. */
  askedAtEmbed?: true
  /** Cookie name prefixes deleted when consent for the category is withdrawn. */
  deletePrefixes?: string[]
  enabledWhen?: (context: CookieContext) => boolean
}

export const cookieRegistry: readonly CookieEntry[] = [
  {
    id: 'locale',
    name: 'NEXT_LOCALE',
    provider: 'firstParty',
    category: 'necessary',
    storage: 'cookie',
  },
  {
    id: 'consent',
    name: 'consent',
    provider: 'firstParty',
    category: 'necessary',
    storage: 'cookie',
  },
  {
    id: 'announcement',
    name: 'announcement-dismissed:*',
    provider: 'firstParty',
    category: 'necessary',
    storage: 'sessionStorage',
  },
  {
    id: 'preview',
    name: '__prerender_bypass, __next_preview_data',
    provider: 'firstParty',
    category: 'necessary',
    storage: 'cookie',
  },
  // Cloudflare's Turnstile Privacy Addendum calls its signals strictly necessary (LEGAL-GDPR §1).
  {
    id: 'turnstile',
    name: 'Cloudflare Turnstile',
    provider: 'cloudflare',
    category: 'necessary',
    storage: 'none',
  },
  {
    id: 'cfAnalytics',
    name: 'Cloudflare Web Analytics',
    provider: 'cloudflare',
    category: 'analytics',
    storage: 'none',
    enabledWhen: ({ analytics }) => analytics === 'cloudflare',
  },
  {
    id: 'umami',
    name: 'Umami',
    provider: 'umami',
    category: 'analytics',
    storage: 'none',
    enabledWhen: ({ analytics }) => analytics === 'umami',
  },
  {
    id: 'ga4',
    name: '_ga, _ga_*',
    provider: 'google',
    category: 'analytics',
    storage: 'cookie',
    deletePrefixes: ['_ga'],
    enabledWhen: ({ analytics }) => analytics === 'ga4',
  },
  {
    id: 'googleMaps',
    name: 'Google Maps (NID, …)',
    provider: 'google',
    category: 'embeds',
    storage: 'cookie',
    askedAtEmbed: true,
  },
]

export function currentCookieContext(): CookieContext {
  return { analytics: analyticsConfig().provider }
}

export function enabledCookies(context: CookieContext = currentCookieContext()): CookieEntry[] {
  return cookieRegistry.filter((entry) => entry.enabledWhen?.(context) ?? true)
}

function needsConsent(entry: CookieEntry): boolean {
  return entry.category !== 'necessary' && entry.storage !== 'none'
}

/** True when an enabled entry stores something non-essential without asking at the embed: show the banner. */
export function requiresConsent(context: CookieContext = currentCookieContext()): boolean {
  return enabledCookies(context).some((entry) => needsConsent(entry) && !entry.askedAtEmbed)
}

/** Categories the visitor can switch in the preferences dialog (necessary is always shown, locked). */
export function choosableCategories(
  context: CookieContext = currentCookieContext(),
): Exclude<ConsentCategory, 'necessary'>[] {
  const used = new Set(
    enabledCookies(context)
      .filter(needsConsent)
      .map((entry) => entry.category),
  )
  return consentCategories.filter(
    (category): category is Exclude<ConsentCategory, 'necessary'> =>
      category !== 'necessary' && used.has(category),
  )
}

/** Cookie name prefixes to delete when these categories are withdrawn. */
export function cookiePrefixesFor(
  categories: readonly ConsentCategory[],
  context: CookieContext = currentCookieContext(),
): string[] {
  return enabledCookies(context)
    .filter((entry) => categories.includes(entry.category))
    .flatMap((entry) => entry.deletePrefixes ?? [])
}
