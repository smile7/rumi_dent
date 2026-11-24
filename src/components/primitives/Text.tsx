import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type TextSize = 'small' | 'body' | 'lead'
export type TextTone = 'default' | 'muted'

type TextProps = {
  size?: TextSize
  tone?: TextTone
  as?: 'p' | 'span' | 'div' | 'small'
  className?: string
  children: ReactNode
}

const sizeClass: Record<TextSize, string> = {
  small: 'text-step--1',
  body: 'text-step-0',
  lead: 'text-step-1 leading-snug',
}

const toneClass: Record<TextTone, string> = {
  default: 'text-current',
  muted: 'text-fg-muted',
}

export function Text({
  size = 'body',
  tone = 'default',
  as: Tag = 'p',
  className,
  children,
}: TextProps) {
  return <Tag className={cn(sizeClass[size], toneClass[tone], className)}>{children}</Tag>
}
