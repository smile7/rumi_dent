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
    <SectionShell section={section} labelledBy={titleId} width="wide">
      <div className="relative overflow-hidden rounded-card border-2 border-accent-300/50 bg-tone-brand-bg px-6 py-14 text-tone-brand-fg shadow-play sm:px-12 sm:py-16">
        <div
          className="pointer-events-none absolute -end-16 -top-16 size-48 rounded-full bg-accent-400/20"
          aria-hidden="true"
        />
        <div className="relative max-w-(--container-prose)">
          <Heading as={level} size="step-3" id={titleId}>
            {section.heading}
          </Heading>
          {section.text ? (
            <Text size="lead" className="mt-4 text-pretty">
              {section.text}
            </Text>
          ) : null}
          {await SectionCtas({ ctas: section.ctas, site, className: 'mt-8' })}
        </div>
      </div>
    </SectionShell>
  )
}