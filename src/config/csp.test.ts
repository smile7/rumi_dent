import { describe, expect, it } from 'vitest'

import { adminCsp, analyticsHosts, CSP_HEADER, publicCsp, securityHeaders } from './csp'

function directive(policy: string, name: string): string[] {
  const entry = policy.split('; ').find((part) => part.startsWith(`${name} `))
  return entry ? entry.split(' ').slice(1) : []
}

const none = { provider: 'none' } as const

describe('analyticsHosts', () => {
  it('adds nothing without analytics', () => {
    expect(analyticsHosts(none)).toEqual({ script: [], connect: [], img: [] })
  })

  it('uses the Umami script origin for scripts and events', () => {
    const hosts = analyticsHosts({
      provider: 'umami',
      websiteId: 'x',
      src: 'https://cloud.umami.is/script.js',
    })
    expect(hosts.script).toEqual(['https://cloud.umami.is'])
    expect(hosts.connect).toEqual(['https://cloud.umami.is'])
  })

  it('allows GA4 only when it is the provider', () => {
    expect(analyticsHosts({ provider: 'ga4', measurementId: 'G-1' }).script).toEqual([
      'https://www.googletagmanager.com',
    ])
    expect(analyticsHosts({ provider: 'cloudflare', token: 't' }).script).toEqual([
      'https://static.cloudflareinsights.com',
    ])
  })
})

describe('publicCsp', () => {
  const policy = publicCsp({
    analytics: { provider: 'cloudflare', token: 't' },
    studioUrl: '/admin',
  })

  it('keeps the strict directives', () => {
    expect(directive(policy, 'object-src')).toEqual(["'none'"])
    expect(directive(policy, 'base-uri')).toEqual(["'self'"])
    expect(directive(policy, 'frame-ancestors')).toEqual(["'self'"])
    expect(directive(policy, 'script-src')).not.toContain("'unsafe-eval'")
  })

  it('allows Turnstile, Google Maps and the analytics host', () => {
    expect(directive(policy, 'frame-src')).toEqual([
      'https://www.google.com/maps/',
      'https://challenges.cloudflare.com',
    ])
    expect(directive(policy, 'script-src')).toContain('https://static.cloudflareinsights.com')
    expect(directive(policy, 'connect-src')).toContain('https://cloudflareinsights.com')
  })

  it('lets a hosted Studio frame the site for Presentation', () => {
    const hosted = publicCsp({ analytics: none, studioUrl: 'https://rumi.sanity.studio/' })
    expect(directive(hosted, 'frame-ancestors')).toEqual(["'self'", 'https://rumi.sanity.studio'])
  })
})

describe('adminCsp', () => {
  it('allows Sanity APIs and websockets but no eval', () => {
    const policy = adminCsp()
    expect(directive(policy, 'connect-src')).toContain('wss://*.sanity.io')
    expect(directive(policy, 'script-src')).not.toContain("'unsafe-eval'")
  })
})

describe('securityHeaders', () => {
  it('sends the CSP in report-only mode', () => {
    expect(CSP_HEADER).toBe('Content-Security-Policy-Report-Only')
  })

  it('scopes the public and admin policies to disjoint paths', () => {
    const rules = securityHeaders({ analytics: none, studioUrl: '/admin' })
    const publicRule = rules.find((rule) => rule.source.startsWith('/(('))
    const publicPattern = new RegExp(`^${publicRule?.source}$`)
    for (const path of ['/', '/bg', '/en/services/x', '/bg/administratsiya']) {
      expect(publicPattern.test(path)).toBe(true)
    }
    for (const path of ['/admin', '/admin/structure/page']) {
      expect(publicPattern.test(path)).toBe(false)
    }
  })

  it('drops X-Frame-Options when the Studio is hosted elsewhere', () => {
    const keys = (studioUrl: string) =>
      securityHeaders({ analytics: none, studioUrl })[0]?.headers.map((header) => header.key)
    expect(keys('/admin')).toContain('X-Frame-Options')
    expect(keys('https://rumi.sanity.studio')).not.toContain('X-Frame-Options')
  })
})
