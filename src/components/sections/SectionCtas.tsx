import NextLink from 'next/link'
import { getTranslations } from 'next-intl/server'

import { BookingCTA } from '@/components/site/BookingCTA'
import { buttonVariants } from '@/components/ui/button'
import type { Cta } from '@/lib/content'
import { primaryPhone, resolveCta } from '@/lib/site/actions'
import { cn } from '@/lib/utils'

import type { SectionSiteContext } from './types'

type SectionCtasProps = {
  ctas: Cta[]
  site: SectionSiteContext
  className?: string
}

export async function SectionCtas({ ctas, site, className }: SectionCtasProps) {
  if (ctas.length === 0) return null
  const t = await getTranslations('Sections')

  return (
    <div className={cn('flex flex-wrap gap-3', className)}>
      {ctas.map((cta, index) => {
        const target = resolveCta(cta, site)
        if (!target) return null

        const variant =
          cta.style === 'secondary'
            ? 'secondary'
            : cta.style === 'outline'
              ? 'outline'
              : cta.style === 'ghost'
                ? 'ghost'
                : cta.action === 'call'
                  ? 'call'
                  : 'primary'

        const phone = primaryPhone(site)
        const label = cta.action === 'call' && phone ? phone.display : cta.label

        const newTab = target.external
          ? { target: '_blank' as const, rel: 'noopener noreferrer' as const }
          : {}

        const classes = cn(buttonVariants({ variant, size: 'md' }))

        const specialScheme =
          target.href.startsWith('tel:') ||
          target.href.startsWith('mailto:') ||
          target.href.startsWith('#')

        if (!target.external && !specialScheme) {
          return (
            <NextLink key={`${cta.label}-${index}`} href={target.href} className={classes}>
              {label}
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
              className={classes}
            >
              {label}
            </BookingCTA>
          )
        }

        return (
          <a key={`${cta.label}-${index}`} href={target.href} className={classes} {...newTab}>
            {label}
            {target.external ? <span className="sr-only">{t('opensInNewTab')}</span> : null}
          </a>
        )
      })}
    </div>
  )
}
