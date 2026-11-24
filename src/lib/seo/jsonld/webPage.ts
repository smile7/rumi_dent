import type { BreadcrumbList, PeopleAudience, WebPageLeaf } from 'schema-dts'

import { localeMeta } from '@/config/i18n'
import type { BusinessType, ServiceCategory } from '@/lib/content/types'
import type { Href } from '@/lib/i18n/translations'

import { absoluteUrl, ids, type JsonLdContext } from './ids'

export type WebPageType =
  'WebPage' | 'MedicalWebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage'

export type WebPageNode = Omit<WebPageLeaf, '@type'> & { '@type': WebPageType }

const MEDICAL: ReadonlySet<BusinessType> = new Set(['Dentist', 'MedicalClinic', 'Physician'])
export const isMedicalBusiness = (type: BusinessType) => MEDICAL.has(type)

export type WebPageInput = {
  url: string
  name: string
  description?: string
  type: WebPageType
  hasBreadcrumb: boolean
  /** `@id` of the page's main entity (service, article). */
  about?: string
  audience?: ServiceCategory['audience']
  reviewedBy?: string
}

function audienceNode(audience: ServiceCategory['audience'] | undefined) {
  if (audience !== 'children' && audience !== 'adults') return undefined
  return { '@type': 'PeopleAudience', audienceType: audience } satisfies PeopleAudience
}

export function webPage(ctx: JsonLdContext, input: WebPageInput): WebPageNode {
  return {
    '@type': input.type,
    '@id': ids.webPage(input.url),
    url: input.url,
    name: input.name,
    description: input.description,
    inLanguage: localeMeta[ctx.locale].hreflang,
    isPartOf: { '@id': ids.website(ctx.siteUrl) },
    about: input.about ? { '@id': input.about } : undefined,
    audience: audienceNode(input.audience),
    breadcrumb: input.hasBreadcrumb ? { '@id': ids.breadcrumb(input.url) } : undefined,
    reviewedBy: input.reviewedBy ? { '@id': input.reviewedBy } : undefined,
  }
}

export type Crumb = { name: string; href: Href }

export function breadcrumbList(ctx: JsonLdContext, url: string, crumbs: Crumb[]): BreadcrumbList {
  return {
    '@type': 'BreadcrumbList',
    '@id': ids.breadcrumb(url),
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(ctx, ctx.locale, crumb.href),
    })),
  }
}
