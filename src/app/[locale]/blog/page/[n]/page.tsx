import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { BlogList } from '@/components/site/BlogList'
import { CmsPage } from '@/components/site/CmsPage'
import { locales, type Locale } from '@/config/i18n'
import { blogPageHref, resolveBlogPage } from '@/lib/blog/pagination'
import {
  getArticlePageParams,
  getArticles,
  getPageByKey,
  getSiteSettings,
  type Translations,
} from '@/lib/content'
import { cmsPageMetadata } from '@/lib/seo/buildMetadata'
import { permanentRedirect } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return []
  // `1` is prerendered only to redirect to `/blog`.
  return [{ n: '1' }, ...(await getArticlePageParams(params.locale))]
}

/** The same list page in every locale that has that many pages (hreflang + switcher). */
async function pageTranslations(page: number): Promise<Translations> {
  const counts = await Promise.all(locales.map((l) => getArticles(l)))
  return Object.fromEntries(
    locales.flatMap((l, i) => (counts[i]!.pages >= page ? [[l, blogPageHref(page)]] : [])),
  )
}

async function load(locale: Locale, n: string) {
  const [blogPage, articles] = await Promise.all([
    getPageByKey('blog', locale),
    getArticles(locale),
  ])
  const resolved = resolveBlogPage(n, articles.pages)
  if (resolved.kind === 'redirect') permanentRedirect({ href: '/blog', locale })
  if (resolved.kind !== 'page' || !blogPage) notFound()
  const [list, translations, t] = await Promise.all([
    getArticles(locale, { page: resolved.page }),
    pageTranslations(resolved.page),
    getTranslations('Blog'),
  ])
  const title = t('pageTitle', { title: blogPage.title, page: resolved.page })
  return { blogPage, page: resolved.page, list, translations, title }
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog/page/[n]'>): Promise<Metadata> {
  const { locale, n } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const [{ blogPage, page, translations, title }, settings, t] = await Promise.all([
    load(locale, n),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: 'Blog' }),
  ])
  if (!settings) return {}
  const description = blogPage.seo.description || blogPage.intro
  return cmsPageMetadata(blogPage, locale, settings, {
    translations,
    title,
    seo: { ...blogPage.seo, title: undefined, description: undefined },
    description: description ? t('pageDescription', { description, page }) : undefined,
  })
}

export default async function BlogListPage({ params }: PageProps<'/[locale]/blog/page/[n]'>) {
  const { locale, n } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [{ blogPage, page, list, translations, title }, settings] = await Promise.all([
    load(locale, n),
    getSiteSettings(locale),
  ])
  if (!settings) notFound()

  return (
    <CmsPage
      page={{ ...blogPage, title, intro: undefined, sections: [], translations }}
      locale={locale}
      site={settings}
      fallback="/blog"
    >
      <BlogList
        articles={list.items}
        page={page}
        pages={list.pages}
        locale={locale}
        site={settings}
      />
    </CmsPage>
  )
}
