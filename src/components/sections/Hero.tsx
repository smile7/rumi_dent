import { ContentIcon } from '@/components/primitives/ContentIcon'
import { Cluster } from '@/components/primitives/Stack'
import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { HeroSection as HeroModel } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

function HeroCutoutDecoration() {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 200 120"
        className="pointer-events-none absolute -start-6 top-4 h-28 w-44 text-primary opacity-40 motion-safe:animate-[hero-drift_12s_ease-in-out_infinite] md:-start-10 md:top-6 md:h-36 md:w-52"
      >
        <path
          d="M10 80 C50 20, 120 10, 190 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M20 95 C70 60, 130 55, 180 75"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
      </svg>
      <svg
        aria-hidden="true"
        viewBox="0 0 120 160"
        className="pointer-events-none absolute -end-4 bottom-2 h-36 w-28 text-accent opacity-45 motion-safe:animate-[hero-drift_14s_ease-in-out_infinite_reverse] md:-end-8 md:bottom-4"
      >
        <path
          d="M15 140 L15 30 C15 15, 35 5, 55 20 L95 60 C105 70, 105 90, 90 100 L50 130 C35 142, 15 155, 15 140 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinejoin="round"
        />
      </svg>
      <span
        aria-hidden="true"
        className="absolute inset-x-8 bottom-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent"
      />
    </>
  )
}

function HeroAmbientMesh() {
  return (
    <>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 end-0 size-80 rounded-full bg-primary/20 blur-3xl"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -start-20 size-64 rounded-full bg-accent/15 blur-3xl"
      />
    </>
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
  const isCutout = section.variant === 'cutout' && image

  const heading = (
    <Heading
      as={headingLevel}
      size={section.variant === 'fullBleed' ? 'step-5' : isCutout ? 'step-5' : 'step-4'}
      id={titleId}
      className={cn(isCutout && 'text-balance')}
    >
      {section.heading}
    </Heading>
  )

  const subheading = section.subheading ? (
    <Text
      size="lead"
      className={cn('mt-4 max-w-(--container-prose) text-pretty', isCutout && 'text-fg-muted')}
    >
      {section.subheading}
    </Text>
  ) : null

  const ctas = await SectionCtas({
    ctas: section.ctas,
    site,
    className: cn('mt-8', isCutout && 'mt-10'),
  })

  const trust =
    section.trustItems.length > 0 ? (
      <Cluster gap="md" className="mt-8">
        {section.trustItems.map((item) => (
          <span key={item.key} className="inline-flex max-w-full items-center gap-2 text-step--1 font-semibold">
            {item.icon ? <ContentIcon name={item.icon} className="text-primary" /> : null}
            <span>{item.text}</span>
          </span>
        ))}
      </Cluster>
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
        sizes="(min-width: 1024px) 45vw, 100vw"
        preload={imagePriority}
        className={cn(
          'h-auto w-full rounded-media shadow-lg',
          section.variant === 'cutout' && 'hero-cutout-mask',
        )}
      />
    ))

  if (section.variant === 'fullBleed' && image) {
    return (
      <SectionShell section={section} labelledBy={titleId} className="relative overflow-hidden">
        <div className="relative min-h-[28rem] lg:min-h-[32rem]">
          <div className="absolute inset-0">
            <div className="relative h-full w-full">{imageNode}</div>
            <div className="absolute inset-0 bg-tone-inverse-bg/65" aria-hidden="true" />
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
      className={cn(isCutout && 'relative overflow-hidden')}
    >
      {isCutout ? <HeroAmbientMesh /> : null}
      <div
        className={cn(
          'relative z-10 grid items-center gap-10',
          image && !isCutout && 'lg:grid-cols-2 lg:gap-12',
          image && isCutout && 'lg:grid-cols-[1.05fr_1fr] lg:gap-16',
          !image && 'max-w-(--container-prose)',
        )}
      >
        <div className={cn(isCutout && 'lg:pe-6')}>
          {heading}
          {subheading}
          {ctas}
          {trust}
        </div>
        {image ? (
          <figure className={cn('relative', isCutout && 'isolate mx-auto max-w-md lg:max-w-none')}>
            {isCutout ? <HeroCutoutDecoration /> : null}
            <div className="relative z-10">{imageNode}</div>
          </figure>
        ) : null}
      </div>
    </SectionShell>
  )
}