import { Heading } from '@/components/primitives/Heading'
import type { TestimonialsSection as TestimonialsModel } from '@/lib/content'

import { SectionShell, sectionTitleId } from './SectionShell'
import { TestimonialsRow } from './TestimonialsRow'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export function TestimonialsSection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as TestimonialsModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      <TestimonialsRow items={section.items} showRating={section.showRating} />
    </SectionShell>
  )
}