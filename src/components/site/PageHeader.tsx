import type { ReactNode } from 'react'

import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Section } from '@/components/primitives/Section'
import { Text } from '@/components/primitives/Text'

export type PageHeaderProps = {
  title: string
  intro?: string
  /** Above the title (breadcrumbs, badges). */
  before?: ReactNode
  /** Below the intro (dates, meta). */
  children?: ReactNode
}

/** The page's `h1` band, for pages that don't start with a hero. */
export function PageHeader({ title, intro, before, children }: PageHeaderProps) {
  return (
    <Section as="div" spacing="compact">
      <Container>
        {before}
        <Heading as="h1" size="step-4" className="text-balance">
          {title}
        </Heading>
        {intro ? (
          <Text size="lead" className="mt-4 max-w-(--container-prose) text-pretty">
            {intro}
          </Text>
        ) : null}
        {children}
      </Container>
    </Section>
  )
}
