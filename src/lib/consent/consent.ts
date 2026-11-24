import { consentCategories, type ConsentCategory } from '@/config/cookies'

export const CONSENT_COOKIE = 'consent'
/** 6 months (T09.1), then the banner asks again. */
export const CONSENT_MAX_AGE_SECONDS = 60 * 60 * 24 * 182

export type GrantedCategory = Exclude<ConsentCategory, 'necessary'>

export type ConsentRecord = {
  version: number
  categories: GrantedCategory[]
  /** ISO timestamp of the choice. */
  timestamp: string
}

/** Reads the raw `consent` cookie value from a `document.cookie` string. */
export function readConsentCookie(cookieHeader: string): string | null {
  for (const part of cookieHeader.split(';')) {
    const [name, ...rest] = part.trim().split('=')
    if (name === CONSENT_COOKIE) return rest.join('=')
  }
  return null
}

/** A stored choice for the current registry version, or `null` (no choice, unreadable or outdated). */
export function parseConsent(raw: string | null, version: number): ConsentRecord | null {
  if (!raw) return null
  try {
    const value: unknown = JSON.parse(decodeURIComponent(raw))
    if (typeof value !== 'object' || value === null) return null
    const { v, c, t } = value as Record<string, unknown>
    if (v !== version || !Array.isArray(c) || typeof t !== 'string') return null
    const categories = c.filter(
      (category): category is GrantedCategory =>
        category !== 'necessary' && consentCategories.includes(category as ConsentCategory),
    )
    return { version, categories, timestamp: t }
  } catch {
    return null
  }
}

/** The `document.cookie` assignment that stores a choice. */
export function consentCookieString(record: ConsentRecord, secure: boolean): string {
  const value = encodeURIComponent(
    JSON.stringify({ v: record.version, c: record.categories, t: record.timestamp }),
  )
  return [
    `${CONSENT_COOKIE}=${value}`,
    'Path=/',
    `Max-Age=${CONSENT_MAX_AGE_SECONDS}`,
    'SameSite=Lax',
    ...(secure ? ['Secure'] : []),
  ].join('; ')
}

/**
 * `document.cookie` assignments that expire every cookie starting with one of the prefixes, on the
 * host and each parent domain (GA sets `_ga` on the top-level domain).
 */
export function expireCookieStrings(
  cookieHeader: string,
  prefixes: readonly string[],
  hostname: string,
): string[] {
  if (prefixes.length === 0) return []
  const names = cookieHeader
    .split(';')
    .map((part) => part.trim().split('=')[0] ?? '')
    .filter((name) => name && prefixes.some((prefix) => name.startsWith(prefix)))
  const labels = hostname.split('.')
  const domains = [null, ...labels.slice(0, -1).map((_, index) => labels.slice(index).join('.'))]
  return names.flatMap((name) =>
    domains.map((domain) => `${name}=; Path=/; Max-Age=0${domain ? `; Domain=${domain}` : ''}`),
  )
}
