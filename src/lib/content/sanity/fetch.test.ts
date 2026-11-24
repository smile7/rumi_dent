import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  isEnabled: false,
  fetch: vi.fn(),
  draftMode: vi.fn(),
}))

vi.mock('server-only', () => ({}))
vi.mock('next/headers', () => ({ draftMode: mocks.draftMode }))
vi.mock('./client', () => ({ client: { fetch: mocks.fetch } }))
vi.mock('./token', () => ({ readToken: () => 'secret-token' }))

const { sanityFetch } = await import('./fetch')

const query = '*[_type == "page"][0]'

beforeEach(() => {
  mocks.fetch.mockReset().mockResolvedValue({ ok: true })
  mocks.draftMode.mockReset().mockImplementation(async () => ({ isEnabled: mocks.isEnabled }))
  mocks.isEnabled = false
})

describe('sanityFetch', () => {
  it('reads published content from the CDN without a token when draft mode is off', async () => {
    await expect(sanityFetch({ query, params: { locale: 'bg' } })).resolves.toEqual({ ok: true })

    expect(mocks.fetch).toHaveBeenCalledWith(
      query,
      { locale: 'bg' },
      { perspective: 'published', useCdn: true, stega: false },
    )
    const options = mocks.fetch.mock.calls[0]![2] as Record<string, unknown>
    expect(options).not.toHaveProperty('token')
    expect(options).not.toHaveProperty('next')
    expect(options).not.toHaveProperty('cache')
  })

  it('uses drafts, the token, no CDN and stega when draft mode is on', async () => {
    mocks.isEnabled = true
    await sanityFetch({ query })

    expect(mocks.fetch).toHaveBeenCalledWith(
      query,
      {},
      {
        perspective: 'drafts',
        useCdn: false,
        token: 'secret-token',
        stega: true,
        cache: 'no-store',
      },
    )
  })

  it('lets callers turn stega off in draft mode (metadata, JSON-LD)', async () => {
    mocks.isEnabled = true
    await sanityFetch({ query, stega: false })

    expect(mocks.fetch.mock.calls[0]![2]).toMatchObject({ perspective: 'drafts', stega: false })
  })

  it('skips draftMode() when a perspective is forced (static params, sitemap)', async () => {
    await sanityFetch({ query, perspective: 'published' })

    expect(mocks.draftMode).not.toHaveBeenCalled()
    expect(mocks.fetch.mock.calls[0]![2]).toEqual({
      perspective: 'published',
      useCdn: true,
      stega: false,
    })
  })
})
