import { MapPinIcon, PhoneIcon, ClockIcon } from 'lucide-react'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { CtaBandSection as CtaBandModel } from '@/lib/content'
import { formatPhone } from '@/lib/i18n/format'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function CtaBandSection({
  section: raw,
  index,
  sections,
  site,
}: SectionComponentProps) {
  const section = raw as CtaBandModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  const hasNapInfo =
    site &&
    (site.phones.length > 0 || site.address.street)

  return (
    <SectionShell section={section} labelledBy={titleId}>
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
        {/* Copy */}
        <div>
          <Heading as={level} size="step-3" id={titleId} className="text-balance">
            {section.heading}
          </Heading>
          {section.text ? (
            <Text size="lead" className="mt-4 text-pretty opacity-90">
              {section.text}
            </Text>
          ) : null}
          <div className="mt-8">
            {await SectionCtas({ ctas: section.ctas, site })}
          </div>
        </div>

        {/* Contact snapshot — only when site settings are available */}
        {hasNapInfo && site ? (
          <ul className="flex flex-col gap-5 rounded-card bg-white/10 p-6 ring-1 ring-white/20 backdrop-blur-sm lg:p-8">
            {site.address.street ? (
              <li className="flex items-start gap-4">
                <MapPinIcon
                  aria-hidden="true"
                  className="mt-0.5 size-5 shrink-0 opacity-80"
                />
                <address className="not-italic leading-snug">
                  {[site.address.street, site.address.city, site.address.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </address>
              </li>
            ) : null}

            {site.phones.length > 0 ? (
              <li className="flex items-center gap-4">
                <PhoneIcon aria-hidden="true" className="size-5 shrink-0 opacity-80" />
                <a
                  href={formatPhone(site.phones[0]!.e164).href}
                  className="font-semibold hover:underline underline-offset-4"
                >
                  {site.phones[0]!.display}
                </a>
              </li>
            ) : null}

            {site.openingHours.length > 0 ? (
              <li className="flex items-start gap-4">
                <ClockIcon aria-hidden="true" className="mt-0.5 size-5 shrink-0 opacity-80" />
                <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-step--1">
                  {site.openingHours.slice(0, 3).map((hours) => (
                    <div key={hours.days.join()} className="contents">
                      <dt className="opacity-75">{hours.days.join(', ')}</dt>
                      <dd>{hours.opens} – {hours.closes}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ) : null}
          </ul>
        ) : null}
      </div>
    </SectionShell>
  )
}
