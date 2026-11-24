import type { Metadata } from 'next'
import NextLink from 'next/link'
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
import { bookingCtaBand } from '@/components/site/booking-cta'
import { Breadcrumbs } from '@/components/site/Breadcrumbs'
import { SetPageTranslations } from '@/components/site/PageTranslations'
import { badgeVariants } from '@/components/ui/badge'
import {
  getPageByKey,
  getServiceBySlug,
  getServices,
  getSiteSettings,
  getStaticParams,
  RichText,
  type FaqSection,
} from '@/lib/content'
import { buildMetadata } from '@/lib/seo/buildMetadata'
import { cn } from '@/lib/utils'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

export async function generateStaticParams({ params }: { params: { locale: string } }) {
  if (!hasLocale(routing.locales, params.locale)) return []
  return getStaticParams('service', params.locale)
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/services/[slug]'>): Promise<Metadata> {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) return {}
  const [service, settings] = await Promise.all([
    getServiceBySlug(slug, locale),
    getSiteSettings(locale),
  ])
  if (!service || !settings) return {}
  return buildMetadata({
    locale,
    settings,
    translations: service.translations,
    title: service.title,
    description: service.teaser,
    seo: service.seo,
    image: service.image,
  })
}

export default async function ServicePage({ params }: PageProps<'/[locale]/services/[slug]'>) {
  const { locale, slug } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [service, settings, servicesPage, t, tCrumbs, tCta] = await Promise.all([
    getServiceBySlug(slug, locale),
    getSiteSettings(locale),
    getPageByKey('services', locale),
    getTranslations('Services'),
    getTranslations('Breadcrumbs'),
    getTranslations('BookingCta'),
  ])
  if (!service || !settings) notFound()

  const related = service.category
    ? (await getServices(locale, { category: service.category.id })).filter(
        (item) => item.id !== service.id,
      )
    : []
  const audience = service.category?.audience

  const faq: FaqSection | null =
    service.faq.length > 0
      ? {
          type: 'faq',
          key: 'service-faq',
          tone: 'soft',
          spacing: 'default',
          heading: t('faqHeading'),
          items: service.faq,
          emitSchema: true,
        }
      : null
  const cta = bookingCtaBand(settings, {
    heading: tCta('heading'),
    book: tCta('book'),
    call: tCta('call'),
  })

  return (
    <>
      <SetPageTranslations translations={service.translations} fallback="/services" />
      <Section as="div" spacing="compact">
        <Container>
          <Breadcrumbs
            label={tCrumbs('label')}
            items={[
              { label: tCrumbs('home'), href: '/' },
              { label: servicesPage?.title ?? tCrumbs('services'), href: '/services' },
              { label: service.title },
            ]}
          />
          <div
            className={cn('grid items-center gap-10', service.image && 'lg:grid-cols-2 lg:gap-12')}
          >
            <div>
              {audience === 'children' || audience === 'adults' ? (
                <span className={cn(badgeVariants({ variant: 'soft' }), 'mb-4')}>
                  {t(audience)}
                </span>
              ) : null}
              <Heading as="h1" size="step-4" className="text-balance">
                {service.title}
              </Heading>
              {service.teaser ? (
                <Text size="lead" className="mt-4 max-w-(--container-prose) text-pretty">
                  {service.teaser}
                </Text>
              ) : null}
            </div>
            {service.image ? (
              <ContentImage
                image={service.image}
                sizes="(min-width: 1024px) 45vw, 100vw"
                preload
                className="h-auto w-full rounded-media"
              />
            ) : null}
          </div>
        </Container>
      </Section>

      {service.body ? (
        <Section spacing="compact">
          <Container>
            <Prose>
              <RichText value={service.body} />
            </Prose>
          </Container>
        </Section>
      ) : null}

      {faq ? <SectionRenderer sections={[faq]} locale={locale} site={settings} /> : null}

      {related.length > 0 ? (
        <Section spacing="compact" labelledBy="related-services">
          <Container>
            <Heading as="h2" size="step-3" id="related-services">
              {t('relatedHeading')}
            </Heading>
            <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <NextLink
                    href={item.href}
                    className="flex h-full min-h-11 flex-col gap-2 rounded-tile border border-border bg-surface p-5 shadow-sm transition-shadow duration-(--duration-fast) ease-standard hover:shadow-md"
                  >
                    <span className="font-display text-step-1 font-bold">{item.title}</span>
                    {item.teaser ? (
                      <span className="text-step--1 text-fg-muted">{item.teaser}</span>
                    ) : null}
                  </NextLink>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      ) : null}

      <SectionRenderer sections={[cta]} locale={locale} site={settings} />
      <PageJsonLd
        locale={locale}
        settings={settings}
        name={service.title}
        description={service.seo.description || service.teaser}
        translations={service.translations}
        parents={[{ name: servicesPage?.title ?? tCrumbs('services'), href: '/services' }]}
        service={service}
        faq={faq}
      />
    </>
  )
}
