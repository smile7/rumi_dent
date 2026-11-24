import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { Container } from '@/components/primitives/Container'
import { Prose } from '@/components/primitives/Prose'
import { Section } from '@/components/primitives/Section'
import { Text } from '@/components/primitives/Text'
import { PageJsonLd } from '@/components/seo/JsonLd'
import { PageHeader } from '@/components/site/PageHeader'
import { SetPageTranslations } from '@/components/site/PageTranslations'
import { readPublicEnv } from '@/env'
import { routing } from '@/i18n/routing'
import { getLegalPage, getSiteSettings, getStaticParams, RichText } from '@/lib/content'
import { formatDate } from '@/lib/i18n/format'
import { buildMetadata } from '@/lib/seo/buildMetadata'

export const dynamicParams = false

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return []
  return getStaticParams('legalPage', params.locale)
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/legal/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const [page, settings] = await Promise.all([getLegalPage(slug, locale), getSiteSettings(locale)])
  if (!page || !settings) return {}
  return buildMetadata({
    locale,
    settings,
    translations: page.translations,
    title: page.title,
    description: page.excerpt,
  })
}

export default async function LegalPage({ params }: PageProps<'/[locale]/legal/[slug]'>) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings, t] = await Promise.all([
    getLegalPage(slug, locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: 'Legal' }),
  ])
  if (!page || !settings) notFound()

  const { lastUpdated } = page
  const showPlaceholderWarning =
    page.placeholders.length > 0 &&
    readPublicEnv('NEXT_PUBLIC_ENV').NEXT_PUBLIC_ENV !== 'production'

  return (
    <>
      <SetPageTranslations translations={page.translations} fallback="/" />
      <PageHeader title={page.title}>
        {lastUpdated ? (
          <Text tone="muted" className="mt-4">
            {t.rich('lastUpdated', {
              date: () => (
                <time dateTime={lastUpdated}>
                  {formatDate(locale, lastUpdated, settings.timeZone)}
                </time>
              ),
            })}
          </Text>
        ) : null}
      </PageHeader>

      <Section spacing="compact" className="pt-0">
        <Container width="prose" className="flex flex-col gap-8">
          {showPlaceholderWarning ? (
            <div
              role="note"
              className="rounded-card border-s-4 border-warning bg-surface-muted p-4"
            >
              <p className="font-semibold">{t('placeholderWarning')}</p>
              <p className="mt-1 text-step--1 break-words">{page.placeholders.join(', ')}</p>
            </div>
          ) : null}
          {page.toc.length > 1 ? (
            <nav aria-label={t('tocLabel')} className="print:hidden">
              <ol className="flex list-decimal flex-col gap-1 ps-6">
                {page.toc.map((entry) => (
                  <li key={entry.id}>
                    <a
                      href={`#${entry.id}`}
                      className="inline-flex min-h-6 items-center text-link underline underline-offset-4"
                    >
                      {entry.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <Prose>
            <RichText value={page.body} anchorHeadings />
          </Prose>
        </Container>
      </Section>
      <PageJsonLd
        locale={locale}
        settings={settings}
        name={page.title}
        description={page.excerpt}
        translations={page.translations}
      />
    </>
  )
}
