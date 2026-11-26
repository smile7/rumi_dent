import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}))

import { renderWithIntl } from '@/test/intl'

import { heroSplitBg } from './__fixtures__/hero'
import { fixtureSite } from './__fixtures__/site'
import { HeroSection } from './Hero'

describe('HeroSection', () => {
  it('renders the heading', async () => {
    const ui = await HeroSection({
      section: heroSplitBg,
      index: 0,
      sections: [heroSplitBg],
      locale: 'bg',
      site: fixtureSite,
      imagePriority: true,
    })
    renderWithIntl(<>{ui}</>)
    expect(screen.getByRole('heading', { level: 1, name: heroSplitBg.heading })).toBeInTheDocument()
  })

  it('renders the subheading', async () => {
    const ui = await HeroSection({
      section: heroSplitBg,
      index: 0,
      sections: [heroSplitBg],
      locale: 'bg',
      site: fixtureSite,
      imagePriority: false,
    })
    renderWithIntl(<>{ui}</>)
    expect(screen.getByText(heroSplitBg.subheading!)).toBeInTheDocument()
  })
})
