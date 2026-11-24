import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type ContainerWidth = 'prose' | 'content' | 'wide'

type ContainerProps = {
  width?: ContainerWidth
  as?: 'div' | 'header' | 'footer' | 'nav' | 'article'
  className?: string
  children: ReactNode
}

// `max-w-prose` is a built-in 65ch utility, so the prose width reads the token explicitly.
const widthClass: Record<ContainerWidth, string> = {
  prose: 'max-w-(--container-prose)',
  content: 'max-w-content',
  wide: 'max-w-wide',
}

/** Centered, padded content column. */
export function Container({
  width = 'content',
  as: Tag = 'div',
  className,
  children,
}: ContainerProps) {
  return (
    <Tag className={cn('mx-auto w-full px-5 md:px-8', widthClass[width], className)}>
      {children}
    </Tag>
  )
}
