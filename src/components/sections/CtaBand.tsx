import { getTranslations } from 'next-intl/server'

import { Mascot } from '@/components/brand/Mascot'
import { emphasize } from '@/components/primitives/Emphasis'
import { Heading } from '@/components/primitives/Heading'
import type { CtaBandSection as CtaBandModel } from '@/lib/content'
import { addressLines, hoursRows } from '@/lib/site/footer'
import { cn } from '@/lib/utils'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

/** The closing invitation: a big serif line, the one action, and where and when to find us. */
export async function CtaBandSection({
  section: raw,
  index,
  sections,
  site,
  locale,
}: SectionComponentProps) {
  const section = raw as CtaBandModel
  const t = await getTranslations('Sections')
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const dark = section.tone === 'brand' || section.tone === 'inverse'
  const address = addressLines(site.address)
  const hours = hoursRows(locale, site.openingHours).filter((row) => row.time)

  return (
    <SectionShell section={section} labelledBy={titleId} className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className={cn(
            'shape-arch absolute -bottom-24 left-[55%] h-[34rem] w-[28rem] border',
            dark ? 'border-neutral-0/10' : 'border-primary/10',
          )}
        />
        <div
          className={cn(
            'shape-arch absolute -bottom-24 left-[calc(55%+3rem)] h-[30rem] w-[22rem]',
            dark ? 'bg-neutral-0/5' : 'bg-brand-100/60',
          )}
        />
        <div className="absolute top-[12%] right-[8%] hidden size-24 rounded-pill bg-accent-300/90 lg:block" />
      </div>
      <div className="relative grid items-end gap-x-16 gap-y-12 lg:grid-cols-12">
        <div className="flex flex-col gap-7 lg:col-span-7">
          <Heading as={level} size="step-5" id={titleId} className="max-w-[14ch] text-balance">
            {emphasize(section.heading)}
          </Heading>
          {section.text ? (
            <p className="max-w-[34rem] text-step-1 leading-relaxed text-pretty opacity-90">
              {section.text}
            </p>
          ) : null}
          <SectionCtas ctas={section.ctas} site={site} onDark={dark} className="mt-2" />
        </div>
        <div className="relative lg:col-span-5">
          <Mascot
            name="celebrate"
            sizes="10rem"
            className="animate-float absolute -top-36 right-4 hidden w-36 -rotate-6 drop-shadow-xl lg:block"
          />
          <dl
            className={cn(
              'grid gap-6 rounded-xl p-7 backdrop-blur-sm md:p-9',
              dark ? 'bg-neutral-0/8 ring-1 ring-neutral-0/15' : 'bg-surface ring-1 ring-border',
            )}
          >
            {address.length > 0 ? (
              <div>
                <dt className="eyebrow">{t('addressLabel')}</dt>
                <dd className="mt-2 font-display text-step-1">
                  {address.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
            {hours.length > 0 ? (
              <div>
                <dt className="eyebrow">{t('hoursLabel')}</dt>
                <dd className="mt-2 grid gap-1">
                  {hours.map((row) => (
                    <span key={row.days} className="flex flex-wrap justify-between gap-x-4">
                      <span className="font-semibold">{row.days}</span>
                      <span className="tabular-nums opacity-90">{row.time}</span>
                    </span>
                  ))}
                </dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
    </SectionShell>
  )
}
