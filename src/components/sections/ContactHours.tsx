import { MapPinIcon, PhoneIcon } from 'lucide-react'

import { submitContact } from '@/actions/contact'
import { LazyContactForm } from '@/components/forms/LazyContactForm'
import { DirectionsLink } from '@/components/map/DirectionsLink'
import { MapEmbed } from '@/components/map/MapEmbed'
import { ContentImage } from '@/components/primitives/ContentImage'
import { emphasize } from '@/components/primitives/Emphasis'
import { Heading } from '@/components/primitives/Heading'
import { readPublicEnv, TURNSTILE_TEST_SITE_KEY } from '@/env'
import { directionsUrl, primaryPhone } from '@/lib/site/actions'
import { Text } from '@/components/primitives/Text'
import type { ContactHoursSection as ContactHoursModel } from '@/lib/content'
import { addressLines, hoursRows } from '@/lib/site/footer'
import { formatDate, formatPhone, formatTimeRange } from '@/lib/i18n/format'
import { getTranslations } from 'next-intl/server'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

/** A build without the key still renders; submits are then refused with the phone as fallback. */
function turnstileSiteKey(): string | undefined {
  try {
    const env = readPublicEnv('NEXT_PUBLIC_TURNSTILE_SITE_KEY', 'NEXT_PUBLIC_ENV')
    if (
      env.NEXT_PUBLIC_ENV === 'production' &&
      env.NEXT_PUBLIC_TURNSTILE_SITE_KEY === TURNSTILE_TEST_SITE_KEY
    ) {
      return undefined
    }
    return env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
  } catch {
    return undefined
  }
}

export async function ContactHoursSection({
  section: raw,
  index,
  sections,
  locale,
  site,
}: SectionComponentProps) {
  const section = raw as ContactHoursModel
  const t = await getTranslations('Sections')
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const rows = hoursRows(locale, site.openingHours)
  const phone = site.phones[0]
  const directions = directionsUrl(site)

  const specialHours =
    site.specialHours.length > 0 ? (
      <div>
        <Heading as="h3" size="step-1">
          {t('hoursSpecial')}
        </Heading>
        <ul className="mt-3 space-y-2">
          {site.specialHours.map((entry) => {
            const labelSuffix = entry.label ? `${' — '}${entry.label}` : ''
            const timeSuffix = entry.closed
              ? `${' · '}${t('hoursClosed')}`
              : entry.opens && entry.closes
                ? `${' · '}${formatTimeRange(entry.opens, entry.closes)}`
                : ''
            return (
              <li key={`${entry.date}-${entry.label ?? ''}`} className="text-fg-muted">
                <time dateTime={entry.date}>{formatDate(locale, entry.date, site.timeZone)}</time>
                {labelSuffix ? <span>{labelSuffix}</span> : null}
                {timeSuffix ? <span className="tabular-nums">{timeSuffix}</span> : null}
              </li>
            )
          })}
        </ul>
      </div>
    ) : null

  const map =
    section.showMap && site.mapEmbedUrl ? (
      <div className="overflow-hidden rounded-xl">
        <MapEmbed
          embedUrl={site.mapEmbedUrl}
          title={t('mapTitle', { name: site.brandName })}
          loadLabel={t('mapLoad')}
          notice={t('mapNotice')}
          alwaysAllowLabel={t('mapAlwaysAllow')}
        >
          {site.mapPlaceholder ? (
            <ContentImage
              image={site.mapPlaceholder}
              sizes="(min-width: 1280px) 1200px, 100vw"
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center pt-6 text-center sm:pt-10">
              <MapPinIcon aria-hidden="true" className="size-10 text-primary" />
              <Text className="mt-2 font-semibold">{site.brandName}</Text>
              <Text tone="muted">{addressLines(site.address)[0]}</Text>
            </div>
          )}
        </MapEmbed>
      </div>
    ) : null

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      <div className="grid gap-x-16 gap-y-14 lg:grid-cols-12">
        <div className="flex flex-col gap-10 lg:col-span-5">
          {section.heading ? (
            <Heading as={level} size="step-4" id={titleId} className="text-balance">
              {emphasize(section.heading)}
            </Heading>
          ) : null}
          <address className="flex flex-col gap-6 not-italic">
            {phone ? (
              <a
                href={formatPhone(phone.e164).href}
                className="group/call inline-flex items-center gap-4 self-start font-display text-step-3 font-light tabular-nums transition-colors hover:text-primary"
              >
                <span className="grid size-14 place-items-center rounded-pill bg-accent text-accent-fg transition-transform duration-(--duration-base) group-hover/call:rotate-12">
                  <PhoneIcon aria-hidden="true" className="size-6" />
                </span>
                {phone.display || formatPhone(phone.e164).display}
              </a>
            ) : null}
            <div>
              <p className="eyebrow">{t('addressLabel')}</p>
              <p className="mt-2 font-display text-step-1">
                {addressLines(site.address).map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
              {section.showMap && directions ? (
                <DirectionsLink
                  href={directions}
                  label={t('mapDirections')}
                  opensInNewTab={t('opensInNewTab')}
                  className="mt-4"
                />
              ) : null}
            </div>
            {site.email ? (
              <a
                href={`mailto:${site.email}`}
                className="self-start text-link underline underline-offset-4"
              >
                {site.email}
              </a>
            ) : null}
          </address>
          <div>
            <p className="eyebrow">{t('hoursLabel')}</p>
            <table className="mt-3 w-full border-collapse text-left text-step-0">
              <caption className="sr-only">{t('hoursLabel')}</caption>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.days} className="border-b border-border">
                    <th scope="row" className="py-3 pe-4 font-semibold">
                      {row.days}
                    </th>
                    <td className="py-3 text-end text-fg-muted tabular-nums">
                      {row.time ?? t('hoursClosed')}
                      {row.note ? <span className="block text-step--1">{row.note}</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {specialHours}
          {section.note ? (
            <p className="max-w-[30rem] rounded-lg bg-tone-soft-bg p-5 text-step--1 leading-relaxed">
              {section.note}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-10 lg:col-span-7">
          {section.showForm ? (
            <div className="rounded-xl border border-border bg-surface p-6 shadow-sm md:p-10">
              <LazyContactForm
                action={submitContact.bind(null, locale)}
                phone={primaryPhone(site)}
                privacyHref={site.privacyHref}
                successMessage={site.contactForm.successMessage}
                turnstileSiteKey={turnstileSiteKey()}
              />
            </div>
          ) : null}
          {map}
        </div>
      </div>
    </SectionShell>
  )
}
