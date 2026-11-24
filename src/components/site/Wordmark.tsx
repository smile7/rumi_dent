import { cn } from '@/lib/utils'

type WordmarkProps = {
  /** The brand name (from site settings / `src/config/site.ts`), never hard-coded here. */
  name: string
  /** `full` at the top of the page, `compact` in the shrunk header. */
  variant?: 'full' | 'compact'
  /** Small accent-colored smile arc after the name. */
  accent?: boolean
  className?: string
}

const sizeByVariant = {
  full: 'text-step-2',
  compact: 'text-step-1',
} as const

/** Text logo set in the display font. Used when the client has no logo SVG. */
export function Wordmark({ name, variant = 'full', accent = true, className }: WordmarkProps) {
  return (
    <span
      data-slot="wordmark"
      className={cn(
        'inline-flex items-baseline gap-[0.12em] font-display leading-none font-extrabold tracking-[-0.015em] text-primary',
        sizeByVariant[variant],
        className,
      )}
    >
      <span>{name}</span>
      {accent ? (
        <svg
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 24 12"
          className="h-[0.42em] w-[0.84em] self-end text-accent-500"
        >
          <path
            d="M3 3c2.4 4.2 5.3 6.3 9 6.3S18.6 7.2 21 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
      ) : null}
    </span>
  )
}
