'use client'

import type { ReactNode } from 'react'
import { Component } from 'react'

type Props = {
  sectionKey: string
  sectionType: string
  children: ReactNode
}

type State = { error: Error | null }

/**
 * One broken section must not take down the page. Production: silent. Dev: outlined warning.
 */
export class SectionErrorBoundary extends Component<Props, State> {
  override state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  override render() {
    if (this.state.error) {
      if (process.env.NODE_ENV === 'production') return null
      return (
        <div
          role="alert"
          data-section-type={this.props.sectionType}
          data-section-key={this.props.sectionKey}
          className="mx-auto max-w-content border-2 border-dashed border-danger px-5 py-8 text-step-0 text-danger"
        >
          <p className="font-bold">{this.state.error.message}</p>
        </div>
      )
    }
    return this.props.children
  }
}