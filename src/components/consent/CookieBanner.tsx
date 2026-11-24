'use client'

import NextLink from 'next/link'
import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import { choosableCategories } from '@/config/cookies'
import type { GrantedCategory } from '@/lib/consent/consent'

export type CookieBannerProps = {
  cookiePolicyHref?: string | undefined
  onSave: (categories: GrantedCategory[]) => void
  onSettings: () => void
}

const TITLE_ID = 'cookie-banner-title'

/**
 * First consent layer (LEGAL-GDPR §4): non-modal region at the bottom, three buttons with equal
 * weight, nothing pre-selected. Sits above the mobile action bar so Call stays reachable.
 */
export function CookieBanner({ cookiePolicyHref, onSave, onSettings }: CookieBannerProps) {
  const t = useTranslations('Consent')

  return (
    <section
      aria-labelledby={TITLE_ID}
      data-consent-banner=""
      className="fixed inset-x-0 bottom-[calc(var(--action-bar-h)+env(safe-area-inset-bottom))] z-40 max-h-[40dvh] overflow-y-auto border-t bg-surface p-4 shadow-lg md:bottom-0 md:p-6 print:hidden [[data-menu-open]_&]:hidden"
    >
      <div className="mx-auto flex max-w-(--container-content) flex-col gap-3 md:flex-row md:items-end md:gap-6">
        <div className="flex-1">
          <h2 id={TITLE_ID} className="font-display text-step-1 font-bold">
            {t('banner.title')}
          </h2>
          <p className="mt-1 text-step--1 text-fg-muted">
            {t('banner.text')}{' '}
            {cookiePolicyHref ? (
              <NextLink href={cookiePolicyHref} className="text-link underline underline-offset-4">
                {t('policy')}
              </NextLink>
            ) : null}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 md:shrink-0">
          <Button variant="outline" onClick={() => onSave(choosableCategories())}>
            {t('acceptAll')}
          </Button>
          <Button variant="outline" onClick={() => onSave([])}>
            {t('rejectAll')}
          </Button>
          <Button variant="outline" onClick={onSettings}>
            {t('banner.settings')}
          </Button>
        </div>
      </div>
    </section>
  )
}
