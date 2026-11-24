import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { renderWithIntl } from '@/test/intl'

import { TilesGrid } from './TilesGrid'

const baseItems = [
  { key: 'a', title: 'Tile A', slug: 'tile-a', cta: null },
  { key: 'b', title: 'Tile B', slug: 'tile-b', cta: null },
] as const

const defaultProps = {
  items: [...baseItems],
  bodies: { a: <p>Body A</p>, b: <p>Body B</p> },
  allowMultiple: false,
  source: 'manual' as const,
  density: 'comfortable' as const,
  locale: 'bg' as const,
  tileHeadingLevel: 'h3' as const,
}

describe('TilesGrid', () => {
  it('toggles aria-expanded when Enter is pressed on the tile button', () => {
    renderWithIntl(<TilesGrid {...defaultProps} />)
    const buttonA = screen.getByRole('button', { name: /Tile A/i })
    expect(buttonA).toHaveAttribute('aria-expanded', 'false')

    fireEvent.keyDown(buttonA, { key: 'Enter' })
    expect(buttonA).toHaveAttribute('aria-expanded', 'true')

    fireEvent.keyDown(buttonA, { key: 'Enter' })
    expect(buttonA).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the other tile when allowMultiple is false', () => {
    const itemsWithoutSlug = [
      { key: 'a', title: 'Tile A', cta: null },
      { key: 'b', title: 'Tile B', cta: null },
    ]
    renderWithIntl(<TilesGrid {...defaultProps} items={itemsWithoutSlug} />)
    const buttonA = screen.getByRole('button', { name: /Tile A/i })
    const buttonB = screen.getByRole('button', { name: /Tile B/i })

    fireEvent.click(buttonA)
    expect(buttonA).toHaveAttribute('aria-expanded', 'true')
    expect(buttonB).toHaveAttribute('aria-expanded', 'false')

    fireEvent.click(buttonB)
    expect(buttonB).toHaveAttribute('aria-expanded', 'true')
    expect(buttonA).toHaveAttribute('aria-expanded', 'false')
  })
})