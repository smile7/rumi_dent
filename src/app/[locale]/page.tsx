import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { CmsPage } from '@/components/site/CmsPage'
import { getPageByKey, getSiteSettings } from '@/lib/content'
import { systemPageMetadata } from '@/lib/seo/buildMetadata'
import { routing } from '@/i18n/routing'

// Static only (ADR-012): locales come from the layout's generateStaticParams; others 404.
export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/[locale]'>): Promise<Metadata> {
  return systemPageMetadata('home', (await params).locale)
}

export default async function Home({ params }: PageProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings] = await Promise.all([
    getPageByKey('home', locale),
    getSiteSettings(locale),
  ])
  if (!page || !settings) notFound()
  return <CmsPage page={page} locale={locale} site={settings} />
}
