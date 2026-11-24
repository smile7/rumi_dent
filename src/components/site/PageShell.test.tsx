import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { PageShell } from './PageShell'

function renderShell() {
  return render(
    <PageShell
      skipLabel="Skip to main content"
      header={
        <header>
          <a href="#top">Demo Dental</a>
        </header>
      }
      footer={
        <footer>
          <a href="#privacy">Privacy</a>
        </footer>
      }
    >
      <p>Page content</p>
    </PageShell>,
  )
}

describe('PageShell', () => {
  it('renders exactly one main landmark, focusable by script only', () => {
    renderShell()
    const mains = screen.getAllByRole('main')
    expect(mains).toHaveLength(1)
    expect(mains[0]).toHaveAttribute('tabindex', '-1')
  })

  it('makes the skip link the first focusable element and points it at main', () => {
    const { container } = renderShell()
    const first = container.querySelector('a[href], button, [tabindex]:not([tabindex="-1"])')
    const skip = screen.getByRole('link', { name: 'Skip to main content' })
    expect(first).toBe(skip)
    const target = document.querySelector(skip.getAttribute('href') ?? '')
    expect(target).toBe(screen.getByRole('main'))
  })
})
