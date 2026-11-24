'use client'

import { useEffect, useRef } from 'react'

export type HeaderScrollStateProps = {
  /** `id` of the `<header>` that gets `data-compact`. */
  targetId: string
}

/**
 * A 1px sentinel `--header-shrink` below the header's start (after the announcement banner).
 * When it scrolls out of view the header gets `data-compact`. No scroll listeners: CSS does the rest.
 */
export function HeaderScrollState({ targetId }: HeaderScrollStateProps) {
  const sentinelRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const sentinel = sentinelRef.current
    const header = document.getElementById(targetId)
    if (!sentinel || !header) return

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry) return
      header.toggleAttribute(
        'data-compact',
        !entry.isIntersecting && entry.boundingClientRect.top < 0,
      )
    })
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [targetId])

  return (
    <div aria-hidden="true" className="relative h-0">
      <span ref={sentinelRef} className="absolute inset-x-0 top-(--header-shrink) h-px" />
    </div>
  )
}
