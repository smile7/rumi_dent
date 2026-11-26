import type { ReactNode } from 'react'

import { emphasize } from '@/components/primitives/Emphasis'
import { Heading, type HeadingLevel, type HeadingSize } from '@/components/primitives/Heading'
import { cn } from '@/lib/utils'

type SectionHeadingProps = {
  id: string
  level: HeadingLevel
  heading?: string
  intro?: string
  /** `split`: heading left, intro (and `aside`) right from `md`. */
  layout?: 'stack' | 'split' | 'center'
  size?: HeadingSize
  /** Extra content next to the intro, e.g. a "see all" link. */
  aside?: ReactNode
  className?: string
}

/** The shared editorial heading block of a section: display serif with `*accent*` words. */
export function SectionHeading({
  id,
  level,
  heading,
  intro,
  layout = 'split',
  size = 'step-4',
  aside,
  className,
}: SectionHeadingProps) {
  if (!heading && !intro && !aside) return null
  return (
    <div
      className={cn(
        'grid gap-x-12 gap-y-5',
        layout === 'split' && 'md:grid-cols-12 md:items-end',
        layout === 'center' && 'mx-auto max-w-3xl justify-items-center text-center',
        className,
      )}
    >
      {heading ? (
        <Heading
          as={level}
          size={size}
          id={id}
          className={cn('text-balance', layout === 'split' && 'md:col-span-7')}
        >
          {emphasize(heading)}
        </Heading>
      ) : null}
      {intro || aside ? (
        <div
          className={cn(
            'flex flex-col gap-5',
            layout === 'split' && 'md:col-span-5 md:pb-2',
            layout === 'center' && 'items-center',
          )}
        >
          {intro ? (
            <p className="max-w-[34rem] text-step-1 leading-relaxed text-pretty text-fg-muted">
              {intro}
            </p>
          ) : null}
          {aside}
        </div>
      ) : null}
    </div>
  )
}
