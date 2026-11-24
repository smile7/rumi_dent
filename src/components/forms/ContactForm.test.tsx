import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { renderWithIntl } from '@/test/intl'

import { ContactForm, type ContactAction } from './ContactForm'

const NAME = 'Име (задължително)'
const MESSAGE = 'Съобщение (задължително)'
const phone = { href: 'tel:+359828411900', display: '082 841 190' }

function setup(action: ContactAction = vi.fn(async () => ({ ok: true as const }))) {
  renderWithIntl(
    <ContactForm
      action={action}
      phone={phone}
      privacyHref="/bg/pravna-informaciya/poveritelnost"
    />,
  )
  return action
}

function submit() {
  fireEvent.click(screen.getByRole('button', { name: 'Изпрати' }))
}

describe('ContactForm', () => {
  it('marks invalid fields, links their errors and focuses the first one', async () => {
    const action = setup()
    submit()

    const name = await screen.findByLabelText(NAME)
    await waitFor(() => expect(name).toHaveAttribute('aria-invalid', 'true'))
    expect(name).toHaveFocus()

    const errorId = name.getAttribute('aria-describedby')
    expect(errorId && document.getElementById(errorId)).toHaveTextContent(
      'Въведете име между 2 и 80 знака.',
    )

    const phoneInput = screen.getByLabelText('Телефон')
    expect(phoneInput).toHaveAttribute('aria-invalid', 'true')
    expect(phoneInput.getAttribute('aria-describedby')).toContain('-phone-error')
    expect(screen.getByLabelText(/Съгласен/)).toHaveAttribute('aria-invalid', 'true')

    expect(screen.getByRole('alert')).toHaveTextContent('Моля, поправете 4 полета:')
    expect(action).not.toHaveBeenCalled()
  })

  it('uses the right autocomplete and input modes', () => {
    setup()
    expect(screen.getByLabelText(NAME)).toHaveAttribute('autocomplete', 'name')
    expect(screen.getByLabelText('Телефон')).toHaveAttribute('autocomplete', 'tel')
    expect(screen.getByLabelText('Телефон')).toHaveAttribute('inputmode', 'tel')
    expect(screen.getByLabelText('Имейл')).toHaveAttribute('autocomplete', 'email')
  })

  it('asks for the child age only for the child topic', () => {
    setup()
    expect(screen.queryByLabelText('Възраст на детето')).not.toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Час за дете'))
    expect(screen.getByLabelText('Възраст на детето')).toBeInTheDocument()
  })

  it('submits valid input and moves focus to the success message', async () => {
    const action = setup()
    fireEvent.input(screen.getByLabelText(NAME), { target: { value: 'Мария' } })
    fireEvent.input(screen.getByLabelText('Телефон'), { target: { value: '0888 123 456' } })
    fireEvent.input(screen.getByLabelText(MESSAGE), {
      target: { value: 'Бих искала да запиша час.' },
    })
    fireEvent.click(screen.getByLabelText(/Съгласен/))
    await act(async () => submit())

    await waitFor(() => expect(action).toHaveBeenCalledTimes(1))
    const form = vi.mocked(action).mock.calls[0]![1]
    expect(form.get('phone')).toBe('0888 123 456')
    expect(form.get('consent')).toBe('on')
    const status = await screen.findByRole('status')
    expect(status).toHaveTextContent('Благодарим ви!')
    await waitFor(() => expect(status).toHaveFocus())
  })

  it('shows the phone as a fallback when sending fails', async () => {
    setup(vi.fn(async () => ({ ok: false as const, formError: 'sendFailed' as const })))
    fireEvent.input(screen.getByLabelText(NAME), { target: { value: 'Мария' } })
    fireEvent.input(screen.getByLabelText('Имейл'), { target: { value: 'maria@example.com' } })
    fireEvent.input(screen.getByLabelText(MESSAGE), {
      target: { value: 'Бих искала да запиша час.' },
    })
    fireEvent.click(screen.getByLabelText(/Съгласен/))
    await act(async () => submit())

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent('Съобщението не беше изпратено.')
    expect(screen.getByRole('link', { name: '082 841 190' })).toHaveAttribute(
      'href',
      'tel:+359828411900',
    )
    await waitFor(() => expect(alert).toHaveFocus())
  })
})
