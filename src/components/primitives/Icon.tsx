import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type IconSize = 'sm' | 'md' | 'lg'

type IconProps = {
  icon: LucideIcon
  size?: IconSize
  /** Accessible name. Only for standalone icons; icons next to visible text stay decorative. */
  label?: string
  className?: string
}

const sizeClass: Record<IconSize, string> = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

export function Icon({ icon: LucideComponent, size = 'md', label, className }: IconProps) {
  const a11y = label
    ? ({ role: 'img', 'aria-label': label } as const)
    : ({ 'aria-hidden': true, focusable: false } as const)
  return (
    <LucideComponent
      strokeWidth={1.5}
      className={cn('shrink-0', sizeClass[size], className)}
      {...a11y}
    />
  )
}
