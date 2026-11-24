import type { ReactNode } from 'react'

type VisuallyHiddenProps = {
  as?: 'span' | 'div' | 'h2' | 'h3'
  children: ReactNode
}

/** Content for screen readers only (still in the accessibility tree). */
export function VisuallyHidden({ as: Tag = 'span', children }: VisuallyHiddenProps) {
  return <Tag className="sr-only">{children}</Tag>
}
