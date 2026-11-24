import type { ReactNode } from 'react'

import type { Section, SectionType } from '@/lib/content'

import { SectionErrorBoundary } from './SectionErrorBoundary'
import { registryEntry } from './registry'
import type { SectionComponentProps, SectionSiteContext } from './types'

export type SectionRendererProps = {
  sections: Section[]
  locale: SectionComponentProps['locale']
  site: SectionSiteContext
}

export async function SectionRenderer({ sections, locale, site }: SectionRendererProps) {
  const bands = await Promise.all(
    sections.map(async (section, index) => {
      const type = section.type satisfies SectionType
      const Component = registryEntry(type)
      if (!Component) return null

      // Only the page's first image is preloaded; sections that use it render a single image.
      const imagePriority = index === 0

      const props: SectionComponentProps = {
        section,
        index,
        sections,
        locale,
        site,
        imagePriority,
      }

      let content: ReactNode
      try {
        content = await Component(props)
      } catch (error) {
        if (process.env.NODE_ENV === 'production') {
          content = null
        } else {
          const message = error instanceof Error ? error.message : String(error)
          content = (
            <div
              role="alert"
              data-section-type={type}
              data-section-key={section.key}
              className="mx-auto max-w-content border-2 border-dashed border-danger px-5 py-8 text-danger"
            >
              {message}
            </div>
          )
        }
      }

      return (
        <SectionErrorBoundary key={section.key} sectionKey={section.key} sectionType={type}>
          {content}
        </SectionErrorBoundary>
      )
    }),
  )

  return <>{bands}</>
}
