import { fireEvent, screen, waitFor } from '@testing-library/react'
import type * as Navigation from 'next/navigation'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/test/intl'

import { MENU_OPEN_ATTR, MobileNav } from './MobileNav'

vi.mock('next/navigation', async (importOriginal) => ({
  ...(await importOriginal<typeof Navigation>()),
  usePathname: () => '/bg/uslugi',
  useParams: () => ({ locale: 'bg' }),
}))

const props = {
  nav: [
    { href: '/bg/uslugi', external: false, label: 'Услуги', children: [] },
    { href: '/bg/za-nas', external: false, label: 'За нас', children: [] },
  ],
  phone: { href: 'tel:+35982841190', display: '082 841 190' },
  booking: { href: 'tel:+35982841190', external: false, label: 'Запишете час' },
}

describe('MobileNav', () => {
  it('has a localized trigger that controls the panel', () => {
    renderWithIntl(<MobileNav {...props} />)
    const trigger = screen.getByRole('button', { name: 'Меню' })
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(trigger).toHaveAttribute('aria-controls')

    renderWithIntl(<MobileNav {...props} />, 'en')
    expect(screen.getByRole('button', { name: 'Menu' })).toBeInTheDocument()
  })

  it('opens a labelled dialog and closes on Escape, returning focus', async () => {
    renderWithIntl(<MobileNav {...props} />)
    const trigger = screen.getByRole('button', { name: 'Меню' })

    fireEvent.click(trigger)
    const dialog = await screen.findByRole('dialog', { name: 'Меню' })
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(dialog).toHaveAttribute('id', trigger.getAttribute('aria-controls'))
    expect(document.documentElement).toHaveAttribute(MENU_OPEN_ATTR)
    expect(screen.getByRole('link', { name: 'Услуги' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Запишете час' })).toHaveAttribute(
      'href',
      'tel:+35982841190',
    )

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(document.documentElement).not.toHaveAttribute(MENU_OPEN_ATTR)
    await waitFor(() => expect(trigger).toHaveFocus())
  })

  it('closes when a link is chosen', async () => {
    renderWithIntl(<MobileNav {...props} />)
    fireEvent.click(screen.getByRole('button', { name: 'Меню' }))
    fireEvent.click(await screen.findByRole('link', { name: 'За нас' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
})
