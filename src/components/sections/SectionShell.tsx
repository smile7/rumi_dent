import type { ReactNode } from 'react'

import { Container } from '@/components/primitives/Container'
import { Section } from '@/components/primitives/Section'
import type { Section as SectionModel } from '@/lib/content'

import { sectionTitleId } from './helpers'

type SectionShellProps = {
  section: Pick<SectionModel, 'tone' | 'spacing' | 'anchorId' | 'key'>
  labelledBy?: string
  className?: string
  containerClassName?: string
  width?: 'content' | 'wide' | 'prose'
  children: ReactNode
}

/** Applies CMS tone/spacing and optional `aria-labelledby` on the band. */
export function SectionShell({
  section,
  labelledBy,
  className,
  containerClassName,
  width = 'content',
  children,
}: SectionShellProps) {
  return (
    <Section
      tone={section.tone}
      spacing={section.spacing}
      anchorId={section.anchorId}
      labelledBy={labelledBy}
      className={className}
    >
      <Container width={width} className={containerClassName}>
        {children}
      </Container>
    </Section>
  )
}

export { sectionTitleId }