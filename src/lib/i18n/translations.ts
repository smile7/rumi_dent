import { locales, type Locale } from '@/config/i18n'
import type { getPathname } from '@/i18n/navigation'

/** A typed internal href: `'/about'` or `{ pathname: '/services/[slug]', params: { slug } }`. */
export type Href = Parameters<typeof getPathname>[0]['href']

/**
 * The locales a page exists in, with its href in each. Feeds both the hreflang alternates and the
 * language switcher. CMS pages list only their published translations (the content layer builds
 * this map in Phase 04); a missing locale means "not translated".
 */
export type PageTranslations = Partial<Record<Locale, Href>>

/** Static routes exist in every locale under the same internal href. */
export function inAllLocales(href: Href): PageTranslations {
  return Object.fromEntries(locales.map((locale) => [locale, href]))
}
