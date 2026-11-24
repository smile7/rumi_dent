import { describe, expect, it } from 'vitest'

import { bannerScript, dismissKey, isBannerHidden, type BannerState } from './announcement'

const state: BannerState = {
  startsAt: '2026-12-01T00:00:00Z',
  endsAt: '2026-12-27T00:00:00Z',
  pages: 'all',
  storageKey: 'k',
  homePath: '/bg',
}
const at = (iso: string) => Date.parse(iso)
const empty = { getItem: () => null }

describe('isBannerHidden', () => {
  it('hides before the start and from the end on', () => {
    expect(isBannerHidden(state, at('2026-11-30T23:59:59Z'), '/bg', empty)).toBe(true)
    expect(isBannerHidden(state, at('2026-12-01T00:00:00Z'), '/bg', empty)).toBe(false)
    expect(isBannerHidden(state, at('2026-12-26T23:59:59Z'), '/bg', empty)).toBe(false)
    expect(isBannerHidden(state, at('2026-12-27T00:00:00Z'), '/bg', empty)).toBe(true)
  })

  it('never expires without an end date', () => {
    const open = { ...state, endsAt: undefined }
    expect(isBannerHidden(open, at('2030-01-01T00:00:00Z'), '/bg', empty)).toBe(false)
  })

  it('respects a dismissal of this revision', () => {
    const storage = { getItem: (key: string) => (key === 'k' ? '1' : null) }
    expect(isBannerHidden(state, at('2026-12-10T00:00:00Z'), '/bg', storage)).toBe(true)
    expect(
      isBannerHidden({ ...state, storageKey: 'other' }, at('2026-12-10T00:00:00Z'), '/bg', storage),
    ).toBe(false)
  })

  it('shows home-only announcements only on the home path', () => {
    const home = { ...state, pages: 'home' as const }
    expect(isBannerHidden(home, at('2026-12-10T00:00:00Z'), '/bg', empty)).toBe(false)
    expect(isBannerHidden(home, at('2026-12-10T00:00:00Z'), '/bg/uslugi', empty)).toBe(true)
  })

  it('treats unavailable storage as not dismissed', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked')
      },
    }
    expect(isBannerHidden(state, at('2026-12-10T00:00:00Z'), '/bg', throwing)).toBe(false)
    expect(isBannerHidden(state, at('2026-12-10T00:00:00Z'), '/bg', null)).toBe(false)
  })
})

describe('dismissKey', () => {
  it('changes with the revision', () => {
    expect(dismissKey({ id: 'a', updatedAt: '1' })).not.toBe(
      dismissKey({ id: 'a', updatedAt: '2' }),
    )
  })
})

describe('bannerScript', () => {
  function run(script: string) {
    const element = { id: 'banner', hidden: false }
    const document = { getElementById: (id: string) => (id === element.id ? element : null) }
    new Function('document', 'window', 'location', script)(
      document,
      { sessionStorage: empty },
      { pathname: '/bg' },
    )
    return element.hidden
  }

  it('runs the same check inline', () => {
    const expired = { ...state, startsAt: '2020-01-01T00:00:00Z', endsAt: '2020-02-01T00:00:00Z' }
    expect(run(bannerScript('banner', expired))).toBe(true)
    expect(run(bannerScript('banner', { ...expired, endsAt: undefined }))).toBe(false)
  })
})
