import { screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

vi.mock('next-intl/server', () => ({
  getTranslations: async () => (key: string) => key,
}))

import { renderWithIntl } from '@/test/intl'

import { heroCutoutEn, heroSplitBg } from './__fixtures__/hero'
import { fixtureSite } from './__fixtures__/site'
import { HeroSection } from './Hero'

describe('HeroSection', () => {
  it('renders the h1 with its *accent* word, the lead action and the opening hours', async () => {
    const ui = await HeroSection({
      section: heroSplitBg,
      index: 0,
      sections: [heroSplitBg],
      locale: 'bg',
      site: fixtureSite,
      imagePriority: true,
    })
    renderWithIntl(<>{ui}</>)
    const heading = screen.getByRole('heading', { level: 1, name: 'Усмивки без страх' })
    expect(heading.querySelector('em')).toHaveTextContent('без')
    expect(screen.getByRole('link', { name: /Book/ })).toBeInTheDocument()
    expect(screen.getByText('hoursLabel')).toBeInTheDocument()
  })

  it('shows trust items only when the editor adds them', async () => {
    const withItems = await HeroSection({
      section: heroCutoutEn,
      index: 0,
      sections: [heroCutoutEn],
      locale: 'en',
      site: fixtureSite,
      imagePriority: true,
    })
    const { unmount } = renderWithIntl(<>{withItems}</>)
    expect(screen.getByText('Children from age 1')).toBeInTheDocument()
    unmount()

    const section = { ...heroCutoutEn, trustItems: [] }
    const without = await HeroSection({
      section,
      index: 0,
      sections: [section],
      locale: 'en',
      site: fixtureSite,
      imagePriority: true,
    })
    renderWithIntl(<>{without}</>)
    expect(screen.queryByText('Children from age 1')).not.toBeInTheDocument()
  })
})
