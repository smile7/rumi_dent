'use client'

import type * as React from 'react'
import { Toaster as Sonner, type ToasterProps } from 'sonner'
import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react'

// Light theme only in v1 (DESIGN-SYSTEM §2), so no theme switching.
function Toaster(props: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon aria-hidden="true" className="size-5 text-success" />,
        info: <InfoIcon aria-hidden="true" className="size-5 text-primary" />,
        warning: <TriangleAlertIcon aria-hidden="true" className="size-5" />,
        error: <OctagonXIcon aria-hidden="true" className="size-5 text-danger" />,
        loading: <Loader2Icon aria-hidden="true" className="size-5 animate-spin" />,
      }}
      style={
        {
          '--normal-bg': 'var(--color-surface-raised)',
          '--normal-text': 'var(--color-fg)',
          '--normal-border': 'var(--color-border)',
          '--border-radius': 'var(--radius-card)',
        } as React.CSSProperties
      }
      toastOptions={{ classNames: { toast: 'font-body text-step-0 shadow-md' } }}
      {...props}
    />
  )
}

export { Toaster }
