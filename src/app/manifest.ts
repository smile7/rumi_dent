import type { MetadataRoute } from 'next'

import brandColors from '@/config/brand-colors.json'
import { defaultLocale } from '@/config/i18n'
import { getSiteSettings } from '@/lib/content'
import { withoutStega } from '@/lib/content/stega'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const settings = withoutStega(await getSiteSettings(defaultLocale))
  return {
    ...(settings
      ? {
          name: [settings.brandName, settings.tagline].filter(Boolean).join(' · '),
          short_name: settings.brandName,
          description: settings.seoDefaults.description,
        }
      : {}),
    lang: defaultLocale,
    start_url: '/',
    display: 'browser',
    background_color: brandColors.bg,
    theme_color: brandColors.primary,
    icons: [{ src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' }],
  }
}
