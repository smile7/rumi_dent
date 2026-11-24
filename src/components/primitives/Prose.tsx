import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type ProseProps = {
  className?: string
  children: ReactNode
}

/** Long-form typography for rich text (Portable Text output, legal pages, articles). */
export function Prose({ className, children }: ProseProps) {
  return (
    <div className={cn('prose max-w-(--container-prose) prose-theme', className)}>{children}</div>
  )
}
