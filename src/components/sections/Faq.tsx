import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { RichText } from '@/lib/content'
import type { FaqSection as FaqModel } from '@/lib/content'
import { cn } from '@/lib/utils'

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
  const split = section.layout === 'split'

  const accordion = (
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
  )

  return (
    <SectionShell
      section={section}
      labelledBy={section.heading ? titleId : undefined}
      width={split ? 'wide' : 'prose'}
    >
      {split ? (
        <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14">
          <div className="max-w-(--container-prose)">
            {section.heading ? (
              <Heading as={level} size="step-3" id={titleId}>
                {section.heading}
              </Heading>
            ) : null}
            {section.intro ? (
              <Text tone="muted" className="mt-4 text-pretty">
                {section.intro}
              </Text>
            ) : null}
          </div>
          <div
            className={cn(
              'rounded-xl border border-border/80 bg-surface/95 p-5 shadow-md backdrop-blur-sm sm:p-8',
            )}
          >
            {accordion}
          </div>
        </div>
      ) : (
        <>
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
          <div className="mt-8">{accordion}</div>
        </>
      )}
    </SectionShell>
  )
}