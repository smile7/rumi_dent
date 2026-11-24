import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { HeaderScrollState } from './HeaderScrollState'

type Callback = (entries: Partial<IntersectionObserverEntry>[]) => void

let callback: Callback | undefined
const disconnect = vi.fn()

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(cb: Callback) {
        callback = cb
      }
      observe() {}
      disconnect = disconnect
    },
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
  callback = undefined
})

function setup() {
  const view = render(
    <>
      <HeaderScrollState targetId="site-header" />
      <header id="site-header" />
    </>,
  )
  const header = view.container.querySelector('header')!
  const fire = (isIntersecting: boolean, top: number) =>
    act(() => callback?.([{ isIntersecting, boundingClientRect: { top } as DOMRectReadOnly }]))
  return { ...view, header, fire }
}

describe('HeaderScrollState', () => {
  it('sets data-compact when the sentinel scrolls above the viewport and clears it on return', () => {
    const { header, fire } = setup()
    expect(header).not.toHaveAttribute('data-compact')

    fire(false, -10)
    expect(header).toHaveAttribute('data-compact')

    fire(true, 20)
    expect(header).not.toHaveAttribute('data-compact')
  })

  it('stays expanded when the sentinel is out of view below the viewport', () => {
    const { header, fire } = setup()
    fire(false, 900)
    expect(header).not.toHaveAttribute('data-compact')
  })

  it('disconnects the observer on unmount', () => {
    const { unmount } = setup()
    unmount()
    expect(disconnect).toHaveBeenCalled()
  })
})
