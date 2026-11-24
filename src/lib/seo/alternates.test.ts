import { describe, expect, it } from 'vitest'

import { inAllLocales } from '@/lib/i18n/translations'

import { buildAlternates } from './alternates'

describe('buildAlternates', () => {
  it('localizes a static route in every locale, with x-default on the default locale', () => {
    expect(buildAlternates('en', inAllLocales('/services'))).toEqual({
      canonical: '/en/services',
      languages: { bg: '/bg/uslugi', en: '/en/services', 'x-default': '/bg/uslugi' },
    })
  })

  it('keeps the locale prefix on the home page', () => {
    expect(buildAlternates('bg', inAllLocales('/'))).toEqual({
      canonical: '/bg',
      languages: { bg: '/bg', en: '/en', 'x-default': '/bg' },
    })
  })

  it('fills dynamic params, with a different slug per locale', () => {
    const alternates = buildAlternates('bg', {
      bg: { pathname: '/services/[slug]', params: { slug: 'detska-stomatologiya' } },
      en: { pathname: '/services/[slug]', params: { slug: 'paediatric-dentistry' } },
    })
    expect(alternates).toEqual({
      canonical: '/bg/uslugi/detska-stomatologiya',
      languages: {
        bg: '/bg/uslugi/detska-stomatologiya',
        en: '/en/services/paediatric-dentistry',
        'x-default': '/bg/uslugi/detska-stomatologiya',
      },
    })
  })

  it('omits a missing translation', () => {
    const alternates = buildAlternates('bg', {
      bg: { pathname: '/blog/[slug]', params: { slug: 'parva-vizita' } },
    })
    expect(alternates.languages).toEqual({
      bg: '/bg/blog/parva-vizita',
      'x-default': '/bg/blog/parva-vizita',
    })
  })

  it('omits x-default when the default-locale version is missing', () => {
    const alternates = buildAlternates('en', {
      en: { pathname: '/blog/[slug]', params: { slug: 'first-visit' } },
    })
    expect(alternates).toEqual({
      canonical: '/en/blog/first-visit',
      languages: { en: '/en/blog/first-visit' },
    })
  })

  it('throws when the current locale has no href', () => {
    expect(() =>
      buildAlternates('en', { bg: { pathname: '/blog/[slug]', params: { slug: 'x' } } }),
    ).toThrow(/no "en" href/)
  })
})
