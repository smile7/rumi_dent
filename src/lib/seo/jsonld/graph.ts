import type { Thing } from 'schema-dts'

import type { Article, FaqSection, Service, TeamMember } from '@/lib/content/types'
import type { PageTranslations } from '@/lib/i18n/translations'

import { blogPosting } from './blogPosting'
import { faqPage } from './faqPage'
import { absoluteUrl, ids, type JsonLdContext } from './ids'
import { organization, website, type OrganizationNode } from './organization'
import { person } from './person'
import { service as serviceNode } from './service'
import {
  breadcrumbList,
  isMedicalBusiness,
  webPage,
  type Crumb,
  type WebPageNode,
  type WebPageType,
} from './webPage'

export type JsonLdGraph = {
  '@context': 'https://schema.org'
  '@graph': (Thing | OrganizationNode | WebPageNode)[]
}

export type PageGraphInput = {
  name: string
  description?: string
  translations: PageTranslations
  /** Home → … → this page. Empty on the home page (no BreadcrumbList). */
  breadcrumbs: Crumb[]
  type?: Exclude<WebPageType, 'MedicalWebPage'>
  faq?: FaqSection | null
  /** People shown on the page (team section, article author / reviewer). */
  people?: TeamMember[]
  service?: Service
  article?: Article
}

/** One `@graph` per page: organization, website, the page, and what the page shows. */
export function pageGraph(ctx: JsonLdContext, input: PageGraphInput): JsonLdGraph {
  const href = input.translations[ctx.locale]
  if (href === undefined) throw new Error(`pageGraph: the page has no "${ctx.locale}" href`)
  const url = absoluteUrl(ctx, ctx.locale, href)
  const { service, article } = input
  const medical = isMedicalBusiness(ctx.settings.businessType) && Boolean(service || article)

  const people = new Map<string, TeamMember>()
  for (const member of [
    ...(input.people ?? []),
    ...(article?.author ? [article.author] : []),
    ...(article?.reviewedBy ? [article.reviewedBy] : []),
  ]) {
    people.set(member.id, member)
  }
  const faq = input.faq ? faqPage(url, input.faq) : null

  return {
    '@context': 'https://schema.org',
    '@graph': [
      organization(ctx),
      website(ctx),
      webPage(ctx, {
        url,
        name: input.name,
        description: input.description,
        type: medical ? 'MedicalWebPage' : (input.type ?? 'WebPage'),
        hasBreadcrumb: input.breadcrumbs.length > 1,
        about: service ? ids.service(url) : article ? ids.article(url) : undefined,
        audience: service?.category?.audience,
        reviewedBy: article?.reviewedBy
          ? ids.person(ctx.siteUrl, article.reviewedBy.id)
          : undefined,
      }),
      ...(input.breadcrumbs.length > 1 ? [breadcrumbList(ctx, url, input.breadcrumbs)] : []),
      ...(service ? [serviceNode(ctx, url, service)] : []),
      ...(article ? [blogPosting(ctx, url, article)] : []),
      ...(faq ? [faq] : []),
      ...[...people.values()].map((member) => person(ctx, member)),
    ],
  }
}
