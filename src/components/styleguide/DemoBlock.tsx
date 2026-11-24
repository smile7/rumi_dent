import type { ReactNode } from 'react'
import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Section, type SectionTone } from '@/components/primitives/Section'

type DemoBlockProps = {
  id: string
  title: string
  tone?: SectionTone
  children: ReactNode
}

/** One labelled styleguide section with an anchor. */
export function DemoBlock({ id, title, tone = 'base', children }: DemoBlockProps) {
  return (
    <Section anchorId={id} labelledBy={`${id}-title`} tone={tone} spacing="compact">
      <Container>
        <Heading as="h2" size="step-3" id={`${id}-title`} className="mb-8">
          {title}
        </Heading>
        {children}
      </Container>
    </Section>
  )
}
