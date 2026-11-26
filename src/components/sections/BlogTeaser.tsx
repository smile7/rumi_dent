import { ArrowRightIcon } from 'lucide-react'
import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { BlogTeaserSection as BlogTeaserModel } from '@/lib/content'
import { formatDate } from '@/lib/i18n/format'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

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
  const [featured, ...rest] = section.articles

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}

      {section.articles.length === 0 ? null : (
        <div className="mt-10 grid gap-6 lg:grid-cols-5 lg:grid-rows-1">
          {/* Featured / first article — large editorial card */}
          {featured ? (
            <article className="group flex flex-col overflow-hidden rounded-card bg-surface shadow-md transition-shadow duration-(--duration-base) hover:shadow-lg lg:col-span-3">
              {featured.cover ? (
                <div className="relative overflow-hidden">
                  <ContentImage
                    image={featured.cover}
                    sizes="(min-width: 1024px) 55vw, 100vw"
                    className="h-56 w-full object-cover transition-transform duration-(--duration-slower) ease-standard group-hover:scale-[1.02] sm:h-72"
                  />
                </div>
              ) : null}
              <div className="flex flex-1 flex-col gap-4 p-7">
                <time dateTime={featured.publishedAt} className="text-step--1 text-fg-muted">
                  {formatDate(locale, featured.publishedAt)}
                </time>
                <Heading as="h3" size="step-2">
                  <NextLink
                    href={featured.href}
                    className="text-fg hover:text-primary transition-colors duration-(--duration-fast)"
                  >
                    {featured.title}
                  </NextLink>
                </Heading>
                <Text tone="muted" className="line-clamp-3 leading-relaxed">
                  {featured.excerpt}
                </Text>
                <NextLink
                  href={featured.href}
                  className="mt-auto inline-flex min-h-11 items-center gap-2 font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                  aria-label={`${t('blogRead')}: ${featured.title}`}
                >
                  {t('blogRead')}
                  <ArrowRightIcon aria-hidden="true" className="size-4" />
                </NextLink>
              </div>
            </article>
          ) : null}

          {/* Smaller side cards */}
          {rest.length > 0 ? (
            <ul className="flex flex-col gap-6 lg:col-span-2">
              {rest.slice(0, 2).map((article) => (
                <li key={article.id}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-card border border-border bg-surface transition-shadow duration-(--duration-base) hover:shadow-md">
                    {article.cover ? (
                      <div className="relative overflow-hidden">
                        <ContentImage
                          image={article.cover}
                          sizes="(min-width: 1024px) 25vw, 100vw"
                          className="h-40 w-full object-cover transition-transform duration-(--duration-slower) ease-standard group-hover:scale-[1.02]"
                        />
                      </div>
                    ) : null}
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <time dateTime={article.publishedAt} className="text-step--1 text-fg-muted">
                        {formatDate(locale, article.publishedAt)}
                      </time>
                      <Heading as="h3" size="step-1">
                        <NextLink
                          href={article.href}
                          className="text-fg hover:text-primary transition-colors duration-(--duration-fast)"
                        >
                          {article.title}
                        </NextLink>
                      </Heading>
                      <NextLink
                        href={article.href}
                        className="mt-auto inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4 hover:text-primary-hover"
                        aria-label={`${t('blogRead')}: ${article.title}`}
                      >
                        {t('blogRead')}
                      </NextLink>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </SectionShell>
  )
}
