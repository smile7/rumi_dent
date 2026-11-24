'use client'

import NextLink from 'next/link'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import type { MouseEventHandler } from 'react'

import type { LinkTarget } from '@/lib/content'

export type NavLinkProps = {
  link: LinkTarget
  className?: string
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

/**
 * CMS hrefs are already localized (`/bg/uslugi`), so internal links go through `next/link`
 * (next-intl's `Link` only takes internal pathnames). Marks the current page with `aria-current`.
 */
export function NavLink({ link, className, onClick }: NavLinkProps) {
  const t = useTranslations('Header')
  const pathname = usePathname()
  const newTab = link.newTab
    ? { target: '_blank', rel: link.external ? 'noopener noreferrer' : undefined }
    : {}
  const label = (
    <>
      {link.label}
      {link.newTab ? <span className="sr-only">{t('opensInNewTab')}</span> : null}
    </>
  )

  if (link.external) {
    return (
      <a href={link.href} className={className} onClick={onClick} {...newTab}>
        {label}
      </a>
    )
  }

  return (
    <NextLink
      href={link.href}
      aria-current={pathname === link.href ? 'page' : undefined}
      className={className}
      onClick={onClick}
      {...newTab}
    >
      {label}
    </NextLink>
  )
}
