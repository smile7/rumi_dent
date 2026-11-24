import { NavigationIcon } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

type DirectionsLinkProps = {
  href: string
  label: string
  opensInNewTab: string
  className?: string
}

/** Google Maps directions in a new tab (PRD F-10 AC3). */
export function DirectionsLink({ href, label, opensInNewTab, className }: DirectionsLinkProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: 'outline' }), className)}
    >
      <NavigationIcon aria-hidden="true" />
      {label}
      <span className="sr-only"> {opensInNewTab}</span>
    </a>
  )
}
