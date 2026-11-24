import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { MapEmbed } from './MapEmbed'

const embedUrl = 'https://www.google.com/maps/embed?pb=demo'

function renderMap() {
  return render(
    <MapEmbed
      embedUrl={embedUrl}
      title="Map"
      loadLabel="Load the map (Google)"
      notice="Notice"
      alwaysAllowLabel="Always load Google Maps"
    >
      <span>Placeholder</span>
    </MapEmbed>,
  )
}

describe('MapEmbed', () => {
  it('renders no iframe before the click', () => {
    const { container } = renderMap()
    expect(container.querySelector('iframe')).toBeNull()
    expect(screen.getByText('Placeholder')).toBeInTheDocument()
  })

  it('loads the titled, lazy iframe on click and focuses it', () => {
    renderMap()
    fireEvent.click(screen.getByRole('button', { name: 'Load the map (Google)' }))
    const iframe = screen.getByTitle('Map')
    expect(iframe.tagName).toBe('IFRAME')
    expect(iframe).toHaveAttribute('src', embedUrl)
    expect(iframe).toHaveAttribute('loading', 'lazy')
    expect(iframe).toHaveAttribute('referrerpolicy', 'no-referrer-when-downgrade')
    expect(iframe).toHaveFocus()
  })
})
