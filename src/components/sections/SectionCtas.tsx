import { ArrowUpRightIcon, PhoneIcon } from 'lucide-react'
import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

import { BookingCTA } from '@/components/site/BookingCTA'
import type { Cta } from '@/lib/content'
import { primaryPhone, resolveCta } from '@/lib/site/actions'
import { cn } from '@/lib/utils'

import type { SectionSiteContext } from './types'

type SectionCtasProps = {
  ctas: Cta[]
  site: SectionSiteContext
  /** On the deep teal / ink bands the lead button turns apricot. */
  onDark?: boolean
  className?: string
}

/** The lead action is a large pill with an arrow disc; the others are quiet text links. */
const leadClass = (onDark: boolean) =>
  cn(
    'group/cta inline-flex min-h-14 items-center gap-4 rounded-pill py-2 ps-7 pe-2 text-step-0 font-bold shadow-md transition-[background-color,transform,box-shadow] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:shadow-lg',
    onDark
      ? 'bg-accent text-accent-fg hover:bg-accent-hover'
      : 'bg-primary text-primary-fg hover:bg-primary-hover',
  )

const discClass = (onDark: boolean) =>
  cn(
    'grid size-10 shrink-0 place-items-center rounded-pill transition-transform duration-(--duration-base) ease-emphasized group-hover/cta:rotate-45',
    onDark ? 'bg-ink-900 text-neutral-0' : 'bg-neutral-0 text-primary',
  )

const quietClass =
  'inline-flex min-h-11 items-center gap-2 font-semibold underline decoration-current/30 decoration-1 underline-offset-[6px] transition-[text-decoration-color] hover:decoration-current'

export async function SectionCtas({ ctas, site, onDark = false, className }: SectionCtasProps) {
  if (ctas.length === 0) return null
  const t = await getTranslations('Sections')
  const phone = primaryPhone(site)

  return (
    <div className={cn('flex flex-wrap items-center gap-x-7 gap-y-4', className)}>
      {ctas.map((cta, index) => {
        const target = resolveCta(cta, site)
        if (!target) return null

        const lead = index === 0 && cta.style !== 'ghost' && cta.style !== 'outline'
        const isCall = cta.action === 'call'
        const label = isCall && phone && !lead ? phone.display : cta.label
        const classes = lead ? leadClass(onDark) : quietClass
        const content: ReactNode = lead ? (
          <>
            {label}
            <span aria-hidden="true" className={discClass(onDark)}>
              {isCall || target.href.startsWith('tel:') ? (
                <PhoneIcon className="size-4" strokeWidth={2.25} />
              ) : (
                <ArrowUpRightIcon className="size-5" strokeWidth={2} />
              )}
            </span>
          </>
        ) : (
          <>
            {isCall ? <PhoneIcon aria-hidden="true" className="size-4" strokeWidth={2} /> : null}
            {label}
          </>
        )

        const newTab = target.external
          ? { target: '_blank' as const, rel: 'noopener noreferrer' as const }
          : {}

        const specialScheme =
          target.href.startsWith('tel:') ||
          target.href.startsWith('mailto:') ||
          target.href.startsWith('#')

        if (!target.external && !specialScheme) {
          return (
            <NextLink key={`${cta.label}-${index}`} href={target.href} className={classes}>
              {content}
            </NextLink>
          )
        }

        if (cta.action === 'booking') {
          return (
            <BookingCTA
              key={`${cta.label}-${index}`}
              href={target.href}
              external={target.external}
              mode={target.bookingMode}
              opensInNewTab={t('opensInNewTab')}
              className={cn(classes, isCall ? 'tabular-nums' : '')}
            >
              {content}
            </BookingCTA>
          )
        }

        return (
          <a key={`${cta.label}-${index}`} href={target.href} className={classes} {...newTab}>
            {content}
            {target.external ? <span className="sr-only">{t('opensInNewTab')}</span> : null}
          </a>
        )
      })}
    </div>
  )
}
