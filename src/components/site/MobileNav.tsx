'use client'

import { MenuIcon, PhoneIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'

import { buttonVariants, Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import type { NavItem } from '@/lib/content'
import type { LabelledAction, PhoneLink } from '@/lib/site/actions'
import { cn } from '@/lib/utils'

import { BookingCTA } from './BookingCTA'
import { LanguageSwitcher } from './LanguageSwitcher'
import { NavLink } from './NavLink'

export type MobileNavProps = {
  nav: NavItem[]
  phone: PhoneLink | null
  booking: LabelledAction | null
}

/** Set on `<html>` while the menu is open, so the mobile action bar can hide (T05.3). */
export const MENU_OPEN_ATTR = 'data-menu-open'

const rowClass =
  'flex min-h-12 items-center rounded-card px-3 font-semibold text-fg hover:bg-muted aria-[current=page]:bg-tone-soft-bg aria-[current=page]:text-primary'

/** Menu sheet below `xl`. Base UI's dialog traps focus, locks scroll, closes on Escape and returns focus. */
export function MobileNav({ nav, phone, booking }: MobileNavProps) {
  const t = useTranslations('MobileNav')
  const tBar = useTranslations('ActionBar')
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const onOpenChange = (next: boolean) => {
    setOpen(next)
    document.documentElement.toggleAttribute(MENU_OPEN_ATTR, next)
  }
  // Links close the menu themselves: the layout (and this state) persists across navigations.
  const close = () => onOpenChange(false)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger aria-controls={panelId} render={<Button variant="ghost" size="sm" />}>
        <MenuIcon aria-hidden="true" />
        {t('open')}
      </SheetTrigger>
      <SheetContent id={panelId} side="right" closeLabel={t('close')}>
        <SheetHeader>
          <SheetTitle>{t('title')}</SheetTitle>
        </SheetHeader>
        {nav.length > 0 ? (
          <nav aria-label={t('nav')} className="px-3">
            <ul className="flex flex-col gap-1 text-step-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <NavLink link={item} className={rowClass} onClick={close} />
                  {item.children.length > 0 ? (
                    <ul className="flex flex-col gap-1 ps-4 text-step-0">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <NavLink link={child} className={rowClass} onClick={close} />
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </nav>
        ) : null}
        <SheetFooter>
          {booking ? (
            <BookingCTA
              href={booking.href}
              external={booking.external}
              mode={booking.bookingMode}
              opensInNewTab={tBar('opensInNewTab')}
              className={cn(buttonVariants({ size: 'lg' }))}
            >
              {booking.label}
            </BookingCTA>
          ) : null}
          {phone ? (
            <a
              href={phone.href}
              className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'tabular-nums')}
            >
              <PhoneIcon aria-hidden="true" strokeWidth={2} />
              <span className="sr-only">{t('call')}</span>
              {phone.display}
            </a>
          ) : null}
          <LanguageSwitcher className="self-center" />
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
