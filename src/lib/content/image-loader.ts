import type { ImageLoaderProps } from 'next/image'

import type { ImageAsset } from './types'

export const DEFAULT_IMAGE_QUALITY = 75

/**
 * `next/image` loader for Sanity CDN images (ADR-005): the CDN resizes and picks the format, so
 * these images skip the Cloudflare Images binding. `src` may already carry a crop `rect`.
 */
export function sanityImageLoader({ src, width, quality }: ImageLoaderProps): string {
  const url = new URL(src)
  url.searchParams.set('w', String(width))
  url.searchParams.set('q', String(quality ?? DEFAULT_IMAGE_QUALITY))
  url.searchParams.set('auto', 'format')
  url.searchParams.set('fit', 'max')
  return url.toString()
}

export const OG_IMAGE_SIZE = { width: 1200, height: 630 } as const

/** Open Graph image: a 1200×630 CDN crop around the editor's hotspot (SEO.md §5). */
export function ogImageUrl(image: Pick<ImageAsset, 'src' | 'focalPoint'>): string {
  const url = new URL(image.src)
  url.searchParams.set('w', String(OG_IMAGE_SIZE.width))
  url.searchParams.set('h', String(OG_IMAGE_SIZE.height))
  url.searchParams.set('fit', 'crop')
  url.searchParams.set('auto', 'format')
  if (image.focalPoint) {
    url.searchParams.set('crop', 'focalpoint')
    url.searchParams.set('fp-x', String(image.focalPoint.x / 100))
    url.searchParams.set('fp-y', String(image.focalPoint.y / 100))
  }
  return url.toString()
}
