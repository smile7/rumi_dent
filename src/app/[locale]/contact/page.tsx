import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { CmsPage } from '@/components/site/CmsPage'
import { ContactActions } from '@/components/site/ContactActions'
import { getPageByKey, getSiteSettings } from '@/lib/content'
import { systemPageMetadata } from '@/lib/seo/buildMetadata'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/contact'>): Promise<Metadata> {
  return systemPageMetadata('contact', (await params).locale)
}

export default async function ContactPage({ params }: PageProps<'/[locale]/contact'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings] = await Promise.all([
    getPageByKey('contact', locale),
    getSiteSettings(locale),
  ])
  if (!page || !settings) notFound()
  return (
    <CmsPage
      page={page}
      locale={locale}
      site={settings}
      headerActions={<ContactActions settings={settings} />}
    />
  )
}
