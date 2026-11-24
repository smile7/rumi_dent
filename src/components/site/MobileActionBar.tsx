'use client'

import { CalendarCheckIcon, MailIcon, MapPinIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { track, type AnalyticsEvent } from '@/lib/analytics/track'
import type { BarAction } from '@/lib/site/actions'
import { cn } from '@/lib/utils'

export type MobileActionBarProps = { actions: BarAction[] }

const icons = {
  call: PhoneIcon,
  directions: MapPinIcon,
  booking: CalendarCheckIcon,
  message: MessageCircleIcon,
  email: MailIcon,
} as const

const events: Partial<Record<BarAction['kind'], AnalyticsEvent>> = {
  call: 'call_click',
  directions: 'directions_click',
  booking: 'booking_click',
}

/**
 * Fixed bottom bar below `md` (DESIGN-SYSTEM §10). The layout pads `<body>` by its height and
 * `scroll-padding-bottom` keeps focused elements above it (WCAG 2.4.11). Hidden while the menu is open.
 */
export function MobileActionBar({ actions }: MobileActionBarProps) {
  const t = useTranslations('ActionBar')

  return (
    <nav
      aria-label={t('label')}
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-bg/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden print:hidden [[data-menu-open]_&]:hidden"
    >
      <ul className="grid h-(--action-bar-h) auto-cols-fr grid-flow-col gap-2 p-2">
        {actions.map((action) => {
          const Icon = icons[action.kind]
          const event = action.platform
            ? (`${action.platform}_click` as const)
            : events[action.kind]
          return (
            <li key={action.kind}>
              <a
                href={action.href}
                {...(action.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                onClick={
                  event
                    ? () =>
                        track(event, action.bookingMode ? { mode: action.bookingMode } : undefined)
                    : undefined
                }
                className={cn(
                  'flex h-full flex-col items-center justify-center gap-0.5 rounded-card px-1 text-center text-step--1 leading-tight font-semibold',
                  action.kind === 'call'
                    ? 'bg-primary text-primary-fg hover:bg-primary-hover'
                    : 'bg-tone-soft-bg text-fg hover:bg-muted',
                )}
              >
                <Icon aria-hidden="true" className="size-5" strokeWidth={2} />
                {action.label}
                {action.external ? <span className="sr-only">{t('opensInNewTab')}</span> : null}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
