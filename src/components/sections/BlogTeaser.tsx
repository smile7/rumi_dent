import { ContentImage } from '@/components/primitives/ContentImage'
import { SectionTitle } from '@/components/primitives/SectionTitle'
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

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <SectionTitle as={level} id={titleId}>
          {section.heading}
        </SectionTitle>
      ) : null}
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {section.articles.map((article) => (
          <li key={article.id}>
            <article className="flex h-full flex-col overflow-hidden rounded-card border-2 border-border/70 bg-surface shadow-sm transition-[box-shadow,transform] duration-(--duration-base) ease-standard hover:-translate-y-1 hover:shadow-md motion-reduce:hover:translate-y-0">
              {article.cover ? (
                <ContentImage
                  image={article.cover}
                  sizes="(min-width: 768px) 30vw, 100vw"
                  className="h-auto w-full"
                />
              ) : null}
              <div className="flex flex-1 flex-col gap-3 p-6">
                <time dateTime={article.publishedAt} className="text-step--1 text-fg-muted">
                  {formatDate(locale, article.publishedAt)}
                </time>
                <Heading as="h3" size="step-1">
                  <NextLink href={article.href} className="hover:text-primary">
                    {article.title}
                  </NextLink>
                </Heading>
                <Text tone="muted" className="line-clamp-3">
                  {article.excerpt}
                </Text>
                <NextLink
                  href={article.href}
                  className="mt-auto inline-flex min-h-11 items-center font-semibold text-link underline underline-offset-4"
                >
                  {t('blogRead')}
                </NextLink>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </SectionShell>
  )
}