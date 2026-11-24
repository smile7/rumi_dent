import type { Locale } from '@/config/i18n'

import type {
  ArticleQueryRow,
  LegalPageQueryRow,
  PageQueryRow,
  ServiceQueryRow,
} from '../query-types'
import type { Article, LegalPage, Page, Service } from '../../types'
import {
  mapArticleSummary,
  mapFaqItem,
  mapList,
  mapServiceSummary,
  mapTeamMember,
} from './collections'
import { mapSections } from './sections'
import { headingAnchor } from '../../anchors'
import { clean, mapRichText, mapSeo, mapTranslations } from './shared'

const WORDS_PER_MINUTE = 200

export function mapPage(row: PageQueryRow | null, locale: Locale): Page | null {
  if (!row?.title) return null
  const pageKey = clean(row.pageKey) ?? undefined
  const slug = clean(row.slug) ?? undefined
  if (!pageKey && !slug) return null
  return {
    id: row._id,
    ...(pageKey ? { pageKey } : {}),
    title: row.title,
    ...(slug && !pageKey ? { slug } : {}),
    ...(row.intro ? { intro: row.intro } : {}),
    sections: mapSections(row.sections, locale),
    seo: mapSeo(row.seo),
    hideFromNav: Boolean(row.hideFromNav),
    hideFromSitemap: Boolean(row.hideFromSitemap),
    translations: mapTranslations(
      row.translations,
      { _type: 'page', slug: row.slug, pageKey: row.pageKey },
      locale,
    ),
  }
}

export function mapService(row: ServiceQueryRow | null, locale: Locale): Service | null {
  const summary = mapServiceSummary(row, locale)
  if (!row || !summary) return null
  return {
    ...summary,
    ...(row.body?.length ? { body: mapRichText(row.body, locale) } : {}),
    faq: mapList(row.faq, (item) => mapFaqItem(item, locale)),
    doctors: mapList(row.doctors, (member) => mapTeamMember(member, locale)),
    seo: mapSeo(row.seo),
    translations: mapTranslations(
      row.translations,
      { _type: 'service', slug: row.slug, hasDetailPage: row.hasDetailPage },
      locale,
    ),
  }
}

export function mapArticle(row: ArticleQueryRow | null, locale: Locale): Article | null {
  const summary = mapArticleSummary(row, locale)
  if (!row || !summary) return null
  const related = mapList(row.related, (item) => mapArticleSummary(item, locale))
  return {
    ...summary,
    body: mapRichText(row.body, locale),
    readingTimeMinutes: Math.max(1, Math.ceil((row.wordCount ?? 0) / WORDS_PER_MINUTE)),
    author: mapTeamMember(row.author, locale),
    reviewedBy: mapTeamMember(row.reviewedBy, locale),
    // Editor-picked related articles; the latest ones otherwise (CONTENT-MODEL article).
    related: related.length
      ? related
      : mapList(row.latest, (item) => mapArticleSummary(item, locale)),
    seo: mapSeo(row.seo),
    translations: mapTranslations(row.translations, { _type: 'article', slug: row.slug }, locale),
  }
}

export function mapLegalPage(row: LegalPageQueryRow | null, locale: Locale): LegalPage | null {
  if (!row?.title || !row.slug || !row.kind) return null
  return {
    id: row._id,
    kind: clean(row.kind),
    title: row.title,
    slug: clean(row.slug),
    body: mapRichText(row.body, locale),
    ...(row.lastUpdated ? { lastUpdated: clean(row.lastUpdated) } : {}),
    translations: mapTranslations(row.translations, { _type: 'legalPage', slug: row.slug }, locale),
    ...excerptOf(row.body ?? []),
    toc: (row.body ?? []).flatMap((block) =>
      block._type === 'block' && block.style === 'h2'
        ? [{ id: headingAnchor(clean(block._key)), text: blockText(block) }]
        : [],
    ),
    placeholders: findPlaceholders([row.title, ...(row.body ?? []).map(blockText)]),
  }
}

type TextBlock = { _type: string; children?: unknown }

const blockText = (block: TextBlock) =>
  Array.isArray(block.children)
    ? block.children.map((child: { text?: unknown }) => clean(String(child.text ?? ''))).join('')
    : ''

/** Same pattern as the Studio's publish validation (`placeholdersIn`). */
const EXCERPT_LENGTH = 160

function excerptOf(blocks: (TextBlock & { style?: unknown })[]): { excerpt?: string } {
  const first = blocks.find((block) => block._type === 'block' && block.style === 'normal')
  const text = first ? blockText(first).trim() : ''
  if (!text) return {}
  if (text.length <= EXCERPT_LENGTH) return { excerpt: text }
  const cut = text.slice(0, EXCERPT_LENGTH - 1)
  return { excerpt: `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[\s,.;:]+$/, '')}…` }
}

const PLACEHOLDER = /\[\[[^\]]*\]\]/g

/** Unique `[[…]]` template fields, in order of appearance. */
export function findPlaceholders(texts: string[]): string[] {
  return [...new Set(texts.flatMap((text) => clean(text).match(PLACEHOLDER) ?? []))]
}
