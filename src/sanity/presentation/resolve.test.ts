import { describe, expect, it } from 'vitest'

import { getPathname } from '@/i18n/navigation'

import { documentLocations, localizedPath, mainDocuments } from './resolve'

describe('Presentation resolver', () => {
  it('builds the same paths as next-intl', () => {
    expect(localizedPath('/', 'bg')).toBe(getPathname({ locale: 'bg', href: '/' }))
    expect(localizedPath('/services/[slug]', 'bg', 'plombi')).toBe(
      getPathname({
        locale: 'bg',
        href: { pathname: '/services/[slug]', params: { slug: 'plombi' } },
      }),
    )
    expect(localizedPath('/legal/[slug]', 'en', 'privacy-policy')).toBe(
      getPathname({
        locale: 'en',
        href: { pathname: '/legal/[slug]', params: { slug: 'privacy-policy' } },
      }),
    )
  })

  it('locates routable documents in their language', () => {
    expect(documentLocations('page', { title: 'Начало', pageKey: 'home', language: 'bg' })).toEqual(
      [{ title: 'Начало', href: '/bg' }],
    )
    expect(
      documentLocations('page', { title: 'First visit', slug: 'first-visit', language: 'en' }),
    ).toEqual([{ title: 'First visit', href: '/en/first-visit' }])
    expect(
      documentLocations('service', {
        title: 'Пломби',
        slug: 'plombi',
        hasDetailPage: false,
        language: 'bg',
      }),
    ).toEqual([{ title: 'Пломби', href: '/bg/uslugi#plombi' }])
    expect(
      documentLocations('article', { title: 'Post', slug: 'post', language: 'en' })[0],
    ).toEqual({
      title: 'Post',
      href: '/en/blog/post',
    })
    expect(
      documentLocations('legalPage', { title: 'Privacy', slug: 'privacy', language: 'xx' }),
    ).toEqual([])
  })

  it('maps URLs to main documents, system pages before the generic page route', () => {
    const routes = mainDocuments.map((resolver) => resolver.route)
    expect(routes).toContain('/bg/uslugi/:slug')
    expect(routes).toContain('/en/legal/:slug')
    expect(routes.indexOf('/bg/za-nas')).toBeLessThan(routes.indexOf('/bg/:slug'))
  })
})
