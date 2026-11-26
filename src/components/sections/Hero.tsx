import Image from 'next/image'

import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { HeroSection as HeroModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function HeroSection({
  section: raw,
  index,
  sections,
  site,
  imagePriority,
}: SectionComponentProps) {
  const section = raw as HeroModel
  const headingLevel = sectionHeadingLevel(index, sections)
  const titleId = sectionTitleId(section.key)
  const image = section.image

  /* ── Full-bleed (image fills the band) ───────────────────────────────── */
  if (section.variant === 'fullBleed' && image) {
    const heading = (
      <Heading as={headingLevel} size="step-5" id={titleId} className="text-balance">
        {section.heading}
      </Heading>
    )
    return (
      <SectionShell section={section} labelledBy={titleId} className="relative overflow-hidden">
        <div className="relative min-h-[28rem] lg:min-h-[32rem]">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">
              <ContentImage image={image} sizes="100vw" fill preload={imagePriority} className="object-cover" />
            </div>
            <div className="absolute inset-0 bg-tone-inverse-bg/65" aria-hidden="true" />
          </div>
          <div className="relative z-10 flex min-h-[28rem] flex-col justify-end py-16 text-tone-inverse-fg lg:min-h-[32rem] lg:py-20">
            {heading}
            {section.subheading ? (
              <Text size="lead" className="mt-4 max-w-(--container-prose) text-pretty">
                {section.subheading}
              </Text>
            ) : null}
            {await SectionCtas({ ctas: section.ctas, site, className: 'mt-8' })}
          </div>
        </div>
      </SectionShell>
    )
  }

  /* ── Editorial split (the Rumi Dent default) ─────────────────────────── */
  /* On mobile: text stacks above the image; on lg+: image is large right column */
  const bookingCtas = section.ctas.filter((c) => c.action === 'booking')
  const displayCtas = bookingCtas.length > 0 ? bookingCtas : section.ctas.slice(0, 1)

  return (
    <SectionShell
      section={section}
      labelledBy={titleId}
      className="overflow-hidden"
      containerClassName="relative"
    >
      {/* Decorative tooth mascots — small floating illustrations */}
      <Image
        src="/brand/tooth-mascot.png"
        alt=""
        aria-hidden="true"
        width={80}
        height={120}
        className={cn(
          'pointer-events-none absolute -top-4 right-[42%] z-0 hidden rotate-[-14deg] opacity-15 lg:block',
          'transition-opacity duration-(--duration-slower)',
        )}
      />
      <Image
        src="/brand/tooth-mascot.png"
        alt=""
        aria-hidden="true"
        width={52}
        height={78}
        className={cn(
          'pointer-events-none absolute bottom-6 left-[8%] z-0 hidden rotate-[12deg] opacity-10 lg:block',
        )}
      />

      <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
        {/* ── Text column ───────────────────────────────────────────────── */}
        <div className="flex flex-col">
          <Heading
            as={headingLevel}
            size="step-4"
            id={titleId}
            className="text-balance leading-[1.08] tracking-[-0.02em]"
          >
            {section.heading}
          </Heading>

          {section.subheading ? (
            <Text
              size="lead"
              className="mt-5 max-w-[36ch] text-pretty leading-relaxed text-fg-muted"
            >
              {section.subheading}
            </Text>
          ) : null}

          <div className="mt-8">
            {await SectionCtas({ ctas: displayCtas, site })}
          </div>

          {/* Inline tooth mascot for mobile – appears below the CTA */}
          <div className="relative mt-10 flex items-end gap-3 lg:hidden">
            <Image
              src="/brand/tooth-mascot.png"
              alt=""
              aria-hidden="true"
              width={56}
              height={84}
              className="shrink-0 opacity-70"
            />
            <span className="text-step--1 text-fg-muted">
              {section.subheading ? '' : ''}
            </span>
          </div>
        </div>

        {/* ── Image column ──────────────────────────────────────────────── */}
        {image ? (
          <figure className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
            {/* Soft blob behind the image for depth */}
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 scale-95 rounded-[50%] bg-brand-100 blur-3xl"
            />
            <ContentImage
              image={image}
              sizes="(min-width: 1024px) 48vw, 92vw"
              preload={imagePriority}
              className={cn(
                'relative z-10 h-auto w-full drop-shadow-xl',
                section.variant === 'cutout'
                  ? 'hero-cutout-mask'
                  : 'rounded-(--radius-hero-image)',
              )}
            />
          </figure>
        ) : (
          /* Fallback: static hero-kid image when no Sanity image has been configured yet */
          <figure className="relative mx-auto w-full max-w-[520px] lg:mx-0 lg:max-w-none">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 scale-95 rounded-[50%] bg-brand-100 blur-3xl"
            />
            <Image
              src="/brand/hero-kid.png"
              alt="Дете с четка за зъби"
              width={736}
              height={712}
              priority={imagePriority}
              sizes="(min-width: 1024px) 48vw, 92vw"
              className="relative z-10 h-auto w-full drop-shadow-xl rounded-(--radius-hero-image)"
            />
          </figure>
        )}
      </div>
    </SectionShell>
  )
}
