import { stegaClean } from 'next-sanity'

import type { ContentIcon } from '@/config/icons'
import { locales, type Locale } from '@/config/i18n'
import { getPathname } from '@/i18n/navigation'
import { systemPathnames } from '@/i18n/pathnames'
import type { Href } from '@/lib/i18n/translations'

import type {
  Cta,
  CtaAction,
  CtaStyle,
  ImageAsset,
  LinkTarget,
  RichTextValue,
  Seo,
  SystemPageKey,
  Translations,
} from '../../types'

/**
 * Inputs are typed structurally (the shape the shared fragments project), so every generated
 * query result that uses a fragment fits without importing per-query types here.
 */
type Nullable<T> = T | null | undefined

/** Values used in code (enums, slugs, hrefs) must never carry stega characters. */
export const clean = <T>(value: T): T => stegaClean(value) as T

/** `null` → `undefined`, so optional domain fields stay absent instead of `null`. */
export const opt = <T>(value: Nullable<T>): T | undefined => value ?? undefined

export const icon = (value: Nullable<string>): ContentIcon | undefined =>
  value ? (clean(value) as ContentIcon) : undefined

// --- Routes --------------------------------------------------------------------------------

export type RouteDoc = {
  _type: 'page' | 'service' | 'article' | 'legalPage'
  slug: string | null
  pageKey?: SystemPageKey | null
  hasDetailPage?: boolean | null
}

export const systemHrefs = systemPathnames satisfies Record<SystemPageKey, Href>

/**
 * Internal href of a routable document. A service without its own page lives on the services
 * page (callers add the `#slug` anchor). Null when the document has no URL.
 */
export function routeHref(doc: RouteDoc): Href | null {
  const pageKey = clean(doc.pageKey)
  const slug = clean(doc.slug)
  switch (doc._type) {
    case 'page':
      if (pageKey) return systemHrefs[pageKey]
      return slug ? { pathname: '/[slug]', params: { slug } } : null
    case 'service':
      if (!slug) return null
      return doc.hasDetailPage ? { pathname: '/services/[slug]', params: { slug } } : '/services'
    case 'article':
      return slug ? { pathname: '/blog/[slug]', params: { slug } } : null
    case 'legalPage':
      return slug ? { pathname: '/legal/[slug]', params: { slug } } : null
  }
}

/** Localized path of a routable document, including the services-page anchor. */
export function routePath(doc: RouteDoc, locale: Locale): string | null {
  const href = routeHref(doc)
  if (!href) return null
  const path = getPathname({ locale, href })
  return doc._type === 'service' && !doc.hasDetailPage ? `${path}#${clean(doc.slug)}` : path
}

type TranslationRow = { locale: string | null; doc: RouteDoc | null }

/** Published translations → locale → internal href. Unknown locales and dead links are dropped. */
export function mapTranslations(rows: Nullable<TranslationRow[]>, self: RouteDoc, locale: Locale) {
  const translations: Translations = {}
  for (const row of rows ?? []) {
    const rowLocale = locales.find((l) => l === clean(row.locale))
    const href = row.doc ? routeHref(row.doc) : null
    if (rowLocale && href) translations[rowLocale] = href
  }
  // A document without translation metadata still exists in its own locale.
  const own = routeHref(self)
  if (own && !translations[locale]) translations[locale] = own
  return translations
}

// --- Links and CTAs ------------------------------------------------------------------------

export type LinkInput = {
  kind: Nullable<'internal' | 'external' | 'tel' | 'email' | 'anchor'>
  systemRoute: Nullable<SystemPageKey>
  href: Nullable<string>
  anchor: Nullable<string>
  openInNewTab: Nullable<boolean>
  internal: Nullable<RouteDoc & { title?: string | null }>
  phone: Nullable<string>
  email: Nullable<string>
}

/** Resolves a CMS link to an href. Null when the target doesn't exist in this locale. */
export function linkHref(
  link: Nullable<LinkInput>,
  locale: Locale,
): Omit<LinkTarget, 'label'> | null {
  if (!link) return null
  switch (clean(link.kind)) {
    case 'internal': {
      const systemRoute = clean(link.systemRoute)
      if (systemRoute)
        return { href: getPathname({ locale, href: systemHrefs[systemRoute] }), external: false }
      const path = link.internal ? routePath(link.internal, locale) : null
      return path ? { href: path, external: false } : null
    }
    case 'external': {
      const href = clean(link.href)
      return href ? { href, external: true, newTab: Boolean(link.openInNewTab) } : null
    }
    case 'tel': {
      const phone = clean(link.phone)
      return phone ? { href: `tel:${phone}`, external: false } : null
    }
    case 'email': {
      const email = clean(link.email)
      return email ? { href: `mailto:${email}`, external: false } : null
    }
    case 'anchor': {
      const anchor = clean(link.anchor)
      return anchor ? { href: `#${anchor}`, external: false } : null
    }
    default:
      return null
  }
}

export function mapLink(
  link: Nullable<LinkInput>,
  label: Nullable<string>,
  locale: Locale,
): LinkTarget | null {
  const target = linkHref(link, locale)
  const text = label ?? link?.internal?.title
  return target && text ? { ...target, label: text } : null
}

export type CtaInput = {
  label: Nullable<string>
  action: Nullable<CtaAction>
  style: Nullable<CtaStyle>
  link: Nullable<LinkInput>
}

/** Null without a label, or for a link CTA whose target doesn't exist in this locale. */
export function mapCta(cta: Nullable<CtaInput>, locale: Locale): Cta | null {
  if (!cta?.label) return null
  const action = clean(cta.action) ?? 'link'
  const link = action === 'link' ? mapLink(cta.link, cta.label, locale) : null
  if (action === 'link' && !link) return null
  return { label: cta.label, action, style: clean(cta.style) ?? 'primary', link }
}

export const mapCtas = (ctas: Nullable<CtaInput[]>, locale: Locale): Cta[] =>
  (ctas ?? []).flatMap((cta) => {
    const mapped = mapCta(cta, locale)
    return mapped ? [mapped] : []
  })

// --- Images --------------------------------------------------------------------------------

export type ImageInput = {
  url: Nullable<string>
  width: Nullable<number>
  height: Nullable<number>
  lqip?: Nullable<string>
  crop?: Nullable<{ top?: number; bottom?: number; left?: number; right?: number }>
  hotspot?: Nullable<{ x?: number; y?: number }>
  decorative?: Nullable<boolean>
  alt?: Nullable<string>
}

const percent = (value: number) => Math.round(Math.min(100, Math.max(0, value * 100)) * 10) / 10

/**
 * The editor's crop becomes a `rect` param (so `src` is already cropped), and the hotspot becomes
 * a focal point relative to the cropped image. Undefined when the asset is missing.
 */
export function mapImage(
  image: Nullable<ImageInput>,
  fallbackAlt?: string,
): ImageAsset | undefined {
  const url = clean(image?.url)
  if (!image || !url || !image.width || !image.height) return undefined

  const left = image.crop?.left ?? 0
  const right = image.crop?.right ?? 0
  const top = image.crop?.top ?? 0
  const bottom = image.crop?.bottom ?? 0
  const cropped = left + right + top + bottom > 0
  const width = Math.round(image.width * (1 - left - right))
  const height = Math.round(image.height * (1 - top - bottom))
  const rect = `${Math.round(image.width * left)},${Math.round(image.height * top)},${width},${height}`

  const hotspot = image.hotspot
  return {
    src: cropped ? `${url}?rect=${rect}` : url,
    width,
    height,
    alt: image.decorative ? '' : (image.alt ?? fallbackAlt ?? ''),
    ...(image.lqip ? { lqip: image.lqip } : {}),
    ...(hotspot?.x !== undefined && hotspot.y !== undefined
      ? {
          focalPoint: {
            x: percent((hotspot.x - left) / (1 - left - right)),
            y: percent((hotspot.y - top) / (1 - top - bottom)),
          },
        }
      : {}),
  }
}

// --- SEO -----------------------------------------------------------------------------------

export type SeoInput = {
  title: Nullable<string>
  description: Nullable<string>
  noIndex: Nullable<boolean>
  canonicalOverride: Nullable<string>
  ogImage: Nullable<ImageInput>
}

export function mapSeo(seo: Nullable<SeoInput>): Seo {
  const ogImage = mapImage(seo?.ogImage)
  return {
    ...(seo?.title ? { title: seo.title } : {}),
    ...(seo?.description ? { description: seo.description } : {}),
    ...(ogImage ? { ogImage } : {}),
    noIndex: Boolean(seo?.noIndex),
    ...(seo?.canonicalOverride ? { canonicalOverride: clean(seo.canonicalOverride) } : {}),
  }
}

// --- Rich text -----------------------------------------------------------------------------

type BlockInput = {
  _type: string
  _key: string
  markDefs?: Nullable<({ _type: string; _key: string } & Partial<LinkInput>)[]>
  [key: string]: unknown
}

/**
 * Portable Text blocks the `<RichText>` renderer understands (content-layer internal contract):
 * links carry a resolved `href`, images an `ImageAsset`, inline CTAs a `Cta`.
 */
export type RichTextLinkMark = { _type: 'link'; _key: string } & Omit<LinkTarget, 'label'>
export type RichTextImageBlock = {
  _type: 'image'
  _key: string
  image: ImageAsset
  caption?: string
}
export type RichTextCtaBlock = { _type: 'cta'; _key: string; cta: Cta }
/** Rendered from config (`src/config/cookies.ts` / `processors.ts`), not from CMS content. */
export type RichTextGeneratedBlock = {
  _type: 'cookieTable' | 'processorsList'
  _key: string
  caption?: string
}
export type RichTextCalloutBlock = {
  _type: 'callout'
  _key: string
  tone: 'info' | 'tip' | 'warning'
  text: string
}

function mapMarkDefs(markDefs: BlockInput['markDefs'], locale: Locale) {
  return (markDefs ?? []).flatMap((def) => {
    if (def._type !== 'link') return [def]
    const target = linkHref(def as LinkInput, locale)
    // An unresolved link (e.g. untranslated target) keeps its text but loses the link.
    return target ? [{ _type: 'link', _key: def._key, ...target } satisfies RichTextLinkMark] : []
  })
}

export function mapRichText(blocks: Nullable<BlockInput[]>, locale: Locale): RichTextValue {
  const mapped = (blocks ?? []).flatMap((block): unknown[] => {
    switch (block._type) {
      case 'block':
        return [{ ...block, markDefs: mapMarkDefs(block.markDefs, locale) }]
      case 'imageWithAlt': {
        const image = mapImage(block as unknown as ImageInput)
        const caption = block.caption as Nullable<string>
        return image
          ? [
              {
                _type: 'image',
                _key: block._key,
                image,
                ...(caption ? { caption } : {}),
              } satisfies RichTextImageBlock,
            ]
          : []
      }
      case 'ctaInline': {
        const cta = mapCta(block as unknown as CtaInput, locale)
        return cta ? [{ _type: 'cta', _key: block._key, cta } satisfies RichTextCtaBlock] : []
      }
      case 'callout': {
        const text = block.text as Nullable<string>
        return text
          ? [
              {
                _type: 'callout',
                _key: block._key,
                tone: clean(block.tone as RichTextCalloutBlock['tone'] | null) ?? 'info',
                text,
              } satisfies RichTextCalloutBlock,
            ]
          : []
      }
      case 'cookieTable':
      case 'processorsList': {
        const caption = block.caption as Nullable<string>
        return [
          {
            _type: block._type as RichTextGeneratedBlock['_type'],
            _key: block._key,
            ...(caption ? { caption } : {}),
          } satisfies RichTextGeneratedBlock,
        ]
      }
      default:
        return []
    }
  })
  return mapped as unknown as RichTextValue
}
