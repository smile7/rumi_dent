import type { Locale } from '@/config/i18n'

import type { SectionQueryRow } from '../query-types'
import type { Section, TileItem } from '../../types'
import {
  mapArticleSummary,
  mapFaqItem,
  mapGalleryItem,
  mapList,
  mapServiceSummary,
  mapTeamMember,
  mapTestimonial,
} from './collections'
import { clean, icon, mapCta, mapCtas, mapImage, mapRichText, opt } from './shared'

function warnUnknown(type: string) {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[content] dropped unknown section type "${type}" (no mapper in sections.ts)`)
  }
}

/** Optional string field: present only when non-empty. */
const text = <K extends string>(key: K, value: string | null | undefined) =>
  (value ? { [key]: value } : {}) as Partial<Record<K, string>>

/** One section → domain section. Null for unknown types or sections missing required content. */
export function mapSection(row: SectionQueryRow, locale: Locale): Section | null {
  const base = {
    key: row._key,
    tone: clean(row.tone) ?? 'base',
    spacing: clean(row.spacing) ?? 'default',
    ...text('anchorId', clean(row.anchorId)),
  }

  switch (row._type) {
    case 'section.hero': {
      if (!row.heading) return null
      const image = mapImage(row.image)
      return {
        ...base,
        type: 'hero',
        heading: row.heading,
        ...text('subheading', row.subheading),
        ctas: mapCtas(row.ctas, locale),
        ...(image ? { image } : {}),
        variant: clean(row.variant) ?? 'split',
        trustItems: (row.trustItems ?? []).flatMap((item) =>
          item.text ? [{ key: item._key, icon: icon(item.icon), text: item.text }] : [],
        ),
      }
    }
    case 'section.textImage': {
      const image = mapImage(row.image)
      return {
        ...base,
        type: 'textImage',
        ...text('heading', row.heading),
        body: mapRichText(row.body, locale),
        ...(image ? { image } : {}),
        imagePosition: clean(row.imagePosition) ?? 'right',
        cta: mapCta(row.cta, locale),
      }
    }
    case 'section.richTextBlock':
      return {
        ...base,
        type: 'richText',
        ...text('heading', row.heading),
        body: mapRichText(row.body, locale),
        width: clean(row.width) ?? 'prose',
      }
    case 'section.tiles': {
      const source = clean(row.source) ?? 'manual'
      const items: TileItem[] =
        source === 'services'
          ? mapList(row.services, (service) => mapServiceSummary(service, locale)).map((s) => ({
              key: s.id,
              title: s.title,
              teaser: s.teaser,
              ...(s.icon ? { icon: s.icon } : {}),
              ...(s.image ? { image: s.image } : {}),
              body: s.summary,
              cta: null,
              slug: s.slug,
              ...(s.category ? { audience: s.category.audience } : {}),
              hasDetailPage: s.hasDetailPage,
            }))
          : (row.items ?? []).flatMap((item) => {
              if (!item.title) return []
              const image = mapImage(item.image)
              return [
                {
                  key: item._key,
                  title: item.title,
                  ...text('teaser', item.teaser),
                  ...(icon(item.icon) ? { icon: icon(item.icon) } : {}),
                  ...(image ? { image } : {}),
                  ...(item.body?.length ? { body: mapRichText(item.body, locale) } : {}),
                  cta: mapCta(item.cta, locale),
                  ...text('slug', clean(item.slug)),
                },
              ]
            })
      return {
        ...base,
        type: 'tiles',
        ...text('heading', row.heading),
        ...text('intro', row.intro),
        source,
        items,
        allowMultiple: Boolean(row.allowMultiple),
        density: clean(row.density) ?? 'comfortable',
      }
    }
    case 'section.processSteps':
      return {
        ...base,
        type: 'processSteps',
        ...text('heading', row.heading),
        ...text('intro', row.intro),
        steps: (row.steps ?? []).flatMap((step) =>
          step.title
            ? [
                {
                  key: step._key,
                  title: step.title,
                  ...text('text', step.text),
                  icon: icon(step.icon),
                },
              ]
            : [],
        ),
        cta: mapCta(row.cta, locale),
      }
    case 'section.faq':
      return {
        ...base,
        type: 'faq',
        ...text('heading', row.heading),
        ...text('intro', row.intro),
        items: mapList(row.items, (item) => mapFaqItem(item, locale)),
        // Unset counts as on (the schema default), matching the Studio rule.
        emitSchema: row.emitSchema !== false,
      }
    case 'section.blogTeaser':
      return {
        ...base,
        type: 'blogTeaser',
        ...text('heading', row.heading),
        articles: mapList(row.articles, (article) => mapArticleSummary(article, locale)).slice(
          0,
          opt(row.count) ?? 3,
        ),
      }
    case 'section.testimonials':
      return {
        ...base,
        type: 'testimonials',
        ...text('heading', row.heading),
        items: mapList(row.items, mapTestimonial),
        showRating: Boolean(row.showRating),
      }
    case 'section.team':
      return {
        ...base,
        type: 'team',
        ...text('heading', row.heading),
        ...text('intro', row.intro),
        members: mapList(row.members, (member) => mapTeamMember(member, locale)),
        layout: clean(row.layout) ?? 'featuredFirst',
      }
    case 'section.gallery':
      return {
        ...base,
        type: 'gallery',
        ...text('heading', row.heading),
        items: mapList(row.items, mapGalleryItem).slice(0, opt(row.limit) ?? 9),
        showLinkToGallery: Boolean(row.showLinkToGallery),
      }
    case 'section.contactHours':
      return {
        ...base,
        type: 'contactHours',
        ...text('heading', row.heading),
        showMap: Boolean(row.showMap),
        showForm: Boolean(row.showForm),
        ...text('note', row.note),
      }
    case 'section.ctaBand':
      if (!row.heading) return null
      return {
        ...base,
        type: 'ctaBand',
        heading: row.heading,
        ...text('text', row.text),
        ctas: mapCtas(row.ctas, locale),
      }
    default:
      warnUnknown((row as { _type: string })._type)
      return null
  }
}

export const mapSections = (rows: SectionQueryRow[] | null | undefined, locale: Locale) =>
  mapList(rows, (row) => mapSection(row, locale))
