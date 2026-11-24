'use client'

import * as m from 'motion/react-m'
import type { ReactNode } from 'react'

import { duration, ease, revealOffset } from './tokens'
import { usePrefersReducedMotion } from './usePrefersReducedMotion'

type RevealProps = {
  children: ReactNode
  className?: string
  /** Seconds. Use small steps (e.g. 0.06 × index) for staggered lists. */
  delay?: number
}

/**
 * Fades and lifts content in once when it scrolls into view.
 * Never wrap the LCP element: it stays invisible until hydration and the lazy motion features load.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const reduceMotion = usePrefersReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <m.div
      data-reveal
      className={className}
      initial={{ opacity: 0, y: revealOffset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: duration.slow, ease: ease.standard, delay }}
    >
      {children}
    </m.div>
  )
}
