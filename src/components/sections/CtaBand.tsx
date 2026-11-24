import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { CtaBandSection as CtaBandModel } from '@/lib/content'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function CtaBandSection({
  section: raw,
  index,
  sections,
  site,
}: SectionComponentProps) {
  const section = raw as CtaBandModel
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  return (
    <SectionShell section={section} labelledBy={titleId}>
      <div className="mx-auto max-w-(--container-prose) text-center">
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
        {section.text ? (
          <Text size="lead" className="mt-4 text-pretty">
            {section.text}
          </Text>
        ) : null}
        {await SectionCtas({ ctas: section.ctas, site, className: 'mt-8 justify-center' })}
      </div>
    </SectionShell>
  )
}