import { PhoneIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Container } from '@/components/primitives/Container'
import { Link } from '@/i18n/navigation'
import type { ImageAsset, NavItem } from '@/lib/content'
import type { PhoneLink } from '@/lib/site/actions'

import { HeaderScrollState } from './HeaderScrollState'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NavLink } from './NavLink'
import { SiteLogo } from './SiteLogo'

const HEADER_ID = 'site-header'

export type SiteHeaderProps = {
  brandName: string
  /** Uploaded logos from site settings; the text wordmark is the fallback. */
  logo?: ImageAsset
  logoCompact?: ImageAsset
  nav: NavItem[]
  phone: PhoneLink | null
  /** Mobile menu trigger, shown below `xl`. */
  menu?: ReactNode
}

/**
 * Sticky header (DESIGN-SYSTEM §8). From `md` it is `--header-h-expanded` tall and sticks at
 * `-(--header-shrink)`, so only the compact height stays visible; `data-compact` then moves the
 * bar into that visible part and scales the wordmark. Nothing re-lays out, so there's no CLS.
 */
export async function SiteHeader({
  brandName,
  logo,
  logoCompact,
  nav,
  phone,
  menu,
}: SiteHeaderProps) {
  const t = await getTranslations('Header')

  return (
    <>
      <HeaderScrollState targetId={HEADER_ID} />
      <header
        id={HEADER_ID}
        className="group/header sticky top-0 z-40 h-(--header-h-mobile) border-b border-transparent bg-bg transition-[background-color,box-shadow,border-color] duration-(--duration-base) ease-standard data-compact:border-border data-compact:bg-bg/85 data-compact:shadow-[0_10px_30px_-24px_oklch(0.26_0.045_222/0.35)] data-compact:backdrop-blur-xl md:-top-(--header-shrink) md:flex md:h-(--header-h-expanded) md:items-end print:hidden"
      >
        <Container
          width="wide"
          className="flex h-full items-center gap-3 transition-transform duration-(--duration-base) ease-standard md:h-(--header-h-compact) md:-translate-y-[calc(var(--header-shrink)/2)] md:group-data-compact/header:translate-y-0 xl:gap-6"
        >
          <Link
            href="/"
            className="me-auto inline-flex min-h-11 origin-left items-center rounded-sm transition-transform duration-(--duration-base) ease-standard md:scale-125 md:group-data-compact/header:scale-100"
          >
            <SiteLogo
              name={brandName}
              logo={logo}
              logoCompact={logoCompact}
              variant="compact"
              className="h-7 md:h-8"
            />
          </Link>

          {nav.length > 0 ? (
            <nav aria-label={t('nav')} className="hidden xl:block">
              <ul className="flex items-center gap-0.5 rounded-pill border border-border bg-surface/60 p-1 backdrop-blur-sm">
                {nav.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      link={item}
                      className="relative inline-flex min-h-10 items-center rounded-pill px-4 text-step--1 font-semibold text-fg transition-colors duration-(--duration-fast) hover:bg-brand-50 hover:text-primary aria-[current=page]:bg-ink-900 aria-[current=page]:text-neutral-0"
                    />
                  </li>
                ))}
              </ul>
            </nav>
          ) : null}

          <LanguageSwitcher className="hidden xl:block" />

          {phone ? (
            <a
              href={phone.href}
              className="group/call hidden min-h-11 items-center gap-2.5 rounded-pill bg-ink-900 py-1.5 ps-1.5 pe-5 text-step--1 font-semibold text-neutral-0 tabular-nums shadow-md transition-colors duration-(--duration-fast) hover:bg-primary md:inline-flex"
            >
              <span className="grid size-8 place-items-center rounded-pill bg-accent text-accent-fg transition-transform duration-(--duration-base) ease-emphasized group-hover/call:rotate-12">
                <PhoneIcon aria-hidden="true" strokeWidth={2} className="size-4" />
              </span>
              <span className="sr-only">{t('call')}</span>
              {phone.display}
            </a>
          ) : null}

          {menu ? <div className="xl:hidden">{menu}</div> : null}
        </Container>
      </header>
    </>
  )
}
