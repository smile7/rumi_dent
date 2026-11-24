import { describe, expect, it } from 'vitest'

import { ogImageUrl, sanityImageLoader } from './image-loader'

describe('sanityImageLoader', () => {
  it('adds width, quality, auto format and fit to the CDN url', () => {
    const url = new URL(
      sanityImageLoader({ src: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg', width: 640 }),
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      w: '640',
      q: '75',
      auto: 'format',
      fit: 'max',
    })
  })

  it('keeps an existing crop rect and honours the quality', () => {
    const url = new URL(
      sanityImageLoader({
        src: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg?rect=300,0,600,400',
        width: 1080,
        quality: 60,
      }),
    )
    expect(url.searchParams.get('rect')).toBe('300,0,600,400')
    expect(url.searchParams.get('q')).toBe('60')
  })
})

describe('ogImageUrl', () => {
  it('crops to 1200×630 around the focal point, keeping the editor crop', () => {
    const url = new URL(
      ogImageUrl({
        src: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg?rect=300,0,600,400',
        focalPoint: { x: 25, y: 60 },
      }),
    )
    expect(Object.fromEntries(url.searchParams)).toEqual({
      rect: '300,0,600,400',
      w: '1200',
      h: '630',
      fit: 'crop',
      auto: 'format',
      crop: 'focalpoint',
      'fp-x': '0.25',
      'fp-y': '0.6',
    })
  })

  it('falls back to a centre crop without a focal point', () => {
    const url = new URL(ogImageUrl({ src: 'https://cdn.sanity.io/images/p/d/abc-1x1.jpg' }))
    expect(url.searchParams.get('crop')).toBeNull()
    expect(url.searchParams.get('fit')).toBe('crop')
  })
})
