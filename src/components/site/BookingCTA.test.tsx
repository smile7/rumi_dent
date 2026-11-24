import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { track } from '@/lib/analytics/track'

import { BookingCTA } from './BookingCTA'

vi.mock('@/lib/analytics/track', () => ({ track: vi.fn() }))

describe('BookingCTA', () => {
  beforeEach(() => vi.mocked(track).mockClear())

  it('tracks booking_click with the mode and opens an external booking in a new tab', () => {
    render(
      <BookingCTA href="https://book.example" external mode="externalUrl" opensInNewTab="(new tab)">
        Book
      </BookingCTA>,
    )
    const link = screen.getByRole('link', { name: /^Book\s*\(new tab\)$/ })
    expect(link).toHaveAttribute('target', '_blank')
    fireEvent.click(link)
    expect(track).toHaveBeenCalledWith('booking_click', { mode: 'externalUrl' })
  })

  it('keeps a phone booking in the same tab and tracks without a mode when none is set', () => {
    render(
      <BookingCTA href="tel:+35982000000" external={false} opensInNewTab="(new tab)">
        Book
      </BookingCTA>,
    )
    const link = screen.getByRole('link', { name: 'Book' })
    expect(link).not.toHaveAttribute('target')
    fireEvent.click(link)
    expect(track).toHaveBeenCalledWith('booking_click', undefined)
  })
})
