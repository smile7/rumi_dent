import { describe, expect, it } from 'vitest'

import type { SitemapQueryResult } from '../query-types'
import { fixture, stega } from './fixtures'
import { mapSitemapEntries } from './sitemap'

type Doc = { _type: string; slug?: string | null; pageKey?: string | null; hasDetailPage?: boolean }

const route = ({ slug = null, pageKey = null, hasDetailPage, ...rest }: Doc) => ({
  title: null,
  slug,
  pageKey,
  hasDetailPage: hasDetailPage ?? null,
  ...rest,
})

const row = (doc: Doc, language: string, translations: { locale: string; doc: Doc }[] = []) => ({
  ...route(doc),
  language,
  _updatedAt: '2026-11-20T10:00:00Z',
  translations: translations.map((t) => ({ locale: t.locale, doc: route(t.doc) })),
})

const homeBg = { _type: 'page', pageKey: 'home' }
const serviceBg = { _type: 'service', slug: 'plombi', hasDetailPage: true }
const serviceEn = { _type: 'service', slug: 'fillings', hasDetailPage: true }
const firstVisitBg = { _type: 'page', slug: 'parvo-poseshtenie' }
const firstVisitEn = { _type: 'page', slug: 'first-visit' }

const rows = fixture<SitemapQueryResult>([
  row(homeBg, 'bg', [
    { locale: 'bg', doc: homeBg },
    { locale: 'en', doc: homeBg },
  ]),
  row(homeBg, 'en', [
    { locale: 'bg', doc: homeBg },
    { locale: 'en', doc: homeBg },
  ]),
  row(serviceBg, stega('bg'), [
    { locale: 'bg', doc: serviceBg },
    { locale: 'en', doc: serviceEn },
  ]),
  row(serviceEn, 'en', [
    { locale: 'bg', doc: serviceBg },
    { locale: 'en', doc: serviceEn },
  ]),
  // The EN translation is noIndex, so the query left it out.
  row(firstVisitBg, 'bg', [
    { locale: 'bg', doc: firstVisitBg },
    { locale: 'en', doc: firstVisitEn },
  ]),
  row({ _type: 'legalPage', slug: 'privacy-policy' }, 'en'),
  row({ _type: 'article', slug: 'orphan' }, 'xx'),
])

describe('mapSitemapEntries', () => {
  const entries = mapSitemapEntries(rows)
  const byPath = Object.fromEntries(entries.map((entry) => [entry.path, entry]))

  it('builds localized paths for system pages and slug routes in both languages', () => {
    expect(entries.map((entry) => entry.path)).toEqual([
      '/bg',
      '/en',
      '/bg/uslugi/plombi',
      '/en/services/fillings',
      '/bg/parvo-poseshtenie',
      '/en/legal/privacy-policy',
    ])
    expect(byPath['/bg/uslugi/plombi']).toMatchObject({
      locale: 'bg',
      href: { pathname: '/services/[slug]', params: { slug: 'plombi' } },
      lastModified: '2026-11-20T10:00:00Z',
    })
  })

  it('keeps alternates that are in the sitemap and drops the rest', () => {
    expect(byPath['/bg']!.translations).toEqual({ bg: '/', en: '/' })
    expect(byPath['/en/services/fillings']!.translations).toEqual({
      bg: { pathname: '/services/[slug]', params: { slug: 'plombi' } },
      en: { pathname: '/services/[slug]', params: { slug: 'fillings' } },
    })
    expect(byPath['/bg/parvo-poseshtenie']!.translations).toEqual({
      bg: { pathname: '/[slug]', params: { slug: 'parvo-poseshtenie' } },
    })
  })

  it('handles an empty dataset', () => {
    expect(mapSitemapEntries(null)).toEqual([])
  })
})
