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
}: PageProps<'/[locale]/about'>): Promise<Metadata> {
  return systemPageMetadata('about', (await params).locale)
}

export default async function AboutPage({ params }: PageProps<'/[locale]/about'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings] = await Promise.all([
    getPageByKey('about', locale),
    getSiteSettings(locale),
  ])
  if (!page || !settings) notFound()
  return <CmsPage page={page} locale={locale} site={settings} />
}
