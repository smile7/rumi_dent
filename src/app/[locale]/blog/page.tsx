import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'

import { BlogList } from '@/components/site/BlogList'
import { CmsPage } from '@/components/site/CmsPage'
import { getArticles, getPageByKey, getSiteSettings } from '@/lib/content'
import { systemPageMetadata } from '@/lib/seo/buildMetadata'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateMetadata({ params }: PageProps<'/[locale]/blog'>): Promise<Metadata> {
  return systemPageMetadata('blog', (await params).locale)
}

export default async function BlogPage({ params }: PageProps<'/[locale]/blog'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings, articles] = await Promise.all([
    getPageByKey('blog', locale),
    getSiteSettings(locale),
    getArticles(locale),
  ])
  if (!page || !settings) notFound()

  return (
    <CmsPage page={page} locale={locale} site={settings}>
      <BlogList
        articles={articles.items}
        page={1}
        pages={articles.pages}
        locale={locale}
        site={settings}
      />
    </CmsPage>
  )
}
