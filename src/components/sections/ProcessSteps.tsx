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
  const compact = section.layout === 'compact'

  return (
    <SectionShell section={section} labelledBy={section.heading ? titleId : undefined}>
      {section.heading ? (
        <Heading as={level} size="step-3" id={titleId}>
          {section.heading}
        </Heading>
      ) : null}
      {section.intro ? (
        <Text tone="muted" className="mt-4 max-w-(--container-prose) text-pretty">
          {section.intro}
        </Text>
      ) : null}

      {compact ? (
        <ol className="relative mt-10 grid gap-8 md:grid-cols-3 md:gap-6">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-8 right-[12%] left-[12%] hidden h-0.5 bg-linear-to-r from-primary/30 via-primary to-primary/30 md:block"
          />
          {section.steps.map((step, stepIndex) => (
            <li
              key={step.key}
              className="relative flex flex-col items-center gap-3 rounded-xl border border-border/70 bg-surface/90 p-5 text-center shadow-sm backdrop-blur-sm md:items-center md:px-4"
            >
              <span
                aria-hidden="true"
                className="flex size-11 items-center justify-center rounded-full bg-primary font-display text-step-0 font-extrabold text-primary-fg tabular-nums shadow-md"
              >
                {stepIndex + 1}
              </span>
              {step.icon ? (
                <ContentIcon name={step.icon} className="size-6 text-accent" />
              ) : null}
              <Heading as="h3" size="step-1" className="text-balance">
                {step.title}
              </Heading>
              {step.text ? (
                <Text size="small" className="max-w-xs text-fg-muted text-pretty">
                  {step.text}
                </Text>
              ) : null}
            </li>
          ))}
        </ol>
      ) : (
        <ol className="mt-10 grid gap-8 md:grid-cols-3">
          {section.steps.map((step, stepIndex) => (
            <li
              key={step.key}
              className="relative flex flex-col gap-3 rounded-card border border-border bg-surface p-6"
            >
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
      )}

      {!compact && section.cta ? (
        await SectionCtas({ ctas: [section.cta], site, className: 'mt-10' })
      ) : null}
    </SectionShell>
  )
}