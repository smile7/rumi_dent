import { describe, expect, it } from 'vitest'

import { blockRow, imageRow, linkRow, routeDoc, stega } from './fixtures'
import {
  linkHref,
  mapCta,
  mapImage,
  mapLink,
  mapRichText,
  mapSeo,
  mapTranslations,
  routePath,
} from './shared'

describe('mapImage', () => {
  it('returns undefined without an asset', () => {
    expect(mapImage(null)).toBeUndefined()
    expect(mapImage(imageRow({ url: null }))).toBeUndefined()
  })

  it('keeps the plain CDN url and intrinsic size without a crop', () => {
    expect(mapImage(imageRow())).toEqual({
      src: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg',
      width: 1200,
      height: 800,
      alt: 'Smiling child in the dental chair',
      lqip: 'data:image/jpeg;base64,xyz',
    })
  })

  it('turns the crop into a rect and the hotspot into a focal point inside the crop', () => {
    const image = mapImage(
      imageRow({
        crop: { left: 0.25, right: 0.25, top: 0, bottom: 0.5 },
        hotspot: { x: 0.5, y: 0.25 },
      }),
    )
    expect(image).toMatchObject({
      src: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg?rect=300,0,600,400',
      width: 600,
      height: 400,
      focalPoint: { x: 50, y: 50 },
    })
  })

  it('uses an empty alt for decorative images and the fallback when alt is missing', () => {
    expect(mapImage(imageRow({ decorative: true }))?.alt).toBe('')
    expect(mapImage(imageRow({ alt: null }), 'Dr. Ivanova')?.alt).toBe('Dr. Ivanova')
  })
})

describe('links', () => {
  it('resolves system pages to localized paths', () => {
    const services = routeDoc({ pageKey: 'services' })
    expect(routePath(services, 'bg')).toBe('/bg/uslugi')
    expect(routePath(services, 'en')).toBe('/en/services')
    expect(routePath(routeDoc({ pageKey: 'home' }), 'en')).toBe('/en')
  })

  it('resolves every routable type, with stega-encoded slugs cleaned', () => {
    expect(routePath(routeDoc({ slug: stega('parvo-poseshtenie') }), 'bg')).toBe(
      '/bg/parvo-poseshtenie',
    )
    expect(routePath({ _type: 'service', slug: 'fillings', hasDetailPage: true }, 'en')).toBe(
      '/en/services/fillings',
    )
    expect(routePath({ _type: 'service', slug: 'plombi', hasDetailPage: false }, 'bg')).toBe(
      '/bg/uslugi#plombi',
    )
    expect(routePath({ _type: 'article', slug: 'brushing' }, 'en')).toBe('/en/blog/brushing')
    expect(routePath({ _type: 'legalPage', slug: 'privacy' }, 'bg')).toBe(
      '/bg/pravna-informaciya/privacy',
    )
    expect(routePath(routeDoc({}), 'bg')).toBeNull()
  })

  it('maps each link kind', () => {
    expect(linkHref(linkRow({ systemRoute: 'contact' }), 'bg')).toEqual({
      href: '/bg/kontakti',
      external: false,
    })
    expect(
      linkHref(
        linkRow({ kind: 'external', href: 'https://maps.google.com', openInNewTab: true }),
        'bg',
      ),
    ).toEqual({ href: 'https://maps.google.com', external: true, newTab: true })
    expect(linkHref(linkRow({ kind: 'tel', phone: '+359888123456' }), 'bg')?.href).toBe(
      'tel:+359888123456',
    )
    expect(linkHref(linkRow({ kind: 'email', email: 'hi@demo.bg' }), 'bg')?.href).toBe(
      'mailto:hi@demo.bg',
    )
    expect(
      linkHref(linkRow({ kind: stega('anchor') as 'anchor', anchor: 'hours' }), 'bg')?.href,
    ).toBe('#hours')
  })

  it('returns null when the internal target has no version in this locale', () => {
    expect(linkHref(linkRow({ internal: null }), 'en')).toBeNull()
    expect(linkHref(linkRow({ kind: 'tel', phone: null }), 'en')).toBeNull()
  })

  it('labels internal links with the target title when no label is given', () => {
    const link = linkRow({ internal: routeDoc({ slug: 'za-detsa', title: 'За деца' }) })
    expect(mapLink(link, null, 'bg')).toEqual({
      href: '/bg/za-detsa',
      external: false,
      label: 'За деца',
    })
    expect(mapLink(link, 'Виж още', 'bg')?.label).toBe('Виж още')
  })
})

describe('mapCta', () => {
  it('drops a link CTA whose target is missing, keeps action CTAs without a link', () => {
    expect(mapCta({ label: 'Read', action: 'link', style: null, link: linkRow() }, 'bg')).toBeNull()
    expect(mapCta({ label: 'Call', action: 'call', style: null, link: null }, 'bg')).toEqual({
      label: 'Call',
      action: 'call',
      style: 'primary',
      link: null,
    })
  })

  it('cleans stega from action and style', () => {
    const cta = mapCta(
      {
        label: 'Book',
        action: stega('booking') as 'booking',
        style: stega('outline') as 'outline',
        link: null,
      },
      'bg',
    )
    expect(cta).toMatchObject({ action: 'booking', style: 'outline' })
  })
})

describe('mapTranslations', () => {
  it('maps published translations and drops unknown locales and missing docs', () => {
    const translations = mapTranslations(
      [
        { locale: 'bg', doc: { _type: 'article', slug: 'kak-da-mie' } },
        { locale: 'en', doc: { _type: 'article', slug: 'how-to-brush' } },
        { locale: 'de', doc: { _type: 'article', slug: 'putzen' } },
        { locale: 'en', doc: null },
      ],
      { _type: 'article', slug: 'kak-da-mie' },
      'bg',
    )
    expect(translations).toEqual({
      bg: { pathname: '/blog/[slug]', params: { slug: 'kak-da-mie' } },
      en: { pathname: '/blog/[slug]', params: { slug: 'how-to-brush' } },
    })
  })

  it('falls back to the document itself without translation metadata', () => {
    expect(mapTranslations(null, routeDoc({ pageKey: 'about' }), 'en')).toEqual({ en: '/about' })
  })
})

describe('mapSeo', () => {
  it('omits empty fields and defaults noIndex to false', () => {
    expect(mapSeo(null)).toEqual({ noIndex: false })
    expect(
      mapSeo({
        title: 'T',
        description: null,
        noIndex: true,
        canonicalOverride: null,
        ogImage: null,
      }),
    ).toEqual({ title: 'T', noIndex: true })
  })
})

describe('mapRichText', () => {
  it('resolves link marks, drops unresolved ones and maps custom blocks', () => {
    const value = mapRichText(
      [
        blockRow(
          'Hello',
          [
            { _type: 'link', _key: 'l1', ...linkRow({ systemRoute: 'contact' }) },
            { _type: 'link', _key: 'l2', ...linkRow() },
          ],
          ['l1', 'l2'],
        ),
        { _type: 'imageWithAlt', _key: 'i1', ...imageRow(), caption: 'Caption' },
        { _type: 'imageWithAlt', _key: 'i2', ...imageRow({ url: null }) },
        { _type: 'callout', _key: 'c1', tone: 'tip', text: 'Brush twice a day' },
        { _type: 'mystery', _key: 'm1' },
      ],
      'en',
    ) as unknown as Record<string, unknown>[]

    expect(value).toHaveLength(3)
    expect(value[0]!.markDefs).toEqual([
      { _type: 'link', _key: 'l1', href: '/en/contact', external: false },
    ])
    expect(value[1]).toMatchObject({ _type: 'image', caption: 'Caption', image: { width: 1200 } })
    expect(value[2]).toEqual({
      _type: 'callout',
      _key: 'c1',
      tone: 'tip',
      text: 'Brush twice a day',
    })
  })

  it('keeps the generated legal blocks (rendered from config)', () => {
    const value = mapRichText(
      [
        { _type: 'cookieTable', _key: 't1', caption: null },
        { _type: 'processorsList', _key: 'p1', caption: 'Who processes data' },
      ],
      'bg',
    ) as unknown as Record<string, unknown>[]
    expect(value).toEqual([
      { _type: 'cookieTable', _key: 't1' },
      { _type: 'processorsList', _key: 'p1', caption: 'Who processes data' },
    ])
  })
})
