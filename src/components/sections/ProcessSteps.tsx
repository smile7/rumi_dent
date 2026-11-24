import { Heading } from '@/components/primitives/Heading'
import { ContentIcon } from '@/components/primitives/ContentIcon'
import { Text } from '@/components/primitives/Text'
import type { ProcessStepsSection } from '@/lib/content'

import { SectionCtas } from './SectionCtas'
import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function ProcessStepsSection({
  section: raw,
  index,
  sections,
  site,
}: SectionComponentProps) {
  const section = raw as ProcessStepsSection
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      {section.intro ? (
        <Text tone="muted" className="mt-4 max-w-(--container-prose)">
          {section.intro}
        </Text>
      ) : null}
      <ol className="mt-10 grid gap-8 md:grid-cols-3">
        {section.steps.map((step, stepIndex) => (
          <li key={step.key} className="relative flex flex-col gap-3 rounded-card border border-border bg-surface p-6">
            <span
              aria-hidden="true"
              className="font-display text-step-2 font-extrabold text-accent tabular-nums"
            >
              {stepIndex + 1}
            </span>
            {step.icon ? <ContentIcon name={step.icon} className="text-primary" /> : null}
            <Heading as="h3" size="step-1">
              {step.title}
            </Heading>
            {step.text ? <Text className="text-fg-muted">{step.text}</Text> : null}
          </li>
        ))}
      </ol>
      {section.cta ? (
        await SectionCtas({ ctas: [section.cta], site, className: 'mt-10' })
      ) : null}
    </SectionShell>
  )
}