import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Wordmark } from './Wordmark'

describe('Wordmark', () => {
  it('renders the brand name as plain text, with no decorative glyph', () => {
    const { container } = render(<Wordmark name="Руми Дент" />)
    expect(screen.getByText('Руми Дент')).toBeInTheDocument()
    expect(container.querySelector('svg')).toBeNull()
  })

  it('uses a smaller step for the compact variant', () => {
    const { container } = render(<Wordmark name="Руми Дент" variant="compact" />)
    expect(container.querySelector('[data-slot="wordmark"]')).toHaveClass('text-step-1')
  })
})
