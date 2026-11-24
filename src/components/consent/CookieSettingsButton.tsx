'use client'

import { useConsent } from './ConsentProvider'

export type CookieSettingsButtonProps = { label: string; className?: string }

/** Footer "Cookie settings": reopens the preferences dialog (withdrawal is as easy as consent). */
export function CookieSettingsButton({ label, className }: CookieSettingsButtonProps) {
  const { openPreferences } = useConsent()
  return (
    <button type="button" onClick={openPreferences} className={className}>
      {label}
    </button>
  )
}
