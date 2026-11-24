import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import type { GalleryItem } from '@/lib/content'
import { renderWithIntl } from '@/test/intl'

import { fixtureImage } from './__fixtures__/image'
import { GalleryLightbox } from './GalleryLightbox'

const items: GalleryItem[] = [
  { id: '1', album: 'clinic', image: { ...fixtureImage, alt: 'Photo one' } },
  { id: '2', album: 'clinic', image: { ...fixtureImage, alt: 'Photo two' } },
]

describe('GalleryLightbox', () => {
  it('moves the counter with ArrowRight and closes on Escape', () => {
    renderWithIntl(<GalleryLightbox items={items} albums={['clinic']} />)

    fireEvent.click(screen.getByRole('img', { name: 'Photo one' }).closest('button')!)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toBeInTheDocument()
    const counter = dialog.querySelector('p[aria-live="polite"]')
    expect(counter).toHaveTextContent('1 / 2')

    fireEvent.keyDown(window, { key: 'ArrowRight' })
    expect(counter).toHaveTextContent('2 / 2')

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})