'use client'

import type { ReactNode } from 'react'

import { track } from '@/lib/analytics/track'
import type { BookingMode } from '@/lib/site/actions'

type BookingCTAProps = {
  href: string
  external: boolean
  /** Unset when an editor pointed the booking button at something else (a page, a call). */
  mode?: BookingMode
  opensInNewTab: string
  className?: string
  children: ReactNode
}

/** The booking button wherever it appears; reports `booking_click` with the booking mode. */
export function BookingCTA({
  href,
  external,
  mode,
  opensInNewTab,
  className,
  children,
}: BookingCTAProps) {
  return (
    <a
      href={href}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      onClick={() => track('booking_click', mode ? { mode } : undefined)}
      className={className}
    >
      {children}
      {external ? <span className="sr-only"> {opensInNewTab}</span> : null}
    </a>
  )
}
