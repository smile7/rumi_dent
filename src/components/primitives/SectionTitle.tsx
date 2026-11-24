import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

import { Heading, type HeadingLevel, type HeadingSize } from './Heading'

type SectionTitleProps = {
  as: HeadingLevel
  size?: HeadingSize
  id?: string
  className?: string
  children: ReactNode
  intro?: ReactNode
}

/** Section heading with a left accent bar — keeps hierarchy without ALL-CAPS eyebrows. */
export function SectionTitle({ as, size = 'step-3', id, className, children, intro }: SectionTitleProps) {
  return (
    <header className={cn('max-w-(--container-prose)', className)}>
      <Heading
        as={as}
        size={size}
        id={id}
        className="relative ps-5 before:absolute before:inset-y-1 before:start-0 before:w-1.5 before:rounded-pill before:bg-accent before:content-['']"
      >
        {children}
      </Heading>
      {intro ? <div className="mt-4">{intro}</div> : null}
    </header>
  )
}