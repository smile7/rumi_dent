import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type Gap = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

const gapClass: Record<Gap, string> = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-10',
}

type LayoutProps = {
  gap?: Gap
  as?: 'div' | 'ul' | 'ol' | 'nav'
  className?: string
  children: ReactNode
}

/** Vertical flow with consistent gaps. */
export function Stack({ gap = 'md', as: Tag = 'div', className, children }: LayoutProps) {
  return <Tag className={cn('flex flex-col', gapClass[gap], className)}>{children}</Tag>
}

type ClusterProps = LayoutProps & {
  align?: 'start' | 'center' | 'end' | 'baseline'
  justify?: 'start' | 'center' | 'end' | 'between'
}

const alignClass = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  baseline: 'items-baseline',
} as const

const justifyClass = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
} as const

/** Horizontal group that wraps (buttons, badges, meta). */
export function Cluster({
  gap = 'sm',
  align = 'center',
  justify = 'start',
  as: Tag = 'div',
  className,
  children,
}: ClusterProps) {
  return (
    <Tag
      className={cn(
        'flex flex-wrap',
        gapClass[gap],
        alignClass[align],
        justifyClass[justify],
        className,
      )}
    >
      {children}
    </Tag>
  )
}
