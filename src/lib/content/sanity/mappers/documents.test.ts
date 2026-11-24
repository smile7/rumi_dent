import { describe, expect, it } from 'vitest'

import type { ArticleQueryRow, LegalPageQueryRow, PageQueryRow } from '../query-types'
import { mapArticle, mapLegalPage, mapPage } from './documents'
import { blockRow, fixture } from './fixtures'

const summary = (n: number) => ({
  _id: `a${n}`,
  title: `Article ${n}`,
  slug: `article-${n}`,
  excerpt: 'Excerpt',
  cover: null,
  publishedAt: '2026-11-01T08:00:00Z',
  updatedAt: null,
})

describe('mapPage', () => {
  it('maps a system page with its translations and ignores its slug', () => {
    const page = mapPage(
      fixture<PageQueryRow>({
        _id: 'p1',
        pageKey: 'about',
        title: 'За нас',
        slug: 'ignored',
        intro: null,
        seo: null,
        hideFromNav: null,
        hideFromSitemap: true,
        sections: [],
        translations: [
          { locale: 'bg', doc: { _type: 'page', slug: null, pageKey: 'about' } },
          { locale: 'en', doc: { _type: 'page', slug: null, pageKey: 'about' } },
        ],
      }),
      'bg',
    )
    expect(page).toEqual({
      id: 'p1',
      pageKey: 'about',
      title: 'За нас',
      sections: [],
      seo: { noIndex: false },
      hideFromNav: false,
      hideFromSitemap: true,
      translations: { bg: '/about', en: '/about' },
    })
  })

  it('returns null without a title or without both pageKey and slug', () => {
    expect(mapPage(null, 'bg')).toBeNull()
    expect(mapPage(fixture<PageQueryRow>({ _id: 'p', title: null, slug: 'x' }), 'bg')).toBeNull()
    expect(
      mapPage(fixture<PageQueryRow>({ _id: 'p', title: 'T', slug: null, pageKey: null }), 'bg'),
    ).toBeNull()
  })
})

describe('mapArticle', () => {
  it('computes the reading time and falls back to the latest articles for related', () => {
    const article = mapArticle(
      fixture<ArticleQueryRow>({
        ...summary(1),
        body: [blockRow('Body')],
        wordCount: 401,
        author: null,
        reviewedBy: { _id: 't1', name: 'Д-р Иванова', role: 'Детски зъболекар' },
        related: [],
        latest: [summary(2), summary(3)],
        seo: null,
        translations: null,
      }),
      'en',
    )
    expect(article).toMatchObject({
      href: '/en/blog/article-1',
      readingTimeMinutes: 3,
      author: null,
      reviewedBy: { id: 't1', name: 'Д-р Иванова' },
      related: [{ id: 'a2' }, { id: 'a3' }],
      translations: { en: { pathname: '/blog/[slug]', params: { slug: 'article-1' } } },
    })
  })
})

describe('mapLegalPage', () => {
  it('maps a legal page and requires a kind', () => {
    const row = {
      _id: 'l1',
      kind: 'privacy',
      title: 'Privacy',
      slug: 'privacy',
      body: [],
      lastUpdated: '2026-11-01',
      translations: null,
    }
    expect(mapLegalPage(fixture<LegalPageQueryRow>(row), 'en')).toMatchObject({
      kind: 'privacy',
      lastUpdated: '2026-11-01',
      translations: { en: { pathname: '/legal/[slug]', params: { slug: 'privacy' } } },
    })
    expect(mapLegalPage(fixture<LegalPageQueryRow>({ ...row, kind: null }), 'en')).toBeNull()
  })

  it('builds the h2 table of contents and collects unreplaced placeholders', () => {
    const block = (key: string, style: string, text: string) => ({
      _type: 'block',
      _key: key,
      style,
      markDefs: [],
      children: [{ _type: 'span', _key: `${key}s`, text, marks: [] }],
    })
    const page = mapLegalPage(
      fixture<LegalPageQueryRow>({
        _id: 'l1',
        kind: 'privacy',
        title: 'Privacy [[CLINIC_NAME]]',
        slug: 'privacy',
        body: [
          block('a', 'h2', 'Who we are'),
          block('b', 'normal', 'Contact [[DPO_EMAIL]] or [[CLINIC_NAME]].'),
          block('c', 'h3', 'Not in the TOC'),
          block('d', 'h2', 'Your rights'),
        ],
        lastUpdated: null,
        translations: null,
      }),
      'en',
    )
    expect(page?.toc).toEqual([
      { id: 'h-a', text: 'Who we are' },
      { id: 'h-d', text: 'Your rights' },
    ])
    expect(page?.placeholders).toEqual(['[[CLINIC_NAME]]', '[[DPO_EMAIL]]'])
    expect(page?.excerpt).toBe('Contact [[DPO_EMAIL]] or [[CLINIC_NAME]].')
  })

  it('shortens a long first paragraph to a ~160 character excerpt at a word boundary', () => {
    const long = 'Word '.repeat(60).trim()
    const page = mapLegalPage(
      fixture<LegalPageQueryRow>({
        _id: 'l1',
        kind: 'terms',
        title: 'Terms',
        slug: 'terms',
        body: [
          {
            _type: 'block',
            _key: 'a',
            style: 'normal',
            markDefs: [],
            children: [{ _type: 'span', _key: 'as', text: long, marks: [] }],
          },
        ],
        lastUpdated: null,
        translations: null,
      }),
      'en',
    )
    expect(page?.excerpt?.length).toBeLessThanOrEqual(160)
    expect(page?.excerpt).toMatch(/^Word( Word)+…$/)
  })
})
