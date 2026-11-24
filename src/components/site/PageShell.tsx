import type { ReactNode } from 'react'

import { SkipLink } from '@/components/primitives/SkipLink'

export const MAIN_ID = 'main'

export type PageShellProps = {
  skipLabel: string
  /** Banner + header. */
  header?: ReactNode
  /** Footer + mobile action bar. */
  footer?: ReactNode
  children: ReactNode
}

/**
 * Landmark order for every page: skip link → banner/header → the one `<main>` → footer.
 * Pages, `not-found` and `error` render inside `<main>`, so they never add their own.
 */
export function PageShell({ skipLabel, header, footer, children }: PageShellProps) {
  return (
    <>
      <SkipLink targetId={MAIN_ID} label={skipLabel} />
      {header}
      <main id={MAIN_ID} tabIndex={-1} className="focus:outline-none">
        {children}
      </main>
      {footer}
    </>
  )
}
