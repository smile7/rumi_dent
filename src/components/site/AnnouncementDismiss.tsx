'use client'

import { XIcon } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useEffect, useRef, type ReactNode } from 'react'

import { Container } from '@/components/primitives/Container'
import { isBannerHidden, type BannerState } from '@/lib/site/announcement'
import { cn } from '@/lib/utils'

function sessionStore(): Storage | null {
  try {
    return window.sessionStorage
  } catch {
    return null
  }
}

export type AnnouncementDismissProps = {
  id: string
  state: BannerState
  label: string
  dismissible: boolean
  /** Inline script that sets `hidden` before first paint (`bannerScript`). */
  script: string
  className?: string
  children: ReactNode
}

/**
 * Banner shell. `hidden` is owned by the DOM, not React: the inline script after the banner sets it
 * before first paint, and this re-checks it on client navigation (home-only) and on dismiss.
 */
export function AnnouncementDismiss({
  id,
  state,
  label,
  dismissible,
  script,
  className,
  children,
}: AnnouncementDismissProps) {
  const t = useTranslations('Announcement')
  const pathname = usePathname()
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    if (ref.current)
      ref.current.hidden = isBannerHidden(state, Date.now(), pathname, sessionStore())
  }, [state, pathname])

  function dismiss() {
    try {
      sessionStore()?.setItem(state.storageKey, '1')
    } catch {
      // Storage blocked: the banner shows again on the next page load.
    }
    if (ref.current) ref.current.hidden = true
  }

  return (
    <>
      <section
        ref={ref}
        id={id}
        aria-label={label}
        suppressHydrationWarning
        className={cn('print:hidden', className)}
      >
        <Container width="wide" className="flex items-center gap-2">
          <div className="min-w-0 flex-1 py-2 text-sm">{children}</div>
          {dismissible ? (
            <button
              type="button"
              onClick={dismiss}
              aria-label={t('dismiss')}
              className="-me-3 inline-flex size-11 shrink-0 items-center justify-center rounded-full hover:bg-fg/10"
            >
              <XIcon aria-hidden="true" className="size-5" />
            </button>
          ) : null}
        </Container>
      </section>
      {/* Runs only from the server HTML. Rendered on the client (e.g. after a client-side 404) it is an
        inert data block, so React doesn't warn; the effect above does the check there. */}
      <script
        type={typeof window === 'undefined' ? undefined : 'text/plain'}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: script }}
      />
    </>
  )
}
