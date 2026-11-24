import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type SectionTone = 'base' | 'soft' | 'brand' | 'accent' | 'inverse'
export type SectionSpacing = 'default' | 'compact' | 'none'

type SectionProps = {
  tone?: SectionTone
  spacing?: SectionSpacing
  /** Rendered as `id` so the section can be deep-linked (`scroll-padding` keeps it clear of the header). */
  anchorId?: string
  /** Id of the section's heading; makes the section a labelled region landmark. */
  labelledBy?: string
  as?: 'section' | 'div' | 'aside'
  className?: string
  children: ReactNode
}

// Dark tones swap the focus ring and link color so both stay visible (contrast pairs in tokens.css).
const toneClass: Record<SectionTone, string> = {
  base: 'bg-tone-base-bg text-tone-base-fg',
  soft: 'bg-tone-soft-bg text-tone-soft-fg',
  brand:
    'bg-tone-brand-bg text-tone-brand-fg [--color-focus:var(--color-focus-on-dark)] [--color-link:currentColor] [--color-fg-muted:currentColor]',
  accent: 'bg-tone-accent-bg text-tone-accent-fg',
  inverse:
    'bg-tone-inverse-bg text-tone-inverse-fg [--color-focus:var(--color-focus-on-dark)] [--color-link:currentColor] [--color-fg-muted:currentColor]',
}

const spacingClass: Record<SectionSpacing, string> = {
  default: 'py-(--space-section)',
  compact: 'py-(--space-section-compact)',
  none: '',
}

/** Page band with vertical rhythm and a background tone. Put a `Container` inside. */
export function Section({
  tone = 'base',
  spacing = 'default',
  anchorId,
  labelledBy,
  as: Tag = 'section',
  className,
  children,
}: SectionProps) {
  return (
    <Tag
      id={anchorId}
      aria-labelledby={labelledBy}
      data-tone={tone}
      className={cn(toneClass[tone], spacingClass[spacing], className)}
    >
      {children}
    </Tag>
  )
}
