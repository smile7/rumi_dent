import { getTranslations } from 'next-intl/server'

import type { Announcement } from '@/lib/content'
import { resolveCta, type ActionSettings } from '@/lib/site/actions'
import { bannerScript, dismissKey, type BannerState } from '@/lib/site/announcement'
import { cn } from '@/lib/utils'

import { AnnouncementDismiss } from './AnnouncementDismiss'
import { NavLink } from './NavLink'

const BANNER_ID = 'announcement'

const toneClass: Record<Announcement['tone'], string> = {
  info: 'bg-tone-soft-bg text-tone-soft-fg',
  promo: 'bg-tone-accent-bg text-tone-accent-fg',
  warning: 'bg-warning text-warning-fg',
}

export type AnnouncementBannerProps = {
  announcement: Announcement
  settings: ActionSettings
  /** Localized home path, for `pages: 'home'`. */
  homePath: string
}

/** Site-wide notice above the header (holiday hours, closures). Dates are checked client-side (static pages). */
export async function AnnouncementBanner({
  announcement,
  settings,
  homePath,
}: AnnouncementBannerProps) {
  const t = await getTranslations('Announcement')
  const state: BannerState = {
    startsAt: announcement.startsAt,
    endsAt: announcement.endsAt,
    pages: announcement.pages,
    storageKey: dismissKey(announcement),
    homePath,
  }
  const target = announcement.link ? resolveCta(announcement.link, settings) : null

  return (
    <AnnouncementDismiss
      id={BANNER_ID}
      state={state}
      label={t('label')}
      dismissible={announcement.dismissible}
      script={bannerScript(BANNER_ID, state)}
      className={cn(toneClass[announcement.tone], 'print:hidden')}
    >
      <p>
        {announcement.message}
        {announcement.link && target ? (
          <>
            {' '}
            <NavLink
              link={{ ...target, label: announcement.link.label }}
              className="font-semibold whitespace-nowrap underline underline-offset-2"
            />
          </>
        ) : null}
      </p>
    </AnnouncementDismiss>
  )
}
