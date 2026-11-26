import { PhoneIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { Container } from '@/components/primitives/Container'
import { buttonVariants } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import type { ImageAsset, NavItem } from '@/lib/content'
import type { PhoneLink } from '@/lib/site/actions'
import { cn } from '@/lib/utils'

import { HeaderScrollState } from './HeaderScrollState'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NavLink } from './NavLink'
import { SiteLogo } from './SiteLogo'

const HEADER_ID = 'site-header'

export type SiteHeaderProps = {
  brandName: string
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
        className="group/header sticky top-0 z-40 h-(--header-h-mobile) bg-bg transition-[background-color,box-shadow] duration-(--duration-base) ease-standard data-compact:bg-bg/95 data-compact:shadow-sm data-compact:backdrop-blur-md md:-top-(--header-shrink) md:flex md:h-(--header-h-expanded) md:items-end print:hidden"
      >
        <Container
          width="wide"
          className="flex h-full items-center gap-4 transition-transform duration-(--duration-base) ease-standard md:h-(--header-h-compact) md:-translate-y-[calc(var(--header-shrink)/2)] md:group-data-compact/header:translate-y-0"
        >
          <Link
            href="/"
            className="me-auto inline-flex min-h-11 origin-left items-center rounded-sm transition-transform duration-(--duration-base) ease-standard group-data-compact/header:scale-90 md:scale-140 md:group-data-compact/header:scale-100"
          >
            <SiteLogo brandName={brandName} logo={logo} logoCompact={logoCompact} />
          </Link>

          {nav.length > 0 ? (
            <nav aria-label={t('nav')} className="hidden xl:block">
              <ul className="flex items-center gap-1">
                {nav.map((item) => (
                  <li key={item.href}>
                    <NavLink
                      link={item}
                      className="inline-flex min-h-11 items-center rounded-button px-3 font-semibold text-fg decoration-primary decoration-2 underline-offset-8 hover:bg-muted aria-[current=page]:text-primary aria-[current=page]:underline"
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
              className={cn(
                buttonVariants({ variant: 'call', size: 'sm' }),
                'hidden md:inline-flex',
              )}
            >
              <PhoneIcon aria-hidden="true" strokeWidth={2} />
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
