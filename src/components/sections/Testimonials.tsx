import { SectionTitle } from '@/components/primitives/SectionTitle'
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
        <SectionTitle as={level} id={titleId}>
          {section.heading}
        </SectionTitle>
      ) : null}
      <TestimonialsRow items={section.items} showRating={section.showRating} />
    </SectionShell>
  )
}