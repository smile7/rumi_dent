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

  const heading = (
    <Heading as={headingLevel} size={section.variant === 'fullBleed' ? 'step-5' : 'step-4'} id={titleId}>
      {section.heading}
    </Heading>
  )

  const subheading = section.subheading ? (
    <Text size="lead" className="mt-4 max-w-(--container-prose) text-pretty">
      {section.subheading}
    </Text>
  ) : null

  const ctas = await SectionCtas({ ctas: section.ctas, site, className: 'mt-8' })

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
          'h-auto w-full rounded-media',
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
    <SectionShell section={section} labelledBy={section.subheading ? titleId : titleId}>
      <div
        className={cn(
          'grid items-center gap-10',
          image ? 'lg:grid-cols-2 lg:gap-12' : 'max-w-(--container-prose)',
        )}
      >
        <div>
          {heading}
          {subheading}
          {ctas}
          {trust}
        </div>
        {image ? <figure className="relative">{imageNode}</figure> : null}
      </div>
    </SectionShell>
  )
}