import { ContentIcon } from '@/components/primitives/ContentIcon'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import type { ProcessStepsSection } from '@/lib/content'
import { cn } from '@/lib/utils'

import { SectionShell, sectionTitleId } from './SectionShell'
import { sectionHeadingLevel } from './helpers'
import type { SectionComponentProps } from './types'

export async function ProcessStepsSection({
  section: raw,
  index,
  sections,
}: SectionComponentProps) {
  const section = raw as ProcessStepsSection
  const titleId = sectionTitleId(section.key)
  const level = sectionHeadingLevel(index, sections)

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {/* Section header */}
      <div className="max-w-(--container-prose)">
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
      </div>

      {/* Steps — editorial numbered layout */}
      <ol className="relative mt-14 grid gap-0 md:grid-cols-3">
        {section.steps.map((step, stepIndex) => {
          const isLast = stepIndex === section.steps.length - 1
          return (
            <li key={step.key} className="relative flex gap-5 pb-10 md:flex-col md:pb-0 md:pe-10">
              {/* Connector line */}
              {!isLast && (
                <>
                  {/* Mobile: vertical line */}
                  <div
                    aria-hidden="true"
                    className="absolute left-5 top-10 bottom-0 w-px bg-brand-200 md:hidden"
                  />
                  {/* Desktop: horizontal line */}
                  <div
                    aria-hidden="true"
                    className="absolute top-5 hidden h-px bg-gradient-to-r from-brand-200 to-brand-100 md:block"
                    style={{ left: 'calc(2.5rem + 1.25rem)', right: '0' }}
                  />
                </>
              )}

              {/* Step number badge */}
              <div
                className={cn(
                  'relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full',
                  'bg-primary text-primary-fg font-display text-step-0 font-extrabold shadow-sm',
                )}
                aria-label={`Стъпка ${stepIndex + 1}`}
              >
                <span aria-hidden="true">{stepIndex + 1}</span>
              </div>

              {/* Step content */}
              <div className="pb-2 pt-1 md:pt-0">
                {step.icon ? (
                  <ContentIcon
                    name={step.icon}
                    className="mb-3 mt-0.5 text-accent md:mt-0"
                  />
                ) : null}
                <Heading as="h3" size="step-1" className="font-bold">
                  {step.title}
                </Heading>
                {step.text ? (
                  <Text className="mt-2 text-fg-muted">{step.text}</Text>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </SectionShell>
  )
}
