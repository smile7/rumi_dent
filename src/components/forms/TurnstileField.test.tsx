import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { TurnstileField } from './TurnstileField'

const mocks = vi.hoisted(() => ({ props: vi.fn() }))

vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: (props: Record<string, unknown>) => {
    mocks.props(props)
    return <div data-testid="turnstile" />
  },
}))

let trigger: (isIntersecting: boolean) => void = () => undefined

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback: IntersectionObserverCallback) {
        trigger = (isIntersecting) =>
          callback([{ isIntersecting } as IntersectionObserverEntry], this as never)
      }
      observe() {}
      disconnect() {}
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  mocks.props.mockReset()
})

describe('TurnstileField', () => {
  it('loads the widget only once the form is near the viewport', () => {
    render(<TurnstileField siteKey="1x00000000000000000000AA" language="bg" resetSignal={null} />)
    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument()

    act(() => trigger(false))
    expect(screen.queryByTestId('turnstile')).not.toBeInTheDocument()

    act(() => trigger(true))
    expect(screen.getByTestId('turnstile')).toBeInTheDocument()
    expect(mocks.props).toHaveBeenLastCalledWith(
      expect.objectContaining({
        siteKey: '1x00000000000000000000AA',
        options: expect.objectContaining({
          appearance: 'interaction-only',
          size: 'flexible',
          language: 'bg',
          refreshExpired: 'auto',
        }),
      }),
    )
  })
})
