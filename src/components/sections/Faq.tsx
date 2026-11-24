import { SectionTitle } from '@/components/primitives/SectionTitle'
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
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined} width="content">
      {section.heading ? (
        <SectionTitle
          as={level}
          id={titleId}
          intro={
            section.intro ? (
              <Text tone="muted" className="max-w-(--container-prose)">
                {section.intro}
              </Text>
            ) : null
          }
        >
          {section.heading}
        </SectionTitle>
      ) : section.intro ? (
        <Text tone="muted" className="max-w-(--container-prose)">
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