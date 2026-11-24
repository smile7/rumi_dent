import Image from 'next/image'

import { ContentIcon } from '@/components/primitives/ContentIcon'
import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { HeroSection as HeroModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { HeroDecor } from './HeroDecor'
import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

/** Shared blob clip path for cutout hero portraits (DESIGN-SYSTEM §6). */
function HeroBlobDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true" focusable="false">
      <defs>
        <clipPath id="hero-blob-clip" clipPathUnits="objectBoundingBox">
          <path d="M0.55 0.02c0.22 0 0.38 0.12 0.42 0.32 0.05 0.24-0.06 0.52-0.28 0.62-0.18 0.09-0.4 0.08-0.56-0.06-0.16-0.14-0.22-0.38-0.14-0.58 0.08-0.22 0.3-0.3 0.56-0.3z" />
        </clipPath>
      </defs>
    </svg>
  )
}

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
  const isCutout = section.variant === 'cutout'

  const heading = (
    <Heading
      as={headingLevel}
      size={section.variant === 'fullBleed' ? 'step-5' : 'step-5'}
      id={titleId}
      className="text-balance text-primary"
    >
      {section.heading}
    </Heading>
  )

  const subheading = section.subheading ? (
    <Text size="lead" className="mt-6 max-w-(--container-prose) text-pretty text-fg-muted">
      {section.subheading}
    </Text>
  ) : null

  const ctas = await SectionCtas({ ctas: section.ctas, site, className: 'mt-10' })

  const trust =
    section.trustItems.length > 0 ? (
      <ul className="mt-10 flex flex-wrap gap-3">
        {section.trustItems.map((item) => (
          <li key={item.key}>
            <span className="hero-trust-pill">
              {item.icon ? <ContentIcon name={item.icon} className="text-primary" /> : null}
              <span>{item.text}</span>
            </span>
          </li>
        ))}
      </ul>
    ) : null

  const imageNode =
    image &&
    (section.variant === 'fullBleed' ? (
      <ContentImage
        image={image}
        sizes="100vw"
        fill
        preload={imagePriority}
        className="object-cover"
      />
    ) : (
      <ContentImage
        image={image}
        sizes="(min-width: 1024px) 48vw, 100vw"
        preload={imagePriority}
        className={cn(
          'h-auto w-full hero-media-frame',
          isCutout ? 'hero-cutout-mask' : 'rounded-media',
        )}
      />
    ))

  if (section.variant === 'fullBleed' && image) {
    return (
      <SectionShell section={section} labelledBy={titleId} className="relative overflow-hidden">
        <div className="relative min-h-[28rem] lg:min-h-[32rem]">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">{imageNode}</div>
            <div
              className="absolute inset-0 bg-tone-inverse-bg/65"
              aria-hidden="true"
            />
          </div>
          <div className="relative z-10 flex min-h-[28rem] flex-col justify-end py-16 text-tone-inverse-fg lg:min-h-[32rem] lg:py-20">
            {heading}
            {subheading}
            {ctas}
            {trust}
          </div>
        </div>
      </SectionShell>
    )
  }

  return (
    <SectionShell
      section={section}
      labelledBy={titleId}
      spacing="compact"
      className="hero-band relative overflow-hidden lg:min-h-[88svh]"
      containerClassName="relative z-10 flex min-h-[inherit] flex-col justify-center py-4 lg:py-12"
    >
      <HeroBlobDefs />
      <HeroDecor />
      <div
        className={cn(
          'grid items-center gap-12',
          image ? 'lg:grid-cols-12 lg:gap-10' : 'max-w-(--container-prose)',
        )}
      >
        <div className={image ? 'lg:col-span-5 xl:col-span-5' : undefined}>
          {heading}
          {subheading}
          {ctas}
          {trust}
        </div>
        {image ? (
          <figure className="relative mx-auto w-full max-w-md lg:col-span-7 lg:col-start-6 lg:max-w-none">
            <div
              className="absolute -inset-4 -rotate-3 rounded-media bg-accent-300/50"
              aria-hidden="true"
            />
            <div
              className="absolute -inset-2 rotate-2 rounded-media bg-primary/15"
              aria-hidden="true"
            />
            <div className="relative z-10">{imageNode}</div>
            <Image
              src="/brand/mascot-tooth.png"
              alt=""
              width={160}
              height={160}
              className="pointer-events-none absolute -bottom-6 -start-4 z-20 w-28 drop-shadow-lg sm:w-32 lg:-start-8 lg:w-36"
              aria-hidden
            />
          </figure>
        ) : null}
      </div>
    </SectionShell>
  )
}