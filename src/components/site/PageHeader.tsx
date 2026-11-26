import type { ReactNode } from 'react'

import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Section } from '@/components/primitives/Section'
import { emphasize } from '@/components/primitives/Emphasis'

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
    <Section as="div" spacing="compact" className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="shape-arch absolute top-8 right-[8%] hidden h-56 w-44 border border-primary/15 md:block" />
        <div className="absolute top-32 right-[5%] hidden size-16 rounded-pill bg-accent-300/80 md:block" />
      </div>
      <Container className="relative">
        {before}
        <Heading as="h1" size="step-5" className="max-w-[16ch] text-balance">
          {emphasize(title)}
        </Heading>
        {intro ? (
          <p className="mt-6 max-w-[40rem] text-step-1 leading-relaxed text-pretty text-fg-muted">
            {intro}
          </p>
        ) : null}
        {children}
      </Container>
    </Section>
  )
}
