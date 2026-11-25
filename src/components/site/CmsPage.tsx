import type { ReactNode } from 'react'

import { pageUsesHeroH1 } from '@/components/sections/helpers'
import { SectionRenderer } from '@/components/sections/SectionRenderer'
import { PageJsonLd } from '@/components/seo/JsonLd'
import type { Locale } from '@/config/i18n'
import type { FaqSection, Page, SiteSettings, SystemPageKey, TeamSection } from '@/lib/content'
import type { Href } from '@/lib/i18n/translations'
import type { WebPageType } from '@/lib/seo/jsonld/webPage'

import { PageHeader } from './PageHeader'
import { DentokidoHome } from './DentokidoHome'
import { SetPageTranslations } from './PageTranslations'

export type CmsPageProps = {
  page: Page
  locale: Locale
  site: SiteSettings
  /** Where the language switcher goes for a locale without a translation. */
  fallback?: Href
  /** Wraps the rendered sections (e.g. the services audience filter). */
  wrapSections?: (sections: ReactNode) => ReactNode
  /** Under the title band's intro (e.g. the contact page's call buttons). Not shown with a hero. */
  headerActions?: ReactNode
  /** Rendered after the sections (e.g. the blog list). */
  children?: ReactNode
}

const PAGE_TYPES: Partial<Record<SystemPageKey, Exclude<WebPageType, 'MedicalWebPage'>>> = {
  about: 'AboutPage',
  contact: 'ContactPage',
  services: 'CollectionPage',
  gallery: 'CollectionPage',
  blog: 'CollectionPage',
}

/** A page-builder page: `h1` (hero or title band), sections, the page's JSON-LD graph. */
export function CmsPage({
  page,
  locale,
  site,
  fallback = '/',
  wrapSections,
  headerActions,
  children,
}: CmsPageProps) {
  if (page.pageKey === 'home' && !wrapSections && !children) {
    return <DentokidoHome page={page} locale={locale} site={site} />
  }

  const faq = page.sections.find(
    (section): section is FaqSection => section.type === 'faq' && section.emitSchema,
  )
  const people = page.sections
    .filter((section): section is TeamSection => section.type === 'team')
    .flatMap((section) => section.members)
  const sections = <SectionRenderer sections={page.sections} locale={locale} site={site} />

  return (
    <>
      <SetPageTranslations translations={page.translations} fallback={fallback} />
      {pageUsesHeroH1(page.sections) ? null : (
        <PageHeader title={page.title} intro={page.intro}>
          {headerActions}
        </PageHeader>
      )}
      {wrapSections ? wrapSections(sections) : sections}
      {children}
      <PageJsonLd
        locale={locale}
        settings={site}
        home={page.pageKey === 'home'}
        name={page.title}
        description={page.seo.description || page.intro}
        translations={page.translations}
        type={page.pageKey ? PAGE_TYPES[page.pageKey] : undefined}
        faq={faq}
        people={people}
      />
    </>
  )
}
