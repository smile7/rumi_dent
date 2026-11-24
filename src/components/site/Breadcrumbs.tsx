import { ChevronRightIcon } from 'lucide-react'

import { Link } from '@/i18n/navigation'
import type { Href } from '@/lib/i18n/translations'

export type BreadcrumbItem = { label: string; href?: Href }

export type BreadcrumbsProps = {
  label: string
  /** The last item is the current page (no link). */
  items: BreadcrumbItem[]
}

export function Breadcrumbs({ label, items }: BreadcrumbsProps) {
  return (
    <nav aria-label={label} className="mb-6">
      <ol className="flex flex-wrap items-center gap-x-1 gap-y-1 text-step--1 text-fg-muted">
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <li key={item.label} className="inline-flex items-center gap-1">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-6 items-center underline underline-offset-4 hover:text-fg"
                >
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className="text-fg">
                  {item.label}
                </span>
              )}
              {isLast ? null : <ChevronRightIcon aria-hidden="true" className="size-4" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
