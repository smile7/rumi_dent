import { describe, expect, it } from 'vitest'

import type { ImageAsset, Seo } from '@/lib/content/types'
import { inAllLocales } from '@/lib/i18n/translations'

import { composeMetadata, type MetadataContext, type MetadataInput } from './metadata'

const marker = '\u200b\u200c\u200d\ufeff'.repeat(8)
const image = (name: string): ImageAsset => ({
  src: `https://cdn.sanity.io/images/p/d/${name}-1600x900.jpg`,
  width: 1600,
  height: 900,
  alt: name,
})

const settings: MetadataInput['settings'] = {
  brandName: 'Demo Dental',
  tagline: 'Family dentistry in Ruse',
  seoDefaults: {
    titleTemplate: '%s · Demo Dental',
    description: 'Settings description',
    ogImage: image('default'),
  },
}
const noSeo: Seo = { noIndex: false }
const production: MetadataContext = { env: 'production', draftMode: false }

const input = (overrides: Partial<MetadataInput> = {}): MetadataInput => ({
  locale: 'en',
  settings,
  translations: inAllLocales('/about'),
  title: 'About us',
  seo: noSeo,
  ...overrides,
})

describe('composeMetadata', () => {
  it('renders the title through the settings template, or brand · tagline on the home page', () => {
    expect(composeMetadata(input(), production).title).toEqual({
      absolute: 'About us · Demo Dental',
    })
    expect(
      composeMetadata(input({ seo: { ...noSeo, title: 'Our team' } }), production).title,
    ).toEqual({ absolute: 'Our team · Demo Dental' })
    expect(
      composeMetadata(
        input({ settings: { ...settings, seoDefaults: {} }, title: 'About us' }),
        production,
      ).title,
    ).toEqual({ absolute: 'About us · Demo Dental' })
    expect(composeMetadata(input({ home: true }), production).title).toEqual({
      absolute: 'Demo Dental · Family dentistry in Ruse',
    })
  })

  it('truncates only <title>; og:title and twitter:title keep the full title', () => {
    const long = 'Professional cleaning, polishing and fluoride varnish for the whole family'
    const metadata = composeMetadata(input({ title: long }), production)
    const full = `${long} · Demo Dental`
    expect(metadata.title).not.toEqual({ absolute: full })
    expect(metadata.openGraph).toMatchObject({ title: full })
    expect(metadata.twitter).toMatchObject({ title: full })
  })

  it('falls back from seo.description to the excerpt to the settings description', () => {
    const seo = { ...noSeo, description: 'SEO description' }
    expect(composeMetadata(input({ seo, description: 'Intro' }), production).description).toBe(
      'SEO description',
    )
    expect(composeMetadata(input({ description: 'Intro' }), production).description).toBe('Intro')
    expect(composeMetadata(input(), production).description).toBe('Settings description')
  })

  it('picks the OG image from seo, then the page image, then the settings default', () => {
    const ogUrl = (overrides: Partial<MetadataInput>) => {
      const og = composeMetadata(input(overrides), production).openGraph
      const images = og?.images as { url: string; width: number; height: number }[]
      return images[0]
    }
    expect(ogUrl({ seo: { ...noSeo, ogImage: image('seo') }, image: image('hero') })?.url).toMatch(
      /seo-1600x900\.jpg\?w=1200&h=630&fit=crop/,
    )
    expect(ogUrl({ image: image('hero') })?.url).toMatch(/hero-1600x900/)
    expect(ogUrl({})).toMatchObject({ width: 1200, height: 630 })
    expect(ogUrl({})?.url).toMatch(/default-1600x900/)
    const noImages = { ...settings, seoDefaults: {} }
    expect(ogUrl({ settings: noImages })).toEqual({
      url: '/en/opengraph-image',
      width: 1200,
      height: 630,
    })
  })

  it('sets canonical, hreflang and OG locales from the translations', () => {
    const metadata = composeMetadata(input(), production)
    expect(metadata.alternates).toEqual({
      canonical: '/en/about',
      languages: { bg: '/bg/za-nas', en: '/en/about', 'x-default': '/bg/za-nas' },
    })
    expect(metadata.openGraph).toMatchObject({
      type: 'website',
      url: '/en/about',
      siteName: 'Demo Dental',
      locale: 'en_GB',
      alternateLocale: ['bg_BG'],
    })
    expect(metadata.twitter).toMatchObject({ card: 'summary_large_image' })

    const enOnly = composeMetadata(input({ translations: { en: '/about' } }), production)
    expect(enOnly.openGraph).toMatchObject({ alternateLocale: [] })
    const override = composeMetadata(
      input({ seo: { ...noSeo, canonicalOverride: 'https://example.com/x' } }),
      production,
    )
    expect(override.alternates?.canonical).toBe('https://example.com/x')
  })

  it('adds article dates and authors', () => {
    const metadata = composeMetadata(
      input({
        article: { publishedTime: '2026-11-01', modifiedTime: '2026-11-10', authors: ['Dr. A'] },
      }),
      production,
    )
    expect(metadata.openGraph).toMatchObject({
      type: 'article',
      publishedTime: '2026-11-01',
      modifiedTime: '2026-11-10',
      authors: ['Dr. A'],
    })
  })

  it('is indexable only in production, outside draft mode, without seo.noIndex', () => {
    const index = { index: true, follow: true }
    const noindex = { index: false, follow: false }
    expect(composeMetadata(input(), production).robots).toEqual(index)
    expect(composeMetadata(input(), { env: 'preview', draftMode: false }).robots).toEqual(noindex)
    expect(composeMetadata(input(), { env: 'development', draftMode: false }).robots).toEqual(
      noindex,
    )
    expect(composeMetadata(input(), { env: 'production', draftMode: true }).robots).toEqual(noindex)
    expect(composeMetadata(input({ seo: { noIndex: true } }), production).robots).toEqual(noindex)
  })

  it('uses a service teaser as the description when the service has no SEO description', () => {
    const metadata = composeMetadata(
      input({
        translations: { en: { pathname: '/services/[slug]', params: { slug: 'check-up' } } },
        title: "Children's check-up",
        description: 'A calm first visit with tips for parents.',
      }),
      production,
    )
    expect(metadata.description).toBe('A calm first visit with tips for parents.')
    expect(metadata.title).toEqual({ absolute: "Children's check-up · Demo Dental" })
  })

  it('keeps titles within 60 and descriptions within 160 characters, cut at a word', () => {
    const long = 'Very long words '.repeat(20).trim()
    const metadata = composeMetadata(input({ title: long, description: long }), production)
    const title = (metadata.title as { absolute: string }).absolute
    expect(title.length).toBeLessThanOrEqual(60)
    expect(title).toMatch(/^Very long words .*(Very|long|words)… · Demo Dental$/)
    expect(metadata.description?.length).toBeLessThanOrEqual(160)
    expect(metadata.description).toMatch(/(Very|long|words)…$/)
    const home = composeMetadata(input({ home: true, seo: { ...noSeo, title: long } }), production)
    expect((home.title as { absolute: string }).absolute.length).toBeLessThanOrEqual(60)
  })

  it('turns off phone number detection and adds verification codes only when set', () => {
    const plain = composeMetadata(input(), production)
    expect(plain.formatDetection).toEqual({ telephone: false })
    expect(plain.verification).toBeUndefined()
    const verified = composeMetadata(
      input({
        settings: {
          ...settings,
          seoDefaults: { googleVerification: 'g-code', bingVerification: 'b-code' },
        },
      }),
      production,
    )
    expect(verified.verification).toEqual({
      google: 'g-code',
      other: { 'msvalidate.01': 'b-code' },
    })
  })

  it('strips stega markers from every string', () => {
    const metadata = composeMetadata(
      input({ title: `About us${marker}`, description: `Intro${marker}` }),
      production,
    )
    expect(JSON.stringify(metadata)).not.toMatch(/[\u200b-\u200d\ufeff]/)
    expect(metadata.title).toEqual({ absolute: 'About us · Demo Dental' })
    expect(metadata.description).toBe('Intro')
  })
})
