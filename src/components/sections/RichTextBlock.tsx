import { Heading } from '@/components/primitives/Heading'
import { Prose } from '@/components/primitives/Prose'
import { RichText } from '@/lib/content'
import type { RichTextSection } from '@/lib/content'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export function RichTextBlockSection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as RichTextSection
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  return (
    <SectionShell
      section={section}
      labelledBy={section.heading ? titleId : undefined}
      width={section.width === 'wide' ? 'wide' : 'prose'}
    >
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      <Prose className="prose-theme mt-6">
        <RichText value={section.body} />
      </Prose>
    </SectionShell>
  )
}