'use client'

import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

type MotionProviderProps = {
  children: ReactNode
}

/** `domAnimation` (~23 kB gz) is fetched after hydration so it stays out of the first load. */
const loadFeatures = () => import('./features').then((mod) => mod.default)

/** `strict` makes any `motion.*` usage throw: use `m.*` from `motion/react-m` so features stay lazy. */
export function MotionProvider({ children }: MotionProviderProps) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
