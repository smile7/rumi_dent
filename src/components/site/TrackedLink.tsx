'use client'

import type { ComponentProps } from 'react'

import { track, type AnalyticsEvent } from '@/lib/analytics/track'

export type TrackedLinkProps = Omit<ComponentProps<'a'>, 'href' | 'onClick'> & {
  href: string
  event: AnalyticsEvent
}

/** A plain anchor that reports a click (for links rendered by server components). */
export function TrackedLink({ href, event, children, ...props }: TrackedLinkProps) {
  return (
    <a href={href} onClick={() => track(event)} {...props}>
      {children}
    </a>
  )
}
