import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { hasLocale } from 'next-intl'
import { getTranslations } from 'next-intl/server'

import { CmsPage } from '@/components/site/CmsPage'
import { ServiceAudienceFilter } from '@/components/site/ServiceAudienceFilter'
import { getPageByKey, getSiteSettings, type Section } from '@/lib/content'
import { systemPageMetadata } from '@/lib/seo/buildMetadata'
import { routing } from '@/i18n/routing'

export const dynamicParams = false

/** Chips only make sense when the service tiles cover both audiences. */
function hasMixedAudiences(sections: Section[]) {
  const audiences = new Set(
    sections.flatMap((section) =>
      section.type === 'tiles' && section.source === 'services'
        ? section.items.map((item) => item.audience)
        : [],
    ),
  )
  return audiences.has('children') && audiences.has('adults')
}

export async function generateMetadata({
  params,
}: PageProps<'/[locale]/services'>): Promise<Metadata> {
  return systemPageMetadata('services', (await params).locale)
}

export default async function ServicesPage({ params }: PageProps<'/[locale]/services'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [page, settings, t] = await Promise.all([
    getPageByKey('services', locale),
    getSiteSettings(locale),
    getTranslations('Services'),
  ])
  if (!page || !settings) notFound()

  const labels = {
    group: t('filterLabel'),
    all: t('all'),
    children: t('children'),
    adults: t('adults'),
  }

  return (
    <CmsPage
      page={page}
      locale={locale}
      site={settings}
      wrapSections={
        hasMixedAudiences(page.sections)
          ? (sections) => <ServiceAudienceFilter labels={labels}>{sections}</ServiceAudienceFilter>
          : undefined
      }
    />
  )
}
