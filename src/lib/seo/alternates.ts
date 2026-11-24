import { defaultLocale, localeMeta, locales, type Locale } from '@/config/i18n'
import { getPathname } from '@/i18n/navigation'
import type { PageTranslations } from '@/lib/i18n/translations'

export type Alternates = {
  canonical: string
  /** hreflang → path. Relative paths resolve against `metadataBase`. */
  languages: Record<string, string>
}

/**
 * Canonical + hreflang alternates for the page in `locale`. Only existing translations get an
 * alternate; `x-default` points at the default-locale version when it exists.
 */
export function buildAlternates(locale: Locale, translations: PageTranslations): Alternates {
  const current = translations[locale]
  if (current === undefined) {
    throw new Error(`buildAlternates: the page has no "${locale}" href, so it has no canonical URL`)
  }

  const languages: Record<string, string> = {}
  for (const l of locales) {
    const href = translations[l]
    if (href !== undefined) languages[localeMeta[l].hreflang] = getPathname({ locale: l, href })
  }
  const defaultHref = translations[defaultLocale]
  if (defaultHref !== undefined) {
    languages['x-default'] = getPathname({ locale: defaultLocale, href: defaultHref })
  }

  return { canonical: getPathname({ locale, href: current }), languages }
}
