import type { MetadataRoute } from 'next'

import { getSitemapEntries } from '@/lib/content'
import { sitemapFromEntries } from '@/lib/seo/crawl'
import { readPublicEnv } from '@/env'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { NEXT_PUBLIC_SITE_URL } = readPublicEnv('NEXT_PUBLIC_SITE_URL')
  return sitemapFromEntries(NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''), await getSitemapEntries())
}
