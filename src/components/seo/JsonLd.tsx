import { getTranslations } from 'next-intl/server'

import type { Locale } from '@/config/i18n'
import type { SiteSettings } from '@/lib/content'
import { pageGraph, type PageGraphInput } from '@/lib/seo/jsonld/graph'
import { serializeJsonLd } from '@/lib/seo/jsonld/serialize'
import type { Crumb } from '@/lib/seo/jsonld/webPage'
import { readPublicEnv } from '@/env'

export type JsonLdProps = { data: object }

/** The only way to emit JSON-LD: everything goes through `serializeJsonLd` (stega-free). */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  )
}

export type PageJsonLdProps = Omit<PageGraphInput, 'breadcrumbs'> & {
  locale: Locale
  settings: SiteSettings
  home?: boolean
  /** Breadcrumb levels between home and this page (e.g. the services page). */
  parents?: Crumb[]
}

/** The page's single `@graph` (SEO.md §2). Render once per page. */
export async function PageJsonLd({
  locale,
  settings,
  home,
  parents = [],
  ...input
}: PageJsonLdProps) {
  const { NEXT_PUBLIC_SITE_URL } = readPublicEnv('NEXT_PUBLIC_SITE_URL')
  const t = await getTranslations({ locale, namespace: 'Breadcrumbs' })
  const current = input.translations[locale]
  const breadcrumbs: Crumb[] =
    home || current === undefined
      ? []
      : [{ name: t('home'), href: '/' }, ...parents, { name: input.name, href: current }]
  const graph = pageGraph(
    { siteUrl: NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''), locale, settings },
    { ...input, breadcrumbs },
  )
  return <JsonLd data={graph} />
}
