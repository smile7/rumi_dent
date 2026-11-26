import { ArrowUpRightIcon } from 'lucide-react'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'

import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Link } from '@/i18n/navigation'
import type { ArticleSummary, BlogTeaserSection as BlogTeaserModel } from '@/lib/content'
import { formatDate } from '@/lib/i18n/format'
import type { Locale } from '@/config/i18n'
import { cn } from '@/lib/utils'

import { SectionHeading } from './SectionHeading'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel, subsectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

type Level = 'h2' | 'h3' | 'h4' | 'h5' | 'h6'

const linkCover =
  'outline-none after:absolute after:inset-0 after:z-10 after:rounded-xl focus-visible:after:outline-2 focus-visible:after:outline-offset-4 focus-visible:after:outline-focus'

function Featured({
  article,
  locale,
  level,
}: {
  article: ArticleSummary
  locale: Locale
  level: Level
}) {
  return (
    <article className="group/post relative flex flex-col gap-6">
      <div className="relative aspect-[16/11] overflow-hidden rounded-xl bg-brand-100">
        {article.cover ? (
          <ContentImage
            image={article.cover}
            sizes="(min-width: 1024px) 44rem, 92vw"
            fill
            className="object-cover transition-transform duration-(--duration-slow) ease-emphasized group-hover/post:scale-[1.04]"
          />
        ) : null}
        <span
          aria-hidden="true"
          className="absolute right-5 bottom-5 grid size-14 place-items-center rounded-pill bg-neutral-0 text-primary shadow-lg transition-transform duration-(--duration-base) ease-emphasized group-hover/post:rotate-45"
        >
          <ArrowUpRightIcon className="size-6" />
        </span>
      </div>
      <div className="flex flex-col gap-3">
        <time dateTime={article.publishedAt} className="eyebrow">
          {formatDate(locale, article.publishedAt)}
        </time>
        <Heading as={level} size="step-3" className="max-w-[24ch] text-balance">
          <NextLink href={article.href} className={linkCover}>
            {article.title}
          </NextLink>
        </Heading>
        <p className="max-w-[40rem] leading-relaxed text-pretty text-fg-muted">{article.excerpt}</p>
      </div>
    </article>
  )
}

function Compact({
  article,
  locale,
  level,
}: {
  article: ArticleSummary
  locale: Locale
  level: Level
}) {
  return (
    <article className="group/post relative grid grid-cols-[7rem_1fr] items-center gap-5 sm:grid-cols-[9rem_1fr]">
      <div className="shape-arch relative aspect-square overflow-hidden bg-accent-100">
        {article.cover ? (
          <ContentImage
            image={article.cover}
            sizes="9rem"
            fill
            className="object-cover transition-transform duration-(--duration-slow) ease-emphasized group-hover/post:scale-[1.06]"
          />
        ) : null}
      </div>
      <div className="flex flex-col gap-2">
        <time dateTime={article.publishedAt} className="text-step--1 text-fg-muted">
          {formatDate(locale, article.publishedAt)}
        </time>
        <Heading
          as={level}
          size="step-1"
          className="text-pretty transition-colors group-hover/post:text-primary"
        >
          <NextLink href={article.href} className={linkCover}>
            {article.title}
          </NextLink>
        </Heading>
        <p className="line-clamp-2 text-step--1 text-fg-muted">{article.excerpt}</p>
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
  const itemLevel = subsectionHeadingLevel(level)
  const [first, ...rest] = section.articles
  if (!first) return null

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      <SectionHeading
        id={titleId}
        level={level}
        heading={section.heading}
        size="step-4"
        aside={
          section.linkToBlog === false ? undefined : (
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 self-start font-bold underline decoration-current/30 underline-offset-[6px] hover:decoration-current md:self-end"
            >
              {t('blogAll')}
              <ArrowUpRightIcon aria-hidden="true" className="size-4" />
            </Link>
          )
        }
      />
      <div
        className={cn(
          'mt-[clamp(2.5rem,1.5rem+3vw,4.5rem)] grid gap-x-14 gap-y-12',
          rest.length > 0 && 'lg:grid-cols-12',
        )}
      >
        <div className={cn(rest.length > 0 && 'lg:col-span-7')}>
          <Featured article={first} locale={locale} level={itemLevel} />
        </div>
        {rest.length > 0 ? (
          <ul className="flex flex-col divide-y divide-border lg:col-span-5 lg:pt-2">
            {rest.map((article) => (
              <li key={article.id} className="py-6 first:pt-0">
                <Compact article={article} locale={locale} level={itemLevel} />
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </SectionShell>
  )
}
