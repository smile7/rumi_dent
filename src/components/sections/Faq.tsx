import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { RichText } from '@/lib/content'
import type { FaqSection as FaqModel } from '@/lib/content'

import { FaqAccordion } from './FaqAccordion'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export function FaqSection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as FaqModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined} width="prose">
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      {section.intro ? (
        <Text tone="muted" className="mt-4">
          {section.intro}
        </Text>
      ) : null}
      <FaqAccordion
        idPrefix={section.key}
        items={section.items.map((item) => ({
          id: item.id,
          question: item.question,
          answer: (
            <div className="prose-theme">
              <RichText value={item.answer} />
            </div>
          ),
        }))}
      />
    </SectionShell>
  )
}