import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { CmsPage } from '@/components/site/CmsPage'
import { getPageByKey, getSiteSettings } from '@/lib/content'
import { systemPageMetadata } from '@/lib/seo/buildMetadata'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/gallery'>): Promise<Metadata> {
  return systemPageMetadata('gallery', (await params).locale)
}

export default async function GalleryPage({ params }: PageProps<'/[locale]/gallery'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings] = await Promise.all([
    getPageByKey('gallery', locale),
    getSiteSettings(locale),
  ])
  if (!page || !settings) notFound()
  return <CmsPage page={page} locale={locale} site={settings} />
}
