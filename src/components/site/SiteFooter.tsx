import { MailIcon, PhoneIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { CookieSettingsButton } from '@/components/consent/CookieSettingsButton'
import { Container } from '@/components/primitives/Container'
import type { Locale } from '@/config/i18n'
import { Link } from '@/i18n/navigation'
import type { Navigation, SiteSettings } from '@/lib/content'
import { formatPhone } from '@/lib/i18n/format'
import { addressLines, hoursRows } from '@/lib/site/footer'

import { NavLink } from './NavLink'
import { Wordmark } from './Wordmark'

const linkClass =
  'inline-block rounded-pill px-1 py-1 underline-offset-4 hover:bg-primary-fg/10 hover:underline'
const headingClass = 'mb-3 font-display text-step-0 font-bold'

export type SiteFooterProps = {
  locale: Locale
  settings: SiteSettings
  columns: Navigation['footerColumns']
}

/** NAP, hours, footer navigation, socials and the provider information (LEGAL-GDPR §8). */
export async function SiteFooter({ locale, settings, columns }: SiteFooterProps) {
  const t = await getTranslations('Footer')
  const { legal } = settings
  const privacyEmail = legal.privacyEmail ?? settings.email
  const hours = hoursRows(locale, settings.openingHours)
  const registeredAddress = legal.registeredAddress
    ? addressLines(legal.registeredAddress).join(', ')
    : ''
  const provider = [
    legal.legalName,
    legal.uic && t('uic', { uic: legal.uic }),
    legal.vatNumber && t('vat', { vat: legal.vatNumber }),
    registeredAddress && t('registeredAddress', { address: registeredAddress }),
    legal.professionalBody && t('professionalBody', { name: legal.professionalBody }),
    legal.registration,
    legal.supervisoryAuthority && t('supervisoryAuthority', { name: legal.supervisoryAuthority }),
  ].filter(Boolean)

  return (
    <footer className="mt-8 bg-tone-brand-bg text-tone-brand-fg">
      <svg
        className="footer-wave -mt-8 block h-12 w-full text-tone-brand-bg"
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0,24 C240,48 480,0 720,24 C960,48 1200,8 1440,28 L1440,48 L0,48 Z" />
      </svg>
      <Container
        width="wide"
        className="grid gap-10 py-12 sm:grid-cols-2 lg:auto-cols-fr lg:grid-flow-col lg:py-16"
      >
        <div>
          <Link href="/" className="inline-flex min-h-11 items-center rounded-sm">
            <Wordmark name={settings.brandName} variant="compact" onDark />
          </Link>
          {settings.tagline ? (
            <p className="mt-2 text-step--1 text-tone-brand-fg/90">{settings.tagline}</p>
          ) : null}
          <address className="mt-4 flex flex-col gap-1 not-italic">
            {addressLines(settings.address).map((line) => (
              <span key={line}>{line}</span>
            ))}
            {settings.phones.map((phone) => (
              <a
                key={phone.e164}
                href={formatPhone(phone.e164).href}
                className={`${linkClass} inline-flex items-center gap-2`}
              >
                <PhoneIcon aria-hidden="true" className="size-4 shrink-0" />
                <span className="whitespace-nowrap tabular-nums">{phone.display}</span>
                {phone.label ? <span className="text-tone-brand-fg/80">({phone.label})</span> : null}
              </a>
            ))}
            {settings.email ? (
              <a
                href={`mailto:${settings.email}`}
                className={`${linkClass} inline-flex items-center gap-2`}
              >
                <MailIcon aria-hidden="true" className="size-4 shrink-0" />
                {settings.email}
              </a>
            ) : null}
          </address>
        </div>

        {hours.length > 0 ? (
          <div>
            <h2 className={headingClass}>{t('hours')}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              {hours.map((row) => (
                <div key={row.days} className="contents">
                  <dt className="text-tone-brand-fg/80">{row.days}</dt>
                  <dd className="tabular-nums">
                    {row.time ?? t('closed')}
                    {row.note ? (
                      <span className="block text-tone-brand-fg/80">{row.note}</span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {columns.length > 0 ? (
          <nav aria-label={t('nav')} className="contents">
            {columns.map((column) => (
              <div key={column.title}>
                <h2 className={headingClass}>{column.title}</h2>
                <ul>
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <NavLink link={link} className={linkClass} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        ) : null}

        {settings.socials.length > 0 ? (
          <div>
            <h2 className={headingClass}>{t('social')}</h2>
            <ul>
              {settings.socials.map((social) => (
                <li key={social.url}>
                  <a href={social.url} rel="me noopener" className={linkClass}>
                    {social.label ?? t(`platforms.${social.platform}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>

      <div className="border-t border-primary-fg/15">
        <Container width="wide" className="flex flex-col gap-3 py-6 text-step--1 text-tone-brand-fg/85">
          <nav aria-label={t('legal')}>
            <ul className="flex flex-wrap gap-x-6">
              {settings.legalLinks.map((link) => (
                <li key={link.href}>
                  <NavLink link={link} className={linkClass} />
                </li>
              ))}
              {privacyEmail ? (
                <li>
                  <a href={`mailto:${privacyEmail}`} className={linkClass}>
                    {t('privacyContact', { email: privacyEmail })}
                  </a>
                </li>
              ) : null}
              <li>
                <CookieSettingsButton
                  label={t('cookieSettings')}
                  className={`${linkClass} cursor-pointer`}
                />
              </li>
            </ul>
          </nav>
          {provider.length > 0 ? <p>{provider.join(' · ')}</p> : null}
          {settings.footerNote ? <p>{settings.footerNote}</p> : null}
          <p>
            {t('copyright', {
              year: String(new Date().getFullYear()),
              name: legal.legalName ?? settings.brandName,
            })}
          </p>
        </Container>
      </div>
    </footer>
  )
}