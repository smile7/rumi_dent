import type { Metadata, Viewport } from 'next'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { hasLocale, NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'

import { ConsentProvider } from '@/components/consent/ConsentProvider'
import { MotionProvider } from '@/components/motion/MotionProvider'
import { AnnouncementBanner } from '@/components/site/AnnouncementBanner'
import { MobileActionBar } from '@/components/site/MobileActionBar'
import { MobileNav } from '@/components/site/MobileNav'
import { PageShell } from '@/components/site/PageShell'
import { PageTranslationsProvider } from '@/components/site/PageTranslations'
import { SiteFooter } from '@/components/site/SiteFooter'
import { SiteHeader } from '@/components/site/SiteHeader'
import { fontVariables } from '@/config/fonts'
import { getAnnouncement, getNavigation, getSiteSettings } from '@/lib/content'
import { PreviewTools } from '@/lib/content/preview'
import { Analytics } from '@/lib/analytics/Analytics'
import { bookingAction, mobileBarActions, primaryPhone } from '@/lib/site/actions'
import { cn } from '@/lib/utils'
import { readPublicEnv } from '@/env'
import { getPathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import '@/styles/globals.css'

// `dynamicParams` stays per route (T04.7): set here it would apply to every child segment.
// Unknown locales don't reach this segment, because the proxy prefixes them with the default locale.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export function generateMetadata(): Metadata {
  const { NEXT_PUBLIC_SITE_URL } = readPublicEnv('NEXT_PUBLIC_SITE_URL')
  return { metadataBase: new URL(NEXT_PUBLIC_SITE_URL) }
}

const HTML_JS_SCRIPT = 'document.documentElement.classList.add("js")'

// `cover` makes `env(safe-area-inset-*)` non-zero on notched phones (mobile action bar).
export const viewport: Viewport = { viewportFit: 'cover' }

export default async function LocaleLayout({ children, params }: LayoutProps<'/[locale]'>) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const [messages, draft, settings, navigation, announcement, t] = await Promise.all([
    getMessages(),
    draftMode(),
    getSiteSettings(locale),
    getNavigation(locale),
    getAnnouncement(locale),
    getTranslations(),
  ])
  const nav = navigation?.header ?? []
  const phone = settings ? primaryPhone(settings) : null
  const booking = settings
    ? bookingAction(settings, navigation?.headerCta, t('MobileNav.book'))
    : null
  const barActions =
    settings && navigation
      ? mobileBarActions(settings, navigation.mobileActionBar, booking, {
          call: t('ActionBar.call'),
          directions: t('ActionBar.directions'),
          book: t('ActionBar.book'),
          viber: t('ActionBar.viber'),
          whatsapp: t('ActionBar.whatsapp'),
          email: t('ActionBar.email'),
        })
      : []

  return (
    <html lang={locale} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* `html.js` gates progressive enhancement CSS before first paint. CSP hash in PROGRESS. */}
        <script dangerouslySetInnerHTML={{ __html: HTML_JS_SCRIPT }} />
      </head>
      <body
        className={cn(
          barActions.length > 0 &&
            'pb-[calc(var(--action-bar-h)+env(safe-area-inset-bottom))] md:pb-0',
        )}
      >
        {/* Client components get only the namespaces they use. */}
        <NextIntlClientProvider
          messages={{
            LanguageSwitcher: messages.LanguageSwitcher,
            Header: messages.Header,
            MobileNav: messages.MobileNav,
            ActionBar: messages.ActionBar,
            Announcement: messages.Announcement,
            Error: messages.Error,
            Sections: messages.Sections,
            ContactForm: messages.ContactForm,
            Consent: messages.Consent,
            Cookies: messages.Cookies,
            Processors: messages.Processors,
          }}
        >
          <ConsentProvider cookiePolicyHref={settings?.cookiePolicyHref}>
            <PageTranslationsProvider>
              <PageShell
                skipLabel={t('SkipLink.label')}
                header={
                  settings ? (
                    <>
                      {announcement ? (
                        <AnnouncementBanner
                          announcement={announcement}
                          settings={settings}
                          homePath={getPathname({ locale, href: '/' })}
                        />
                      ) : null}
                      <SiteHeader
                        brandName={settings.brandName}
                        logo={settings.logo}
                        logoCompact={settings.logoCompact}
                        nav={nav}
                        phone={phone}
                        menu={<MobileNav nav={nav} phone={phone} booking={booking} />}
                      />
                    </>
                  ) : null
                }
                footer={
                  <>
                    {settings ? (
                      <SiteFooter
                        locale={locale}
                        settings={settings}
                        columns={navigation?.footerColumns ?? []}
                      />
                    ) : null}
                    {barActions.length > 0 ? <MobileActionBar actions={barActions} /> : null}
                  </>
                }
              >
                <MotionProvider>{children}</MotionProvider>
              </PageShell>
            </PageTranslationsProvider>
            {draft.isEnabled ? null : <Analytics />}
          </ConsentProvider>
        </NextIntlClientProvider>
        {draft.isEnabled && <PreviewTools />}
      </body>
    </html>
  )
}
