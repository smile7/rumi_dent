import { describe, expect, it } from 'vitest'

import type { Section } from '@/lib/content'

import { heroSplitBg } from './__fixtures__/hero'
import { sectionHeadingLevel } from './helpers'

const cta: Section = {
  type: 'ctaBand',
  key: 'cta',
  tone: 'base',
  spacing: 'default',
  heading: 'Book a visit',
  ctas: [],
}

describe('sectionHeadingLevel', () => {
  it('gives the leading hero the h1 and every later section an h2', () => {
    const sections = [heroSplitBg, cta, { ...cta, key: 'cta-2' }]
    expect(sections.map((_, i) => sectionHeadingLevel(i, sections))).toEqual(['h1', 'h2', 'h2'])
  })

  it('never returns h1 when the page title is the h1 (no leading hero)', () => {
    const sections = [cta, heroSplitBg]
    expect(sections.map((_, i) => sectionHeadingLevel(i, sections))).toEqual(['h2', 'h2'])
  })
})
