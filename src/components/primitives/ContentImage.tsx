'use client'

import Image from 'next/image'

import { sanityImageLoader } from '@/lib/content/image-loader'
import type { ImageAsset } from '@/lib/content/types'

type ContentImageProps = {
  image: ImageAsset
  /** Required: the rendered width per breakpoint, e.g. `(min-width: 768px) 50vw, 100vw`. */
  sizes: string
  /** Only for the LCP image (first hero). */
  preload?: boolean
  fetchPriority?: 'high' | 'low' | 'auto'
  /** Fill the positioned parent instead of using the intrinsic size. */
  fill?: boolean
  quality?: number
  className?: string
}

/**
 * CMS image through the Sanity CDN loader. A client component only because `next/image` needs
 * the loader function, which can't be passed from a server component.
 */
export function ContentImage({
  image,
  sizes,
  preload,
  fetchPriority,
  fill,
  quality,
  className,
}: ContentImageProps) {
  const { focalPoint } = image
  return (
    <Image
      loader={sanityImageLoader}
      src={image.src}
      alt={image.alt}
      sizes={sizes}
      {...(fill ? { fill: true } : { width: image.width, height: image.height })}
      preload={preload}
      fetchPriority={preload ? 'high' : fetchPriority}
      quality={quality}
      placeholder={image.lqip ? 'blur' : 'empty'}
      blurDataURL={image.lqip}
      style={focalPoint ? { objectPosition: `${focalPoint.x}% ${focalPoint.y}%` } : undefined}
      className={className}
    />
  )
}
