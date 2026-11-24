import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Heading, defaultHeadingSize, type HeadingLevel } from './Heading'

const levels: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

describe('Heading', () => {
  it.each(levels)('renders %s with its default size', (level) => {
    render(<Heading as={level}>Title</Heading>)
    const heading = screen.getByRole('heading', { level: Number(level.slice(1)) })
    expect(heading.tagName).toBe(level.toUpperCase())
    expect(heading).toHaveAttribute('data-size', defaultHeadingSize[level])
    expect(heading).toHaveClass(`text-${defaultHeadingSize[level]}`)
  })

  it('decouples the semantic level from the visual size', () => {
    render(
      <Heading as="h2" size="step-5">
        Big h2
      </Heading>,
    )
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading).toHaveClass('text-step-5')
    expect(heading).not.toHaveClass('text-step-4')
  })

  it('lets className compose without dropping the size', () => {
    render(
      <Heading as="h3" className="text-primary">
        Tinted
      </Heading>,
    )
    expect(screen.getByRole('heading', { level: 3 })).toHaveClass('text-step-2', 'text-primary')
  })
})
