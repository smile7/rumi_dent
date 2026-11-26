import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SectionQueryRow } from '../query-types'
import { fixture, imageRow, stega } from './fixtures'
import { mapSections } from './sections'

const base = { tone: null, spacing: null, anchorId: null }
const rows = (...sections: unknown[]) => fixture<SectionQueryRow[]>(sections)

afterEach(() => {
  vi.unstubAllEnvs()
  vi.restoreAllMocks()
})

describe('mapSections', () => {
  it('maps a hero with defaults and stega-cleaned variants', () => {
    const [hero] = mapSections(
      rows({
        ...base,
        _key: 'h1',
        _type: 'section.hero',
        tone: stega('brand'),
        anchorId: stega('top'),
        heading: 'Smiles for kids',
        subheading: null,
        variant: null,
        image: imageRow(),
        ctas: [{ _key: 'c', label: 'Call us', action: 'call', style: 'primary', link: null }],
        trustItems: [
          { _key: 't1', icon: 'baby', text: 'Kids first' },
          { _key: 't2', icon: null, text: null },
        ],
      }),
      'bg',
    )
    expect(hero).toMatchObject({
      type: 'hero',
      key: 'h1',
      tone: 'brand',
      spacing: 'default',
      anchorId: 'top',
      variant: 'split',
      ctas: [{ label: 'Call us', action: 'call' }],
      trustItems: [{ key: 't1', icon: 'baby', text: 'Kids first' }],
    })
    expect(hero).not.toHaveProperty('subheading')
  })

  it('drops sections missing required content and unknown types (with a dev warning)', () => {
    vi.stubEnv('NODE_ENV', 'development')
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const sections = mapSections(
      rows(
        { ...base, _key: 'a', _type: 'section.hero', heading: null },
        { ...base, _key: 'b', _type: 'section.priceList' },
        { ...base, _key: 'c', _type: 'section.contactHours', heading: 'Hours', showMap: true },
      ),
      'bg',
    )
    expect(sections.map((s) => s.type)).toEqual(['contactHours'])
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('section.priceList'))
  })

  it('maps service-sourced tiles to tile items', () => {
    const [tiles] = mapSections(
      rows({
        ...base,
        _key: 't',
        _type: 'section.tiles',
        source: 'services',
        heading: 'Services',
        items: null,
        services: [
          {
            _id: 's1',
            title: 'Fillings',
            slug: 'fillings',
            icon: 'smile',
            image: null,
            teaser: 'Gentle fillings',
            summary: [],
            hasDetailPage: false,
            category: null,
          },
        ],
      }),
      'en',
    )
    expect(tiles).toMatchObject({
      type: 'tiles',
      source: 'services',
      density: 'comfortable',
      layout: 'grid',
      allowMultiple: false,
      items: [{ key: 's1', title: 'Fillings', slug: 'fillings', icon: 'smile', cta: null }],
    })
  })

  it('limits blog teasers to count and gallery items to limit, and treats unset emitSchema as on', () => {
    const article = (n: number) => ({
      _id: `a${n}`,
      title: `Article ${n}`,
      slug: `article-${n}`,
      excerpt: 'Excerpt',
      cover: null,
      publishedAt: '2026-11-01T08:00:00Z',
      updatedAt: null,
    })
    const photo = (n: number) => ({ _id: `g${n}`, album: 'clinic', image: imageRow() })
    const [blog, gallery, faq] = mapSections(
      rows(
        {
          ...base,
          _key: 'b',
          _type: 'section.blogTeaser',
          heading: null,
          count: 2,
          articles: [1, 2, 3].map(article),
        },
        {
          ...base,
          _key: 'g',
          _type: 'section.gallery',
          heading: null,
          limit: 1,
          showLinkToGallery: true,
          items: [1, 2].map(photo),
        },
        {
          ...base,
          _key: 'f',
          _type: 'section.faq',
          heading: null,
          intro: null,
          emitSchema: null,
          items: [],
        },
      ),
      'bg',
    )
    expect(blog).toMatchObject({
      type: 'blogTeaser',
      layout: 'grid',
      articles: [{ href: '/bg/blog/article-1' }, { id: 'a2' }],
    })
    expect(blog?.type === 'blogTeaser' && blog.articles).toHaveLength(2)
    expect(gallery?.type === 'gallery' && gallery.items).toHaveLength(1)
    expect(faq).toMatchObject({ type: 'faq', emitSchema: true, layout: 'accordion' })
  })
})
