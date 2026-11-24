import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('keeps a type-step size and a token color together', () => {
    expect(cn('text-step-2', 'text-fg')).toBe('text-step-2 text-fg')
  })

  it('resolves conflicts within the same group (last wins)', () => {
    expect(cn('text-fg', 'text-primary')).toBe('text-primary')
    expect(cn('text-step-1', 'text-step-3')).toBe('text-step-3')
    expect(cn('rounded-md', 'rounded-pill')).toBe('rounded-pill')
    expect(cn('max-w-content', 'max-w-prose')).toBe('max-w-prose')
  })

  it('joins conditional classes', () => {
    const isOpen = false
    expect(cn('p-4', isOpen && 'bg-surface', { 'bg-bg': !isOpen })).toBe('p-4 bg-bg')
  })
})
