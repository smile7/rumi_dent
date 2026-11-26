import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { ArticleSummary, BlogTeaserSection as BlogTeaserModel } from '@/lib/content'
import { formatDate } from '@/lib/i18n/format'
import { cn } from '@/lib/utils'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

function BlogCard({
  article,
  locale,
  readLabel,
  featured,
}: {
  article: ArticleSummary
  locale: Parameters<typeof formatDate>[0]
  readLabel: string
  featured?: boolean
}) {
  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-xl border border-border/80 bg-surface shadow-sm transition-[box-shadow,transform] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:shadow-md',
        featured && 'lg:min-h-full',
      )}
    >
      {article.cover ? (
        <div
          className={cn('overflow-hidden', featured && 'aspect-16/10 lg:aspect-auto lg:flex-1')}
        >
          <ContentImage
            image={article.cover}
            sizes={
              featured
                ? '(min-width: 1024px) 50vw, 100vw'
                : '(min-width: 768px) 30vw, 100vw'
            }
            className={cn('h-auto w-full object-cover', featured && 'max-h-80 lg:max-h-none lg:min-h-72')}
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <time dateTime={article.publishedAt} className="text-step--1 font-medium text-fg-muted">
          {formatDate(locale, article.publishedAt)}
        </time>
        <Heading as="h3" size={featured ? 'step-2' : 'step-1'}>
          <NextLink
            href={article.href}
            className="text-balance transition-colors duration-(--duration-fast) hover:text-primary"
          >
            {article.title}
          </NextLink>
        </Heading>
        <Text tone="muted" className={cn('text-pretty', featured ? 'line-clamp-4' : 'line-clamp-3')}>
          {article.excerpt}
        </Text>
        <NextLink
          href={article.href}
          className="mt-auto inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
        >
          {readLabel}
        </NextLink>
      </div>
    </article>
  )
}

export async function BlogTeaserSection({
  section: raw,
  index,
  sections,
  locale,
}: SectionComponentProps) {
  const section = raw as BlogTeaserModel
  const t = await getTranslations('Sections')
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const featuredLayout = section.layout === 'featured'
  const [lead, ...rest] = section.articles

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}

      {featuredLayout && lead ? (
        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-8">
          <div className="lg:row-span-2">
            <BlogCard article={lead} locale={locale} readLabel={t('blogRead')} featured />
          </div>
          <ul className="flex flex-col gap-6">
            {rest.map((article) => (
              <li key={article.id}>
                <BlogCard article={article} locale={locale} readLabel={t('blogRead')} />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {section.articles.map((article) => (
            <li key={article.id}>
              <BlogCard article={article} locale={locale} readLabel={t('blogRead')} />
            </li>
          ))}
        </ul>
      )}
    </SectionShell>
  )
}