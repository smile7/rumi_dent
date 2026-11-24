import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Wordmark } from './Wordmark'

describe('Wordmark', () => {
  it('renders the brand name as text and hides the decorative glyph', () => {
    const { container } = render(<Wordmark name="Руми Дент" />)
    expect(screen.getByText('Руми Дент')).toBeInTheDocument()
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('uses a smaller step for the compact variant and can drop the glyph', () => {
    const { container } = render(<Wordmark name="Руми Дент" variant="compact" accent={false} />)
    const root = container.querySelector('[data-slot="wordmark"]')
    expect(root).toHaveClass('text-step-1')
    expect(container.querySelector('svg')).toBeNull()
  })
})
