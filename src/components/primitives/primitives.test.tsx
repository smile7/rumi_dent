import { render, screen } from '@testing-library/react'
import { Phone } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { Container } from './Container'
import { Icon } from './Icon'
import { Section } from './Section'

describe('Icon', () => {
  it('is decorative by default', () => {
    const { container } = render(<Icon icon={Phone} />)
    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
  })

  it('is exposed as an image when labelled', () => {
    render(<Icon icon={Phone} label="Phone" />)
    expect(screen.getByRole('img', { name: 'Phone' })).toBeInTheDocument()
  })
})

describe('Section', () => {
  it('becomes a labelled region and carries tone + anchor', () => {
    render(
      <Section tone="soft" anchorId="faq" labelledBy="faq-title">
        <h2 id="faq-title">FAQ</h2>
      </Section>,
    )
    const region = screen.getByRole('region', { name: 'FAQ' })
    expect(region).toHaveAttribute('id', 'faq')
    expect(region).toHaveAttribute('data-tone', 'soft')
    expect(region).toHaveClass('bg-tone-soft-bg')
  })
})

describe('Container', () => {
  it('reads the prose width from the token, not the built-in 65ch utility', () => {
    const { container } = render(<Container width="prose">x</Container>)
    expect(container.firstElementChild).toHaveClass('max-w-(--container-prose)')
  })
})
