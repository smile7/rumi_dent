import type { Metadata } from 'next'

import { localeMeta, locales, type Locale } from '@/config/i18n'
import { OG_IMAGE_SIZE, ogImageUrl } from '@/lib/content/image-loader'
import { withoutStega } from '@/lib/content/stega'
import type { ImageAsset, Seo, SiteSettings } from '@/lib/content/types'
import type { PageTranslations } from '@/lib/i18n/translations'

import { buildAlternates } from './alternates'

export type MetadataInput = {
  locale: Locale
  settings: Pick<SiteSettings, 'brandName' | 'tagline' | 'seoDefaults'>
  translations: PageTranslations
  title: string
  /** Excerpt / intro / teaser: used when the document has no `seo.description`. */
  description?: string
  seo?: Seo
  /** Hero or cover image: the OG image when the document has no `seo.ogImage`. */
  image?: ImageAsset
  /** The home page's title is `brandName · tagline`, not the title template. */
  home?: boolean
  article?: { publishedTime: string; modifiedTime?: string; authors: string[] }
}

export type MetadataContext = {
  env: 'production' | 'preview' | 'development'
  draftMode: boolean
}

const SEPARATOR = ' · '
export const TITLE_MAX = 60
export const DESCRIPTION_MAX = 160

/** Shortens `text` to at most `max` characters at a word boundary, ending with `…`. */
export function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max - 1)
  const space = cut.lastIndexOf(' ')
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,.;:·|–-]+$/, '')}…`
}

type TitleInput = Pick<MetadataInput, 'settings' | 'title' | 'seo' | 'home'>

function titleTemplate({ brandName, seoDefaults }: MetadataInput['settings']): string {
  return seoDefaults.titleTemplate?.includes('%s')
    ? seoDefaults.titleTemplate
    : `%s${SEPARATOR}${brandName}`
}

/** The untruncated title, for `og:title` / `twitter:title` (share cards wrap long titles). */
export function fullPageTitle(input: TitleInput): string {
  const { brandName, tagline } = input.settings
  if (input.home) return input.seo?.title || [brandName, tagline].filter(Boolean).join(SEPARATOR)
  return titleTemplate(input.settings).replace('%s', input.seo?.title || input.title)
}

/** The `<title>`, at most `TITLE_MAX` characters. */
export function pageTitle(input: TitleInput): string {
  if (input.home) return truncate(fullPageTitle(input), TITLE_MAX)
  const template = titleTemplate(input.settings)
  // The page part is shortened so the brand suffix survives.
  const room = Math.max(TITLE_MAX - (template.length - 2), 20)
  return truncate(
    template.replace('%s', truncate(input.seo?.title || input.title, room)),
    TITLE_MAX,
  )
}

/** The build-time image of `app/[locale]/opengraph-image.tsx` (resolved by `metadataBase`). */
export const fallbackOgImagePath = (locale: Locale) => `/${locale}/opengraph-image`

/** The route's full `Metadata` (SEO.md §1). Every string goes through `withoutStega`. */
export function composeMetadata(input: MetadataInput, context: MetadataContext): Metadata {
  const { locale, settings, seo, translations, article } = input
  const title = pageTitle(input)
  const shareTitle = fullPageTitle(input)
  const fullDescription = seo?.description || input.description || settings.seoDefaults.description
  const description = fullDescription ? truncate(fullDescription, DESCRIPTION_MAX) : undefined
  const { googleVerification, bingVerification } = settings.seoDefaults
  const alternates = buildAlternates(locale, translations)
  const canonical = seo?.canonicalOverride || alternates.canonical
  const image = seo?.ogImage ?? input.image ?? settings.seoDefaults.ogImage
  // A page's `openGraph` replaces the layout's, so the generated fallback has to be named here.
  const images = [
    image
      ? { url: ogImageUrl(image), ...OG_IMAGE_SIZE, alt: image.alt }
      : { url: fallbackOgImagePath(locale), ...OG_IMAGE_SIZE },
  ]
  const noIndex = context.env !== 'production' || context.draftMode || Boolean(seo?.noIndex)

  return withoutStega({
    title: { absolute: title },
    description,
    alternates: { canonical, languages: alternates.languages },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
    // Phone numbers are rendered as explicit tel: links.
    formatDetection: { telephone: false },
    ...(googleVerification || bingVerification
      ? {
          verification: {
            ...(googleVerification ? { google: googleVerification } : {}),
            ...(bingVerification ? { other: { 'msvalidate.01': bingVerification } } : {}),
          },
        }
      : {}),
    openGraph: {
      title: shareTitle,
      description,
      url: canonical,
      siteName: settings.brandName,
      locale: localeMeta[locale].ogLocale,
      alternateLocale: locales
        .filter((l) => l !== locale && translations[l] !== undefined)
        .map((l) => localeMeta[l].ogLocale),
      images,
      ...(article
        ? {
            type: 'article',
            publishedTime: article.publishedTime,
            modifiedTime: article.modifiedTime,
            authors: article.authors,
          }
        : { type: 'website' }),
    },
    twitter: { card: 'summary_large_image', title: shareTitle, description, images },
  })
}
