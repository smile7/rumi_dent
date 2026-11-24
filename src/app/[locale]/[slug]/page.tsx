import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { CmsPage } from '@/components/site/CmsPage'
import { getPageBySlug, getSiteSettings, getStaticParams } from '@/lib/content'
import { cmsPageMetadata } from '@/lib/seo/buildMetadata'
import { reservedSlugs } from '@/lib/slug'
import { routing } from '@/i18n/routing'

// Static only (ADR-012): unknown slugs are a 404; a new page appears after the publish rebuild.
export const dynamicParams = false

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return []
  const slugs = await getStaticParams('page', params.locale)
  return slugs.filter(({ slug }) => !reservedSlugs.has(slug))
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const [page, settings] = await Promise.all([getPageBySlug(slug, locale), getSiteSettings(locale)])
  if (!page || !settings) return {}
  return cmsPageMetadata(page, locale, settings)
}

export default async function GenericPage({ params }: PageProps<'/[locale]/[slug]'>) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings] = await Promise.all([getPageBySlug(slug, locale), getSiteSettings(locale)])
  if (!page || !settings || page.pageKey) notFound()
  return <CmsPage page={page} locale={locale} site={settings} />
}
