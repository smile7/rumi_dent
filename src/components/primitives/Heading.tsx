import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type HeadingLevel = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
export type HeadingSize = 'step-0' | 'step-1' | 'step-2' | 'step-3' | 'step-4' | 'step-5'

/** Visual size used when only the semantic level is given. */
export const defaultHeadingSize: Record<HeadingLevel, HeadingSize> = {
  h1: 'step-5',
  h2: 'step-4',
  h3: 'step-2',
  h4: 'step-1',
  h5: 'step-0',
  h6: 'step-0',
}

const sizeClass: Record<HeadingSize, string> = {
  'step-0': 'text-step-0 font-bold',
  'step-1': 'text-step-1 font-bold',
  'step-2': 'text-step-2 font-bold',
  'step-3': 'text-step-3 font-extrabold tracking-[-0.01em]',
  'step-4': 'text-step-4 font-extrabold tracking-[-0.015em]',
  'step-5': 'text-step-5 font-extrabold tracking-[-0.02em]',
}

type HeadingProps = {
  /** Semantic level (document outline). Exactly one `h1` per page. */
  as: HeadingLevel
  /** Visual size, decoupled from the level. */
  size?: HeadingSize
  id?: string
  className?: string
  children: ReactNode
}

export function Heading({ as: Tag, size, id, className, children }: HeadingProps) {
  const resolved = size ?? defaultHeadingSize[Tag]
  return (
    <Tag
      id={id}
      data-size={resolved}
      className={cn('font-display text-balance', sizeClass[resolved], className)}
    >
      {children}
    </Tag>
  )
}
