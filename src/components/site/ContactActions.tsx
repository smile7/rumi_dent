import { getTranslations } from 'next-intl/server'

import { buttonVariants } from '@/components/ui/button'
import type { SiteSettings } from '@/lib/content'
import { messengerLinks, primaryPhone } from '@/lib/site/actions'
import { cn } from '@/lib/utils'

import { TrackedLink } from './TrackedLink'

type ContactActionsProps = {
  settings: Pick<SiteSettings, 'phones' | 'socials'>
}

/** The contact page's primary actions: a full-width call button, then Viber (mobile only) / WhatsApp. */
export async function ContactActions({ settings }: ContactActionsProps) {
  const t = await getTranslations('ActionBar')
  const phone = primaryPhone(settings)
  const chats = messengerLinks(settings)
  if (!phone && chats.length === 0) return null

  return (
    <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      {phone ? (
        <TrackedLink
          event="call_click"
          href={phone.href}
          className={cn(buttonVariants({ variant: 'call', size: 'lg' }))}
        >
          {t('call')}: {phone.display}
        </TrackedLink>
      ) : null}
      {chats.map((chat) => (
        <TrackedLink
          key={chat.platform}
          event={`${chat.platform}_click`}
          href={chat.href}
          {...(chat.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'lg' }),
            chat.mobileOnly && 'md:hidden',
          )}
        >
          {t(chat.platform)}
          {chat.external ? <span className="sr-only"> {t('opensInNewTab')}</span> : null}
        </TrackedLink>
      ))}
    </div>
  )
}
