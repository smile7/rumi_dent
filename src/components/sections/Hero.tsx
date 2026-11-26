import { getTranslations } from 'next-intl/server'

import { Mascot } from '@/components/brand/Mascot'
import { ContentIcon } from '@/components/primitives/ContentIcon'
import { ContentImage } from '@/components/primitives/ContentImage'
import { emphasize } from '@/components/primitives/Emphasis'
import { Heading } from '@/components/primitives/Heading'
import type { Locale } from '@/config/i18n'
import type { HeroSection as HeroModel } from '@/lib/content'
import { hoursRows } from '@/lib/site/footer'
import { cn } from '@/lib/utils'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps, SectionSiteContext } from './types'

/** Circular, slowly turning seal: brand · city · tagline, repeated around a circle. */
function RotatingSeal({ text, className }: { text: string; className?: string }) {
  return (
    <div aria-hidden="true" className={cn('grid place-items-center', className)}>
      <svg viewBox="0 0 200 200" className="animate-spin-slow col-start-1 row-start-1 size-full">
        <defs>
          <path id="hero-seal-path" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
        </defs>
        <circle cx="100" cy="100" r="99" className="fill-neutral-0" />
        <text className="fill-ink-900 font-body text-[15px] font-bold tracking-[0.32em] uppercase">
          <textPath href="#hero-seal-path" textLength="485">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="col-start-1 row-start-1 grid size-[38%] place-items-center rounded-pill bg-accent">
        <svg viewBox="0 0 24 24" className="size-1/2 fill-none stroke-accent-fg" strokeWidth={1.6}>
          <path d="M7 3.5c-2.2 0-3.5 1.9-3.5 4.4 0 2.8 1.1 4.6 1.7 7.4.5 2.4.9 5.2 2.4 5.2 1.6 0 1.6-3.4 2.4-5.2.4-.9 1.1-.9 1.5 0 .8 1.8.8 5.2 2.4 5.2 1.5 0 1.9-2.8 2.4-5.2.6-2.8 1.7-4.6 1.7-7.4 0-2.5-1.3-4.4-3.5-4.4-1.9 0-2.8 1-5 1s-3.1-1-5-1Z" />
        </svg>
      </span>
    </div>
  )
}

/** Opening hours, compact: one line per group of days. */
async function HoursNote({ site, locale }: { site: SectionSiteContext; locale: Locale }) {
  const t = await getTranslations('Sections')
  const rows = hoursRows(locale, site.openingHours).filter((row) => row.time)
  if (rows.length === 0) return null
  return (
    <div className="hidden items-start gap-4 border-t border-border pt-6 text-step--1 sm:flex">
      <span className="eyebrow mt-0.5 shrink-0">{t('hoursLabel')}</span>
      <dl className="grid gap-1">
        {rows.map((row) => (
          <div key={row.days} className="flex flex-wrap gap-x-3">
            <dt className="font-semibold">{row.days}</dt>
            <dd className="text-fg-muted tabular-nums">{row.time}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export async function HeroSection({
  section: raw,
  index,
  sections,
  site,
  locale,
  imagePriority,
}: SectionComponentProps) {
  const section = raw as HeroModel
  const headingLevel = sectionHeadingLevel(index, sections)
  const titleId = sectionTitleId(section.key)
  const image = section.image
  const sealText = [site.brandName, site.address.city, site.tagline]
    .filter(Boolean)
    .join(' · ')
    .concat(' · ')

  // Awaited here (not `<Async />` in JSX) so the hero also renders in plain React tests.
  const ctas = await SectionCtas({ ctas: section.ctas, site })
  const hours = await HoursNote({ site, locale })

  const copy = (
    <div className="relative z-10 flex flex-col gap-6 sm:gap-8">
      {site.tagline ? <p className="eyebrow">{site.tagline}</p> : null}
      <Heading
        as={headingLevel}
        size="step-5"
        id={titleId}
        className="max-w-[12ch] text-balance [&_em]:pe-1"
      >
        {emphasize(section.heading)}
      </Heading>
      {section.subheading ? (
        <p className="max-w-[36rem] text-step-1 leading-relaxed text-pretty text-fg-muted">
          {section.subheading}
        </p>
      ) : null}
      {ctas}
      {section.trustItems.length > 0 ? (
        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-step--1 font-semibold">
          {section.trustItems.map((item) => (
            <li key={item.key} className="inline-flex items-center gap-2">
              {item.icon ? <ContentIcon name={item.icon} className="text-primary" /> : null}
              {item.text}
            </li>
          ))}
        </ul>
      ) : null}
      {hours}
    </div>
  )

  // Full-bleed photo: the copy sits on an ink scrim.
  if (section.variant === 'fullBleed' && image) {
    return (
      <SectionShell section={section} labelledBy={titleId} className="relative overflow-hidden">
        <div className="absolute inset-0">
          <ContentImage
            image={image}
            sizes="100vw"
            fill
            preload={imagePriority}
            className="object-cover"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-ink-950/70" />
        </div>
        <div className="relative min-h-[32rem] content-end py-10 text-neutral-0 [&_.text-fg-muted]:text-neutral-0/85">
          {copy}
        </div>
      </SectionShell>
    )
  }

  const cutout = section.variant === 'cutout'

  return (
    <SectionShell
      section={section}
      labelledBy={titleId}
      width="wide"
      className="relative overflow-hidden pt-[clamp(2rem,1rem+3vw,4rem)]! pb-[clamp(3.5rem,2rem+5vw,7rem)]!"
    >
      {/* Soft wash and a large hairline ring borrowed from the logo's round forms. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-1/4 right-[-20%] size-[70rem] rounded-pill bg-[radial-gradient(closest-side,var(--color-brand-100),transparent)] opacity-70" />
        <div className="absolute top-[8%] left-[-18rem] size-[36rem] rounded-pill border border-primary/10" />
      </div>

      <div className="relative grid items-center gap-x-10 gap-y-14 lg:grid-cols-12">
        <div className="lg:col-span-6 xl:col-span-6">{copy}</div>

        {image ? (
          <div className="relative lg:col-span-6">
            {cutout ? (
              <div className="relative mx-auto aspect-[20/21] w-full max-w-[40rem]">
                {/* sun */}
                <div className="animate-float-slow absolute top-[3%] right-[4%] size-[24%] rounded-pill bg-accent-300" />
                {/* the arch stage */}
                <div className="shape-arch absolute inset-x-[4%] top-[17%] bottom-0 overflow-hidden bg-brand-200">
                  <div className="shape-arch absolute inset-x-[7%] top-[6%] bottom-[-10%] border border-neutral-0/60" />
                  <div className="shape-arch absolute inset-x-[16%] top-[15%] bottom-[-10%] bg-brand-100/70" />
                  <div className="paper-grain absolute inset-0 opacity-40 mix-blend-multiply" />
                </div>
                {/* dashed orbit */}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 100 100"
                  className="animate-spin-slow absolute inset-[-2%] size-[104%] fill-none stroke-primary/35 [animation-duration:90s]"
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="48"
                    strokeDasharray="0.6 2.4"
                    strokeLinecap="round"
                    strokeWidth="0.5"
                  />
                </svg>
                <ContentImage
                  image={image}
                  sizes="(min-width: 1024px) 40rem, 92vw"
                  preload={imagePriority}
                  className="absolute bottom-0 left-[1%] h-auto w-[98%] drop-shadow-[0_30px_40px_oklch(0.26_0.045_222/0.18)]"
                />
                <Mascot
                  name="wave"
                  sizes="(min-width: 1024px) 9rem, 26vw"
                  className="animate-float absolute bottom-[4%] left-[-3%] w-[24%] -rotate-6 drop-shadow-xl"
                />
                <RotatingSeal
                  text={sealText}
                  className="absolute top-[13%] left-[-1%] size-[24%] rounded-pill shadow-xl"
                />
              </div>
            ) : (
              <div className="relative mx-auto max-w-[36rem]">
                <div
                  className="absolute -top-6 -right-6 size-28 rounded-pill bg-accent-300"
                  aria-hidden="true"
                />
                <div className="shape-arch relative aspect-[4/5] overflow-hidden bg-brand-100 shadow-xl">
                  <ContentImage
                    image={image}
                    sizes="(min-width: 1024px) 36rem, 92vw"
                    fill
                    preload={imagePriority}
                    className="object-cover"
                  />
                </div>
                <Mascot
                  name="wave"
                  sizes="8rem"
                  className="animate-float absolute -bottom-6 -left-6 w-28 drop-shadow-xl"
                />
              </div>
            )}
          </div>
        ) : null}
      </div>
    </SectionShell>
  )
}
