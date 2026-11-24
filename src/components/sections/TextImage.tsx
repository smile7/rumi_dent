import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading } from '@/components/primitives/Heading'
import { RichText, type TextImageSection } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function TextImageSection({
  section: raw,
  index,
  sections,
  site,
  imagePriority,
}: SectionComponentProps) {
  const section = raw as TextImageSection
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)
  const imageFirst = section.imagePosition === 'left'

  const text = (
    <div className="flex flex-col justify-center">
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      <div className="prose-theme mt-6 max-w-(--container-prose)">
        <RichText value={section.body} />
      </div>
      {section.cta ? (
        await SectionCtas({ ctas: [section.cta], site, className: 'mt-8' })
      ) : null}
    </div>
  )

  const media = section.image ? (
    <figure className={cn(imageFirst ? 'lg:order-first' : '')}>
      <ContentImage
        image={section.image}
        sizes="(min-width: 1024px) 45vw, 100vw"
        preload={imagePriority}
        className="h-auto w-full rounded-media"
      />
    </figure>
  ) : null

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      <div className={cn('grid items-center gap-10', section.image && 'lg:grid-cols-2 lg:gap-12')}>
        {text}
        {media}
      </div>
    </SectionShell>
  )
}