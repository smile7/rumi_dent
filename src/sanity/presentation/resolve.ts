import {
  defineDocuments,
  defineLocations,
  type DocumentLocation,
  type DocumentResolver,
  type PresentationPluginOptions,
} from 'sanity/presentation'

import { locales, type Locale } from '../../config/i18n'
import { pathnames, systemPathnames, type InternalPathname } from '../../i18n/pathnames'

/**
 * Public path for an internal pathname, built from the same `pathnames` table next-intl uses
 * (`localePrefix: 'always'`). The Studio can't use next-intl's `getPathname`: the Sanity CLI loads
 * this file outside Next.
 */
export function localizedPath(internal: InternalPathname, locale: Locale, slug?: string): string {
  const entry: string | Record<Locale, string> = pathnames[internal]
  const pattern = typeof entry === 'string' ? entry : entry[locale]
  const path = slug === undefined ? pattern : pattern.replace('[slug]', slug)
  return path === '/' ? `/${locale}` : `/${locale}${path}`
}

const isLocale = (value: unknown): value is Locale => locales.some((locale) => locale === value)
const isSystemKey = (value: unknown): value is keyof typeof systemPathnames =>
  typeof value === 'string' && value in systemPathnames

type RoutableSelection = {
  title?: string | null
  slug?: string | null
  pageKey?: string | null
  hasDetailPage?: boolean | null
  language?: string | null
}

const select = {
  title: 'title',
  slug: 'slug.current',
  pageKey: 'pageKey',
  hasDetailPage: 'hasDetailPage',
  language: 'language',
}

/** Where a routable document appears. Exported for tests. */
export function documentLocations(
  type: 'page' | 'service' | 'article' | 'legalPage',
  doc: RoutableSelection,
): DocumentLocation[] {
  const { slug, language } = doc
  if (!isLocale(language)) return []
  const title = doc.title || slug || type
  const at = (href: string, label = title): DocumentLocation => ({ title: label, href })

  switch (type) {
    case 'page':
      if (isSystemKey(doc.pageKey))
        return [at(localizedPath(systemPathnames[doc.pageKey], language))]
      return slug ? [at(localizedPath('/[slug]', language, slug))] : []
    case 'service': {
      const list = localizedPath('/services', language)
      if (!slug) return []
      return doc.hasDetailPage
        ? [at(localizedPath('/services/[slug]', language, slug)), at(list, 'Services')]
        : [at(`${list}#${slug}`)]
    }
    case 'article':
      return slug
        ? [
            at(localizedPath('/blog/[slug]', language, slug)),
            at(localizedPath('/blog', language), 'Blog'),
          ]
        : []
    case 'legalPage':
      return slug ? [at(localizedPath('/legal/[slug]', language, slug))] : []
  }
}

const locations = Object.fromEntries(
  (['page', 'service', 'article', 'legalPage'] as const).map((type) => [
    type,
    defineLocations({
      select,
      resolve: (doc) => ({ locations: doc ? documentLocations(type, doc) : [] }),
    }),
  ]),
)

/** URL → the document Presentation opens next to the preview. System pages come before `/:slug`. */
export const mainDocuments: DocumentResolver[] = defineDocuments(
  locales.flatMap((locale): DocumentResolver[] => {
    const params = { locale }
    const route = (internal: InternalPathname) => localizedPath(internal, locale, ':slug')
    return [
      ...Object.entries(systemPathnames).map(([pageKey, internal]) => ({
        route: localizedPath(internal, locale),
        filter: `_type == "page" && pageKey == $pageKey && language == $locale`,
        params: { ...params, pageKey },
      })),
      {
        route: route('/services/[slug]'),
        filter: `_type == "service" && slug.current == $slug && language == $locale`,
        params: ({ params: { slug = '' } }) => ({ ...params, slug }),
      },
      {
        route: route('/blog/[slug]'),
        filter: `_type == "article" && slug.current == $slug && language == $locale`,
        params: ({ params: { slug = '' } }) => ({ ...params, slug }),
      },
      {
        route: route('/legal/[slug]'),
        filter: `_type == "legalPage" && slug.current == $slug && language == $locale`,
        params: ({ params: { slug = '' } }) => ({ ...params, slug }),
      },
      {
        route: route('/[slug]'),
        filter: `_type == "page" && !defined(pageKey) && slug.current == $slug && language == $locale`,
        params: ({ params: { slug = '' } }) => ({ ...params, slug }),
      },
    ]
  }),
)

export const resolve: PresentationPluginOptions['resolve'] = { locations, mainDocuments }
