'use client'

import { usePathname } from 'next/navigation'
import { useIsPresentationTool } from 'next-sanity/hooks'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Leaves draft mode outside Presentation (inside it, the Studio controls preview). */
export function ExitPreview({ label }: { label: string }) {
  const pathname = usePathname()
  // `null` until the Presentation handshake settles: render nothing rather than flash the button.
  if (useIsPresentationTool() !== false) return null

  return (
    <a
      href={`/api/draft-mode/disable?redirect=${encodeURIComponent(pathname)}`}
      className={cn(
        buttonVariants({ variant: 'secondary', size: 'sm' }),
        'fixed start-4 bottom-4 z-50 shadow-md',
      )}
    >
      {label}
    </a>
  )
}
