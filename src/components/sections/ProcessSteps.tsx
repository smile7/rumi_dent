import { ContentIcon } from '@/components/primitives/ContentIcon'
import { SectionTitle } from '@/components/primitives/SectionTitle'
import { Text } from '@/components/primitives/Text'
import { Heading } from '@/components/primitives/Heading'
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
      <ol className="process-timeline mt-10 grid gap-6 md:grid-cols-3 md:gap-10">
        {section.steps.map((step, stepIndex) => (
          <li
            key={step.key}
            className="process-step-card flex flex-col gap-4 rounded-card border-2 border-border/60 bg-surface p-6 shadow-sm"
          >
            <span className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-pill bg-accent font-display text-step-0 font-extrabold text-accent-fg tabular-nums shadow-sm"
              >
                {stepIndex + 1}
              </span>
              {step.icon ? <ContentIcon name={step.icon} className="text-primary" /> : null}
            </span>
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