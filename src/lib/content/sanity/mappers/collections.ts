import type { Locale } from '@/config/i18n'
import { getPathname } from '@/i18n/navigation'

import type {
  ArticleSummaryQueryRow,
  FaqItemQueryRow,
  GalleryItemQueryRow,
  ServiceSummaryQueryRow,
  TeamMemberQueryRow,
  TestimonialQueryRow,
} from '../query-types'
import type {
  ArticleSummary,
  FaqItem,
  GalleryItem,
  ServiceCategory,
  ServiceSummary,
  TeamMember,
  Testimonial,
} from '../../types'
import { clean, icon, mapImage, mapRichText, routeHref, routePath } from './shared'

/** Maps a list, dropping items the mapper rejects (missing required content). */
export const mapList = <I, O>(rows: I[] | null | undefined, map: (row: I) => O | null): O[] =>
  (rows ?? []).flatMap((row) => {
    const mapped = map(row)
    return mapped ? [mapped] : []
  })

export function mapTeamMember(row: TeamMemberQueryRow | null, locale: Locale): TeamMember | null {
  if (!row?.name || !row.role) return null
  const photo = mapImage(row.photo, row.name)
  const bio = row.bio?.length ? mapRichText(row.bio, locale) : undefined
  return {
    id: row._id,
    name: row.name,
    ...(row.nameLatin ? { nameLatin: row.nameLatin } : {}),
    ...(row.honorific ? { honorific: row.honorific } : {}),
    role: row.role,
    specialties: (row.specialties ?? []).flatMap((s) => (s.label ? [s.label] : [])),
    bioShort: row.bioShort ?? '',
    ...(bio ? { bio } : {}),
    ...(photo ? { photo } : {}),
    featured: Boolean(row.featured),
    ...(row.yearsExperience != null ? { yearsExperience: row.yearsExperience } : {}),
    credentials: (row.credentials ?? []).flatMap((c) =>
      c.label ? [{ label: c.label, ...(c.year ? { year: c.year } : {}) }] : [],
    ),
    sameAs: (row.sameAs ?? []).map(clean),
  }
}

export function mapFaqItem(row: FaqItemQueryRow | null, locale: Locale): FaqItem | null {
  if (!row?.question || !row.answer?.length) return null
  return {
    id: row._id,
    question: row.question,
    answer: mapRichText(row.answer, locale),
    ...(row.category ? { category: clean(row.category) } : {}),
  }
}

export function mapGalleryItem(row: GalleryItemQueryRow | null): GalleryItem | null {
  const image = mapImage(row?.image)
  if (!row || !image) return null
  return {
    id: row._id,
    image,
    ...(row.image?.caption ? { caption: row.image.caption } : {}),
    album: clean(row.album) ?? 'other',
  }
}

export function mapTestimonial(row: TestimonialQueryRow | null): Testimonial | null {
  if (!row?.quote || !row.authorName) return null
  return {
    id: row._id,
    quote: row.quote,
    authorName: row.authorName,
    ...(row.rating ? { rating: row.rating } : {}),
    ...(row.date ? { date: clean(row.date) } : {}),
    featured: Boolean(row.featured),
  }
}

export function mapCategory(row: ServiceSummaryQueryRow['category']): ServiceCategory | null {
  if (!row?.title) return null
  return {
    id: row._id,
    title: row.title,
    ...(row.slug ? { slug: clean(row.slug) } : {}),
    ...(row.description ? { description: row.description } : {}),
    audience: clean(row.audience) ?? 'everyone',
    tone: clean(row.tone) ?? 'soft',
  }
}

export function mapServiceSummary(
  row: ServiceSummaryQueryRow | null,
  locale: Locale,
): ServiceSummary | null {
  if (!row?.title || !row.slug) return null
  const route = { _type: 'service' as const, slug: row.slug, hasDetailPage: row.hasDetailPage }
  const href = routePath(route, locale)
  if (!href) return null
  const image = mapImage(row.image)
  return {
    id: row._id,
    title: row.title,
    slug: clean(row.slug),
    href,
    ...(icon(row.icon) ? { icon: icon(row.icon) } : {}),
    ...(image ? { image } : {}),
    teaser: row.teaser ?? '',
    summary: mapRichText(row.summary, locale),
    ...(row.durationNote ? { durationNote: row.durationNote } : {}),
    ...(row.priceNote ? { priceNote: row.priceNote } : {}),
    hasDetailPage: Boolean(row.hasDetailPage),
    category: mapCategory(row.category),
  }
}

export function mapArticleSummary(
  row: ArticleSummaryQueryRow | null,
  locale: Locale,
): ArticleSummary | null {
  if (!row?.title || !row.slug || !row.publishedAt) return null
  const href = routeHref({ _type: 'article', slug: row.slug })
  if (!href) return null
  const cover = mapImage(row.cover, row.title)
  return {
    id: row._id,
    title: row.title,
    slug: clean(row.slug),
    href: getPathname({ locale, href }),
    excerpt: row.excerpt ?? '',
    ...(cover ? { cover } : {}),
    publishedAt: clean(row.publishedAt),
    ...(row.updatedAt ? { updatedAt: clean(row.updatedAt) } : {}),
  }
}
