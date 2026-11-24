import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { Container } from '@/components/primitives/Container'
import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Prose } from '@/components/primitives/Prose'
import { Section } from '@/components/primitives/Section'
import { Text } from '@/components/primitives/Text'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { PageJsonLd } from '@/components/seo/JsonLd'
import { AuthorCard } from '@/components/site/AuthorCard'
import { bookingCtaBand } from '@/components/site/booking-cta'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { SetPageTranslations } from '@/components/site/PageTranslations'
import {
  getArticleBySlug,
  getPageByKey,
  getSiteSettings,
  getStaticParams,
  RichText,
  type Section as SectionModel,
} from '@/lib/content'
import { formatDate } from '@/lib/i18n/format'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return []
  return getStaticParams('article', params.locale)
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/blog/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const [article, settings] = await Promise.all([
    getArticleBySlug(slug, locale),
    getSiteSettings(locale),
  ])
  if (!article || !settings) return {}
  return buildMetadata({
    locale,
    settings,
    translations: article.translations,
    title: article.title,
    description: article.excerpt,
    seo: article.seo,
    image: article.cover,
    article: {
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt,
      authors: article.author ? [article.author.name] : [],
    },
  })
}

export default async function ArticlePage({ params }: PageProps<'/[locale]/blog/[slug]'>) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [article, settings, blogPage, t, tCrumbs, tCta] = await Promise.all([
    getArticleBySlug(slug, locale),
    getSiteSettings(locale),
    getPageByKey('blog', locale),
    getTranslations('Blog'),
    getTranslations('Breadcrumbs'),
    getTranslations('BookingCta'),
  ])
  if (!article || !settings) notFound()

  const closing: SectionModel[] = [
    ...(article.related.length > 0
      ? [
          {
            type: 'blogTeaser' as const,
            key: 'related-articles',
            tone: 'soft' as const,
            spacing: 'default' as const,
            heading: t('related'),
            articles: article.related,
          },
        ]
      : []),
    bookingCtaBand(settings, {
      heading: tCta('heading'),
      book: tCta('book'),
      call: tCta('call'),
    }),
  ]
  const reviewer = article.reviewedBy
    ? [article.reviewedBy.honorific, article.reviewedBy.name].filter(Boolean).join(' ')
    : null

  return (
    <>
      <SetPageTranslations translations={article.translations} fallback="/blog" />
      <article>
        <Section as="div" spacing="compact">
          <Container width="prose">
            <Breadcrumbs
              label={tCrumbs('label')}
              items={[
                { label: tCrumbs('home'), href: '/' },
                { label: blogPage?.title ?? tCrumbs('blog'), href: '/blog' },
                { label: article.title },
              ]}
            />
            <Heading as="h1" size="step-4" className="text-balance">
              {article.title}
            </Heading>
            <Text size="small" tone="muted" className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
              <time dateTime={article.publishedAt}>
                {formatDate(locale, article.publishedAt, settings.timeZone)}
              </time>
              {article.updatedAt && article.updatedAt > article.publishedAt ? (
                <span>
                  {t('updated')}{' '}
                  <time dateTime={article.updatedAt}>
                    {formatDate(locale, article.updatedAt, settings.timeZone)}
                  </time>
                </span>
              ) : null}
              <span>{t('readingTime', { minutes: article.readingTimeMinutes })}</span>
            </Text>
          </Container>
          {article.cover ? (
            <Container width="content" className="mt-8">
              <ContentImage
                image={article.cover}
                sizes="(min-width: 1280px) 1200px, 100vw"
                preload
                className="h-auto w-full rounded-media"
              />
            </Container>
          ) : null}
        </Section>

        <Section spacing="compact">
          <Container width="prose" className="flex flex-col gap-10">
            <Prose>
              <RichText value={article.body} />
            </Prose>
            {article.author ? (
              <AuthorCard
                heading={t('aboutAuthor')}
                author={article.author}
                reviewNote={reviewer ? t('reviewedBy', { name: reviewer }) : undefined}
              />
            ) : null}
          </Container>
        </Section>
      </article>

      <SectionRenderer sections={closing} locale={locale} site={settings} />
      <PageJsonLd
        locale={locale}
        settings={settings}
        name={article.title}
        description={article.seo.description || article.excerpt}
        translations={article.translations}
        parents={[{ name: blogPage?.title ?? tCrumbs('blog'), href: '/blog' }]}
        article={article}
      />
    </>
  )
}
