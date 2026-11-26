import Image from 'next/image'

import celebrate from '@/assets/brand/tooth-celebrate.webp'
import shield from '@/assets/brand/tooth-shield.webp'
import thumbs from '@/assets/brand/tooth-thumbs.webp'
import wave from '@/assets/brand/tooth-wave.webp'
import { cn } from '@/lib/utils'

const mascots = { wave, shield, celebrate, thumbs } as const
/** Intrinsic sizes, explicit so the component doesn't depend on the bundler's image metadata. */
const dimensions: Record<keyof typeof mascots, { width: number; height: number }> = {
  wave: { width: 480, height: 479 },
  shield: { width: 480, height: 503 },
  celebrate: { width: 480, height: 494 },
  thumbs: { width: 480, height: 450 },
}

export type MascotName = keyof typeof mascots

type MascotProps = {
  name: MascotName
  className?: string
  /** Rendered width, for the browser's image choice. */
  sizes?: string
}

/**
 * The tooth mascot (Pixabay Content License): decoration only, never a logo or trade mark.
 * The files are pre-sized WebP, so they skip the image optimizer.
 */
export function Mascot({ name, className, sizes = '12rem' }: MascotProps) {
  return (
    <Image
      src={mascots[name]}
      {...dimensions[name]}
      alt=""
      aria-hidden="true"
      unoptimized
      draggable={false}
      sizes={sizes}
      className={cn('pointer-events-none h-auto select-none', className)}
    />
  )
}
