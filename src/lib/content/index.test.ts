import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { defaultLocale } from '@/config/i18n'

const mocks = vi.hoisted(() => ({ sanityFetch: vi.fn(), draftMode: vi.fn() }))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ draftMode: mocks.draftMode }))
vi.mock('./sanity/fetch', () => ({ sanityFetch: mocks.sanityFetch }))

const content = await import('./index')

const lastCall = () => mocks.sanityFetch.mock.calls.at(-1)![0] as Record<string, unknown>

beforeEach(() => {
  mocks.sanityFetch.mockReset()
  mocks.draftMode.mockReset().mockResolvedValue({ isEnabled: false })
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.restoreAllMocks()
})

describe('content API', () => {
  it('passes the locale and the default-locale fallback to every query', async () => {
    mocks.sanityFetch.mockResolvedValue(null)
    await content.getPageByKey('home', 'en')

    expect(lastCall().params).toEqual({ locale: 'en', fallback: defaultLocale, key: 'home' })
  })

  it('returns null and logs when a document is missing, without throwing', async () => {
    mocks.sanityFetch.mockResolvedValue(null)

    await expect(content.getPageBySlug('missing-page', 'bg')).resolves.toBeNull()
    await expect(content.getSiteSettings('bg')).resolves.toBeNull()
    await expect(content.getArticleBySlug('missing-article', 'bg')).resolves.toBeNull()
    expect(console.warn).toHaveBeenCalledWith('[content] page /missing-page (bg) not found')
  })

  it('returns empty lists for missing collections', async () => {
    mocks.sanityFetch.mockResolvedValue(null)

    await expect(content.getTeam('bg')).resolves.toEqual([])
    await expect(content.getFaq('bg', { category: 'children' })).resolves.toEqual([])
    expect(lastCall().params).toMatchObject({ category: 'children' })
  })

  it('lets a failed request throw so the build fails instead of shipping empty pages', async () => {
    mocks.sanityFetch.mockRejectedValue(new Error('network down'))

    await expect(content.getServiceBySlug('failing-service', 'bg')).rejects.toThrow('network down')
  })

  it('turns omitted filters into null params', async () => {
    mocks.sanityFetch.mockResolvedValue([])
    await content.getServices('bg')
    expect(lastCall().params).toMatchObject({ category: null })

    await content.getGallery('bg')
    expect(lastCall().params).toMatchObject({ album: null, limit: 100 })

    await content.getTestimonials('bg', { featured: true })
    expect(lastCall().params).toMatchObject({ featured: true })
  })

  it('pages articles with a 1-based page number', async () => {
    mocks.sanityFetch.mockResolvedValue({ items: [], total: 19 })
    const result = await content.getArticles('bg', { page: 3, pageSize: 9 })

    expect(lastCall().params).toMatchObject({ start: 18, end: 27 })
    expect(result).toEqual({ items: [], total: 19, pages: 3 })
  })

  it('reads static slugs published and stega-free, dropping unknown locales', async () => {
    mocks.sanityFetch.mockResolvedValue([
      { slug: 'about-us', language: 'en' },
      { slug: 'za-nas', language: 'bg' },
      { slug: 'orphan', language: 'xx' },
      { slug: null, language: 'bg' },
    ])

    await expect(content.getStaticSlugs('page')).resolves.toEqual([
      { locale: 'en', slug: 'about-us' },
      { locale: 'bg', slug: 'za-nas' },
    ])
    expect(lastCall()).toMatchObject({
      stega: false,
      perspective: 'published',
      params: { type: 'page' },
    })
  })

  it('gives each [slug] route the slugs of one locale', async () => {
    mocks.sanityFetch.mockResolvedValue([
      { slug: 'first-visit', language: 'en' },
      { slug: 'parvo-poseshtenie', language: 'bg' },
    ])

    await expect(content.getStaticParams('legalPage', 'bg')).resolves.toEqual([
      { slug: 'parvo-poseshtenie' },
    ])
  })

  it('prerenders blog pages 2…N, page 1 being /blog', async () => {
    mocks.sanityFetch.mockResolvedValue({ items: [], total: 19 })
    await expect(content.getArticlePageParams('bg')).resolves.toEqual([{ n: '2' }, { n: '3' }])
    expect(lastCall()).toMatchObject({ stega: false, perspective: 'published' })

    mocks.sanityFetch.mockResolvedValue({ items: [], total: 0 })
    await expect(content.getArticlePageParams('en')).resolves.toEqual([])
  })

  it('reads sitemap entries published and stega-free', async () => {
    mocks.sanityFetch.mockResolvedValue([])
    await expect(content.getSitemapEntries()).resolves.toEqual([])
    expect(lastCall()).toMatchObject({ stega: false, perspective: 'published' })
  })

  it('strips stega from nested content for metadata and JSON-LD', () => {
    const marker = '\u200b\u200c\u200d\ufeff'.repeat(8)
    const seo = {
      title: `Детска стоматология${marker}`,
      nested: [{ name: `Д-р Иванова${marker}` }],
      n: 3,
    }

    const plain = content.withoutStega(seo)

    expect(plain).toEqual({ title: 'Детска стоматология', nested: [{ name: 'Д-р Иванова' }], n: 3 })
    expect(JSON.stringify(plain)).not.toMatch(/[\u200b-\u200d\ufeff]/)
    expect(content.withoutStega(plain)).toEqual(plain)
  })

  it('returns a legal page with placeholders in draft mode even when env is production', async () => {
    mocks.draftMode.mockResolvedValue({ isEnabled: true })
    vi.stubEnv('NEXT_PUBLIC_ENV', 'production')
    mocks.sanityFetch.mockResolvedValue({
      _id: 'l1',
      kind: 'privacy',
      title: 'Privacy [[CLINIC_NAME]]',
      slug: 'privacy',
      body: [],
      lastUpdated: null,
      translations: null,
    })

    const page = await content.getLegalPage('privacy', 'en')

    expect(page?.placeholders).toEqual(['[[CLINIC_NAME]]'])
    vi.unstubAllEnvs()
  })

  it('returns no translations for a missing or non-routable document', async () => {
    mocks.sanityFetch.mockResolvedValue(null)
    await expect(content.getTranslations('missing-doc')).resolves.toEqual({})

    mocks.sanityFetch.mockResolvedValue({
      _type: 'siteSettings',
      language: 'bg',
      translations: null,
    })
    await expect(content.getTranslations('siteSettings-bg')).resolves.toEqual({})
  })
})
