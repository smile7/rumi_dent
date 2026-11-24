import { describe, expect, it } from 'vitest'

import {
  findPlaceholders,
  hreflangProblems,
  jsonLdProblems,
  missingSecurityHeaders,
  type PageHead,
  parseHead,
  parseRobots,
  parseSitemap,
  txtRecords,
} from './parse'

const html = `<html><head>
<link rel="canonical" href="https://x.bg/bg/uslugi"/>
<link rel="alternate" hrefLang="bg" href="https://x.bg/bg/uslugi"/>
<link rel="alternate" hrefLang="en" href="https://x.bg/en/services"/>
<link rel="alternate" hrefLang="x-default" href="https://x.bg/bg/uslugi"/>
<meta name="robots" content="index, follow"/>
<meta property="og:image" content="https://x.bg/bg/opengraph-image?a=1&amp;b=2"/>
<script type="application/ld+json">{"@context":"https://schema.org"}</script>
</head><body><p>[[clinicName]]</p><script>self.__next_f.push([[1,"[[notVisible]]"]])</script></body></html>`

describe('parseHead', () => {
  it('reads canonical, alternates, robots, og:image and JSON-LD', () => {
    const head = parseHead(html)
    expect(head.canonical).toBe('https://x.bg/bg/uslugi')
    expect(head.alternates).toEqual({
      bg: 'https://x.bg/bg/uslugi',
      en: 'https://x.bg/en/services',
      'x-default': 'https://x.bg/bg/uslugi',
    })
    expect(head.robots).toBe('index, follow')
    expect(head.ogImage).toBe('https://x.bg/bg/opengraph-image?a=1&b=2')
    expect(jsonLdProblems(head)).toEqual([])
  })

  it('reports JSON-LD that does not parse', () => {
    expect(jsonLdProblems({ alternates: {}, jsonLd: ['{oops'] })).toHaveLength(1)
  })
})

describe('findPlaceholders', () => {
  it('finds visible placeholders and ignores script payloads', () => {
    expect(findPlaceholders(html)).toEqual(['[[clinicName]]'])
  })
})

describe('parseSitemap', () => {
  it('lists every loc', () => {
    expect(
      parseSitemap(
        '<urlset><url><loc>https://x.bg/bg</loc></url><url><loc>https://x.bg/en</loc></url></urlset>',
      ),
    ).toEqual(['https://x.bg/bg', 'https://x.bg/en'])
  })
})

describe('parseRobots', () => {
  it('allows a production robots file', () => {
    expect(
      parseRobots('User-Agent: *\nAllow: /\nDisallow: /admin\n\nSitemap: https://x.bg/sitemap.xml'),
    ).toEqual({ disallowsAll: false, sitemaps: ['https://x.bg/sitemap.xml'] })
  })

  it('detects a preview robots file', () => {
    expect(parseRobots('User-Agent: *\nDisallow: /').disallowsAll).toBe(true)
  })

  it('ignores a full block for a single bot', () => {
    expect(
      parseRobots('User-Agent: GPTBot\nDisallow: /\n\nUser-Agent: *\nAllow: /').disallowsAll,
    ).toBe(false)
  })
})

describe('hreflangProblems', () => {
  const page = (alternates: Record<string, string>): PageHead => ({ alternates, jsonLd: [] })

  it('passes reciprocal pairs', () => {
    const pages = new Map([
      ['https://x.bg/bg', page({ bg: 'https://x.bg/bg', en: 'https://x.bg/en' })],
      ['https://x.bg/en', page({ bg: 'https://x.bg/bg', en: 'https://x.bg/en' })],
    ])
    expect(hreflangProblems(pages)).toEqual([])
  })

  it('reports a missing return link and a target outside the sitemap', () => {
    const pages = new Map([
      ['https://x.bg/bg', page({ en: 'https://x.bg/en' })],
      ['https://x.bg/en', page({ en: 'https://x.bg/en' })],
      ['https://x.bg/bg/a', page({ en: 'https://x.bg/en/gone' })],
    ])
    expect(hreflangProblems(pages)).toEqual([
      "https://x.bg/en doesn't link back to https://x.bg/bg",
      'https://x.bg/bg/a → en https://x.bg/en/gone is not in the sitemap',
    ])
  })
})

describe('missingSecurityHeaders', () => {
  it('accepts a report-only CSP', () => {
    const headers = new Headers({
      'strict-transport-security': 'max-age=1',
      'x-content-type-options': 'nosniff',
      'referrer-policy': 'strict-origin-when-cross-origin',
      'permissions-policy': 'camera=()',
      'content-security-policy-report-only': "default-src 'self'",
    })
    expect(missingSecurityHeaders(headers)).toEqual([])
    expect(missingSecurityHeaders(new Headers())).toHaveLength(5)
  })
})

describe('txtRecords', () => {
  it('joins split TXT strings and drops other record types', () => {
    expect(
      txtRecords({
        Answer: [
          { type: 16, data: '"v=DKIM1; p=abc" "def"' },
          { type: 5, data: 'alias.example.' },
        ],
      }),
    ).toEqual(['v=DKIM1; p=abcdef'])
  })
})
