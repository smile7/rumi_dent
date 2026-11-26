import { cn } from '@/lib/utils'

type WordmarkProps = {
  /** The brand name (from site settings / `src/config/site.ts`), never hard-coded here. */
  name: string
  /** `full` at the top of the page, `compact` in the shrunk header. */
  variant?: 'full' | 'compact'
  className?: string
}

const sizeByVariant = {
  full: 'text-step-2',
  compact: 'text-step-1',
} as const

/** Text logo set in the display serif. Used only when the client has not uploaded a logo. */
export function Wordmark({ name, variant = 'full', className }: WordmarkProps) {
  return (
    <span
      data-slot="wordmark"
      className={cn(
        'inline-flex items-baseline font-display leading-none font-normal tracking-[-0.01em] text-ink-700',
        sizeByVariant[variant],
        className,
      )}
    >
      {name}
    </span>
  )
}
