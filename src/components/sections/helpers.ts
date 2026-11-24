import type { HeadingLevel } from '@/components/primitives/Heading'
import type { Section } from '@/lib/content'

/** Stable id for a section heading (`aria-labelledby` on the section band). */
export function sectionTitleId(sectionKey: string) {
  return `section-${sectionKey}-title`
}

export function pageUsesHeroH1(sections: readonly Section[]) {
  return sections[0]?.type === 'hero'
}

/**
 * Semantic level for the section's primary heading (hero heading, FAQ title, …). A leading hero
 * owns the page's only `h1`; otherwise the page renders `page.title` as the `h1`, so every
 * section heading is an `h2`.
 */
export function sectionHeadingLevel(index: number, sections: readonly Section[]): HeadingLevel {
  return index === 0 && pageUsesHeroH1(sections) ? 'h1' : 'h2'
}

/** One level down from the section title (tile buttons, accordion items wrapped in headings). */
export function subsectionHeadingLevel(
  sectionLevel: HeadingLevel,
): 'h2' | 'h3' | 'h4' | 'h5' | 'h6' {
  const next: Record<HeadingLevel, 'h2' | 'h3' | 'h4' | 'h5' | 'h6'> = {
    h1: 'h2',
    h2: 'h3',
    h3: 'h4',
    h4: 'h5',
    h5: 'h6',
    h6: 'h6',
  }
  return next[sectionLevel]
}
