import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Wordmark } from './Wordmark'

describe('Wordmark', () => {
  it('renders the brand name as text', () => {
    render(<Wordmark name="Руми Дент" />)
    expect(screen.getByText('Руми Дент')).toBeInTheDocument()
  })

  it('uses a smaller step for the compact variant', () => {
    const { container } = render(<Wordmark name="Руми Дент" variant="compact" />)
    const root = container.querySelector('[data-slot="wordmark"]')
    expect(root).toHaveClass('text-step-1')
  })

  it('renders an img element when a logo is provided', () => {
    const logo = { src: 'https://cdn.sanity.io/images/abc/prod/logo.png', width: 200, height: 60, alt: '' }
    const { container } = render(<Wordmark name="Руми Дент" logo={logo} />)
    expect(container.querySelector('img')).toBeTruthy()
    expect(container.querySelector('[data-slot="wordmark"]')).toBeNull()
  })
})
