import { locales } from '@/config/i18n'
import { getPathname } from '@/i18n/navigation'

import type { SitemapEntry, Translations } from '../../types'
import type { SitemapQueryResult } from '../query-types'
import { clean, mapTranslations, routeHref } from './shared'

/**
 * Sitemap rows → entries. Alternates are limited to translations that are in the sitemap too,
 * so hreflang never points at a `noIndex` or hidden page.
 */
export function mapSitemapEntries(rows: SitemapQueryResult | null | undefined): SitemapEntry[] {
  const entries = (rows ?? []).flatMap((row): SitemapEntry[] => {
    const locale = locales.find((l) => l === clean(row.language))
    const href = routeHref(row)
    if (!locale || !href) return []
    return [
      {
        locale,
        href,
        path: getPathname({ locale, href }),
        lastModified: row._updatedAt,
        translations: mapTranslations(row.translations, row, locale),
      },
    ]
  })

  const indexable = new Set(entries.map((entry) => entry.path))
  return entries.map((entry) => {
    const translations: Translations = {}
    for (const locale of locales) {
      const href = entry.translations[locale]
      if (href && indexable.has(getPathname({ locale, href }))) translations[locale] = href
    }
    return { ...entry, translations }
  })
}
