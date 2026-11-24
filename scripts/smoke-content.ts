/**
 * Prints what the content API returns for every locale, read from the dataset in `.env.local`
 * (published perspective, no token). A quick check that queries and mappers match real content.
 *
 *   pnpm smoke:content
 */
import { registerHooks } from 'node:module'

try {
  process.loadEnvFile('.env.local')
} catch {
  // Variables can be set in the shell instead.
}

// Outside Next there is no request: draft mode is off and `server-only` is a no-op.
const stubs: Record<string, string> = {
  'next/headers': 'export const draftMode = async () => ({ isEnabled: false })',
  'server-only': 'export {}',
}
registerHooks({
  resolve(specifier, context, nextResolve) {
    const stub = stubs[specifier]
    return stub
      ? { url: `data:text/javascript,${encodeURIComponent(stub)}`, shortCircuit: true }
      : nextResolve(specifier, context)
  },
})

const { locales } = await import('@/config/i18n')
const content = await import('@/lib/content')

const count = (label: string, n: number) => `${label} ${n}`

for (const locale of locales) {
  const [
    settings,
    navigation,
    announcement,
    home,
    services,
    articles,
    team,
    faq,
    gallery,
    testimonials,
  ] = await Promise.all([
    content.getSiteSettings(locale),
    content.getNavigation(locale),
    content.getAnnouncement(locale),
    content.getPageByKey('home', locale),
    content.getServices(locale),
    content.getArticles(locale),
    content.getTeam(locale),
    content.getFaq(locale),
    content.getGallery(locale),
    content.getTestimonials(locale),
  ])

  console.log(`\n[${locale}]`)
  console.log(
    `  site:         ${settings?.brandName ?? 'MISSING'} · ${settings?.phones.length ?? 0} phone(s)`,
  )
  console.log(
    `  navigation:   ${navigation ? navigation.header.map((item) => `${item.label} → ${item.href}`).join(', ') : 'MISSING'}`,
  )
  console.log(`  announcement: ${announcement?.message ?? '—'}`)
  console.log(
    `  home:         ${home ? `${home.sections.length} sections (${home.sections.map((s) => s.type).join(', ')})` : 'MISSING'}`,
  )
  console.log(`  hreflang:     ${home ? Object.keys(home.translations).join(', ') : '—'}`)
  console.log(
    `  collections:  ${[
      count('services', services.length),
      count('articles', articles.total),
      count('team', team.length),
      count('faq', faq.length),
      count('gallery', gallery.length),
      count('testimonials', testimonials.length),
    ].join(' · ')}`,
  )

  const [firstService] = services
  const article =
    articles.items[0] && (await content.getArticleBySlug(articles.items[0].slug, locale))
  console.log(
    `  first service: ${firstService ? `${firstService.title} → ${firstService.href}` : '—'}`,
  )
  console.log(
    `  first article: ${article ? `${article.title} · ${article.readingTimeMinutes} min · ${article.related.length} related` : '—'}`,
  )
}

for (const type of ['page', 'service', 'article', 'legalPage'] as const) {
  const slugs = await content.getStaticSlugs(type)
  console.log(`\nstatic ${type}: ${slugs.map((s) => `${s.locale}/${s.slug}`).join(', ') || '—'}`)
}

const sitemap = await content.getSitemapEntries()
console.log(`\nsitemap (${sitemap.length}):`)
for (const entry of sitemap) {
  console.log(
    `  ${entry.path}  ${entry.lastModified}  alternates: ${Object.keys(entry.translations).join(', ')}`,
  )
}
