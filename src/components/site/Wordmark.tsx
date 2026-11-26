import Image from 'next/image'

import type { ImageAsset } from '@/lib/content/types'
import { cn } from '@/lib/utils'

type WordmarkProps = {
  /** The brand name (from site settings / `src/config/site.ts`), never hard-coded here. */
  name: string
  /** Logo image from Sanity settings; shown instead of text when present. */
  logo?: ImageAsset
  /** `full` at the top of the page, `compact` in the shrunk header. */
  variant?: 'full' | 'compact'
  className?: string
}

const sizeByVariant = {
  full: 'text-step-2',
  compact: 'text-step-1',
} as const

/** Brand mark — image logo when available, text wordmark otherwise. */
export function Wordmark({ name, logo, variant = 'full', className }: WordmarkProps) {
  if (logo) {
    const height = variant === 'compact' ? 36 : 48
    const width = Math.round((logo.width / logo.height) * height)
    return (
      <Image
        src={logo.src}
        alt={name}
        width={width}
        height={height}
        className={cn('h-auto', className)}
        style={{ maxHeight: `${height}px`, width: 'auto' }}
      />
    )
  }

  return (
    <span
      data-slot="wordmark"
      className={cn(
        'inline-flex items-baseline font-display leading-none font-extrabold tracking-[-0.015em] text-primary',
        sizeByVariant[variant],
        className,
      )}
    >
      {name}
    </span>
  )
}
