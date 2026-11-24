import { describe, expect, it } from 'vitest'

import { siteRedirects, toNextRedirects } from './redirects'

describe('toNextRedirects', () => {
  it('marks every entry permanent (308)', () => {
    expect(toNextRedirects([{ source: '/old/:slug', destination: '/bg/uslugi/:slug' }])).toEqual([
      { source: '/old/:slug', destination: '/bg/uslugi/:slug', permanent: true },
    ])
  })

  it('has unique, absolute sources that do not redirect to themselves', () => {
    const sources = siteRedirects.map((entry) => entry.source)
    expect(new Set(sources).size).toBe(sources.length)
    for (const { source, destination } of siteRedirects) {
      expect(source.startsWith('/')).toBe(true)
      expect(destination).not.toBe(source)
    }
  })
})
