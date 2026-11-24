import type { MetadataRoute } from 'next'

import type { SitemapEntry } from '@/lib/content/types'

import { buildAlternates } from './alternates'

const absolute = (siteUrl: string, path: string) => `${siteUrl}${path}`

/** One `<url>` per indexable document and locale, with its hreflang alternates. */
export function sitemapFromEntries(
  siteUrl: string,
  entries: SitemapEntry[],
): MetadataRoute.Sitemap {
  return entries.map((entry) => {
    const { languages } = buildAlternates(entry.locale, entry.translations)
    return {
      url: absolute(siteUrl, entry.path),
      lastModified: entry.lastModified,
      alternates: {
        languages: Object.fromEntries(
          Object.entries(languages).map(([lang, path]) => [lang, absolute(siteUrl, path)]),
        ),
      },
    }
  })
}

type RobotsInput = {
  env: 'production' | 'preview' | 'development'
  siteUrl: string
  blockedBots: readonly string[]
}

const ALWAYS_DISALLOWED = ['/admin', '/api', '/*/styleguide']

/** Production allows everyone except `blockedBots`; every other environment disallows all. */
export function robotsRules({ env, siteUrl, blockedBots }: RobotsInput): MetadataRoute.Robots {
  if (env !== 'production') return { rules: { userAgent: '*', disallow: '/' } }
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: ALWAYS_DISALLOWED },
      ...(blockedBots.length > 0 ? [{ userAgent: [...blockedBots], disallow: '/' }] : []),
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
