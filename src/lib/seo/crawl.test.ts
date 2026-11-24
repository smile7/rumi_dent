// @vitest-environment jsdom
import {
  resolveRobots,
  resolveSitemap,
} from 'next/dist/build/webpack/loaders/metadata/resolve-route-data'
import { describe, expect, it } from 'vitest'

import { AI_CRAWLERS } from '@/config/site'
import type { SitemapEntry } from '@/lib/content/types'

import { robotsRules, sitemapFromEntries } from './crawl'

const siteUrl = 'https://example.com'

const entries: SitemapEntry[] = [
  {
    locale: 'bg',
    href: '/',
    path: '/bg',
    lastModified: '2026-11-20T10:00:00Z',
    translations: { bg: '/', en: '/' },
  },
  {
    locale: 'en',
    href: { pathname: '/services/[slug]', params: { slug: 'fillings' } },
    path: '/en/services/fillings',
    lastModified: '2026-11-21T10:00:00Z',
    translations: { en: { pathname: '/services/[slug]', params: { slug: 'fillings' } } },
  },
]

describe('sitemapFromEntries', () => {
  const sitemap = sitemapFromEntries(siteUrl, entries)

  it('lists absolute URLs with lastModified and hreflang alternates for existing translations', () => {
    expect(sitemap).toEqual([
      {
        url: 'https://example.com/bg',
        lastModified: '2026-11-20T10:00:00Z',
        alternates: {
          languages: {
            bg: 'https://example.com/bg',
            en: 'https://example.com/en',
            'x-default': 'https://example.com/bg',
          },
        },
      },
      {
        url: 'https://example.com/en/services/fillings',
        lastModified: '2026-11-21T10:00:00Z',
        alternates: { languages: { en: 'https://example.com/en/services/fillings' } },
      },
    ])
  })

  it('serializes to well-formed sitemap XML with xhtml:link alternates', () => {
    const doc = new DOMParser().parseFromString(resolveSitemap(sitemap), 'application/xml')
    expect(doc.getElementsByTagName('parsererror')).toHaveLength(0)
    expect([...doc.getElementsByTagName('loc')].map((loc) => loc.textContent)).toEqual([
      'https://example.com/bg',
      'https://example.com/en/services/fillings',
    ])
    const links = [...doc.getElementsByTagName('xhtml:link')]
    expect(links.map((link) => link.getAttribute('hreflang'))).toEqual([
      'bg',
      'en',
      'x-default',
      'en',
    ])
  })
})

describe('robotsRules', () => {
  it('disallows everything outside production', () => {
    for (const env of ['preview', 'development'] as const) {
      const robots = resolveRobots(robotsRules({ env, siteUrl, blockedBots: [] }))
      expect(robots).toContain('Disallow: /')
      expect(robots).not.toContain('Allow: /')
      expect(robots).not.toContain('Sitemap:')
    }
  })

  it('allows all in production except admin, api and the styleguide, and points to the sitemap', () => {
    const robots = resolveRobots(robotsRules({ env: 'production', siteUrl, blockedBots: [] }))
    expect(robots).toContain('Allow: /')
    for (const path of ['/admin', '/api', '/*/styleguide']) {
      expect(robots).toContain(`Disallow: ${path}\n`)
    }
    expect(robots).toContain('Sitemap: https://example.com/sitemap.xml')
    expect(robots).not.toContain('GPTBot')
  })

  it('blocks the configured bots when a client opts out of AI crawlers', () => {
    const robots = resolveRobots(
      robotsRules({ env: 'production', siteUrl, blockedBots: AI_CRAWLERS }),
    )
    for (const bot of AI_CRAWLERS) expect(robots).toContain(`User-Agent: ${bot}`)
  })
})
