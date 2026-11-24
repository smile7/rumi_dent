import { ArrowLeftIcon, ArrowRightIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Container } from '@/components/primitives/Container'
import { Text } from '@/components/primitives/Text'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import type { SectionSiteContext } from '@/components/sections/types'
import type { Locale } from '@/config/i18n'
import { adjacentBlogPages } from '@/lib/blog/pagination'
import type { ArticleSummary } from '@/lib/content'
import { getPathname, Link } from '@/i18n/navigation'

export type BlogListProps = {
  articles: ArticleSummary[]
  page: number
  pages: number
  locale: Locale
  site: SectionSiteContext
}

const pagerLink =
  'inline-flex min-h-11 items-center gap-2 font-semibold text-link underline underline-offset-4'

/** One page of the article list with prev/next links (`rel` in `<head>` and on the links). */
export async function BlogList({ articles, page, pages, locale, site }: BlogListProps) {
  const t = await getTranslations('Blog')
  const { prev, next } = adjacentBlogPages(page, pages)

  if (articles.length === 0) {
    return (
      <Container className="pb-(--space-section)">
        <Text tone="muted">{t('empty')}</Text>
      </Container>
    )
  }

  return (
    <>
      {prev ? <link rel="prev" href={getPathname({ locale, href: prev })} /> : null}
      {next ? <link rel="next" href={getPathname({ locale, href: next })} /> : null}
      <SectionRenderer
        sections={[
          {
            type: 'blogTeaser',
            key: 'blog-list',
            tone: 'base',
            spacing: 'compact',
            heading: t('listHeading'),
            articles,
          },
        ]}
        locale={locale}
        site={site}
      />
      {pages > 1 ? (
        <nav aria-label={t('paginationLabel')} className="pb-(--space-section)">
          <Container className="flex flex-wrap items-center justify-between gap-4">
            {prev ? (
              <Link href={prev} rel="prev" className={pagerLink}>
                <ArrowLeftIcon aria-hidden="true" className="size-5" />
                {t('newer')}
              </Link>
            ) : (
              <span />
            )}
            <Text size="small" tone="muted">
              {t('pageOf', { page, pages })}
            </Text>
            {next ? (
              <Link href={next} rel="next" className={pagerLink}>
                {t('older')}
                <ArrowRightIcon aria-hidden="true" className="size-5" />
              </Link>
            ) : (
              <span />
            )}
          </Container>
        </nav>
      ) : null}
    </>
  )
}
