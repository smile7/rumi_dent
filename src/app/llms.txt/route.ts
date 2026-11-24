import { defaultLocale, locales, type Locale } from '@/config/i18n'
import {
  getArticles,
  getPageByKey,
  getPageBySlug,
  getServices,
  getSiteSettings,
  getStaticParams,
  getTeam,
  type Page,
  type SystemPageKey,
} from '@/lib/content'
import { withoutStega } from '@/lib/content/stega'
import { buildLlmsTxt, type LlmsLink, type LlmsSection } from '@/lib/seo/llms'
import { readPublicEnv } from '@/env'
import { getPathname } from '@/i18n/navigation'

// Built once per (publish-triggered) build; never rendered per request.
export const dynamic = 'force-static'

const KEY_PAGES: SystemPageKey[] = ['services', 'about', 'contact', 'gallery', 'blog']
const ALL_ARTICLES = 1000

async function section(locale: Locale, siteUrl: string): Promise<LlmsSection> {
  const absolute = (path: string) => (path.startsWith('/') ? `${siteUrl}${path}` : path)
  const pageLink = (page: Page | null): LlmsLink[] => {
    const href = page?.translations[locale]
    if (!page || href === undefined || page.seo.noIndex || page.hideFromSitemap) return []
    return [
      {
        title: page.title,
        url: absolute(getPathname({ locale, href })),
        description: page.seo.description || page.intro,
      },
    ]
  }
  const slugs = await getStaticParams('page', locale)
  const [services, team, articles, systemPages, slugPages] = await Promise.all([
    getServices(locale),
    getTeam(locale),
    getArticles(locale, { pageSize: ALL_ARTICLES }),
    Promise.all(KEY_PAGES.map((key) => getPageByKey(key, locale))),
    Promise.all(slugs.map(({ slug }) => getPageBySlug(slug, locale))),
  ])
  return {
    locale,
    services: services.map((service) => ({
      title: service.title,
      url: absolute(service.href),
      description: service.teaser,
    })),
    team: team.map((member) => ({
      name: [member.honorific, member.name].filter(Boolean).join(' '),
      role: member.role,
      specialties: member.specialties,
    })),
    pages: [
      ...new Map(
        [...systemPages, ...slugPages].flatMap(pageLink).map((link) => [link.url, link]),
      ).values(),
    ],
    articles: articles.items.map((article) => ({
      title: article.title,
      url: absolute(article.href),
      description: article.excerpt,
    })),
  }
}

export async function GET() {
  const { NEXT_PUBLIC_SITE_URL } = readPublicEnv('NEXT_PUBLIC_SITE_URL')
  const siteUrl = NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  const ordered = [defaultLocale, ...locales.filter((l) => l !== defaultLocale)]
  const [settings, sections] = await Promise.all([
    getSiteSettings(defaultLocale),
    Promise.all(ordered.map((locale) => section(locale, siteUrl))),
  ])
  if (!settings) return new Response('Not found', { status: 404 })
  return new Response(buildLlmsTxt(withoutStega({ settings, sections })), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
