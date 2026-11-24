import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { CtaBandSection, HeroSection, Section } from '@/lib/content'

import { fixtureSite } from './__fixtures__/site'
import { SectionRenderer } from './SectionRenderer'
import type { SectionComponentProps } from './types'

const base = { tone: 'base' as const, spacing: 'default' as const }

function crashing(type: string, mode: 'sync' | 'async') {
  const body = (props: SectionComponentProps) => {
    if (props.section.key === 'bad') throw new Error('boom')
    const label =
      props.section.type === 'hero'
        ? (props.section as HeroSection).heading
        : props.section.type === 'ctaBand'
          ? (props.section as CtaBandSection).heading
          : props.section.key
    return <div data-section={type}>{label}</div>
  }
  return mode === 'async' ? async (props: SectionComponentProps) => body(props) : body
}

vi.mock('./registry', () => ({
  registryEntry: (type: string) => {
    if (type === 'hero') return crashing('hero', 'async')
    if (type === 'faq') return crashing('faq', 'sync')
    if (type === 'ctaBand') return crashing('ctaBand', 'async')
    return null
  },
}))

describe('SectionRenderer', () => {
  it('renders a mixed fixture list and swallows production errors', async () => {
    const sections: Section[] = [
      {
        ...base,
        key: 'h',
        type: 'hero',
        heading: 'Welcome',
        ctas: [],
        variant: 'split',
        trustItems: [],
      },
      {
        ...base,
        key: 'bad',
        type: 'faq',
        items: [],
        emitSchema: false,
      },
      {
        ...base,
        key: 'c',
        type: 'ctaBand',
        heading: 'Call us',
        ctas: [],
      },
    ]

    vi.stubEnv('NODE_ENV', 'production')
    const { container } = render(
      await SectionRenderer({ sections, locale: 'bg', site: fixtureSite }),
    )
    expect(screen.getByText('Welcome')).toBeInTheDocument()
    expect(screen.getByText('Call us')).toBeInTheDocument()
    expect(container.querySelector('[data-section="faq"]')).toBeNull()

    vi.stubEnv('NODE_ENV', 'development')
    render(await SectionRenderer({ sections, locale: 'bg', site: fixtureSite }))
    expect(screen.getByRole('alert')).toHaveAttribute('data-section-type', 'faq')

    vi.unstubAllEnvs()
  })
})