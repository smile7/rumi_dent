import type { MetadataRoute } from 'next'

import { blockedBots } from '@/config/site'
import { robotsRules } from '@/lib/seo/crawl'
import { readPublicEnv } from '@/env'

export default function robots(): MetadataRoute.Robots {
  const { NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_ENV } = readPublicEnv(
    'NEXT_PUBLIC_SITE_URL',
    'NEXT_PUBLIC_ENV',
  )
  return robotsRules({
    env: NEXT_PUBLIC_ENV,
    siteUrl: NEXT_PUBLIC_SITE_URL.replace(/\/$/, ''),
    blockedBots,
  })
}
