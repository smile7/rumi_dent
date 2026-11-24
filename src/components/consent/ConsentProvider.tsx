'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'

import { cookiePrefixesFor, cookieRegistryVersion, requiresConsent } from '@/config/cookies'
import {
  consentCookieString,
  expireCookieStrings,
  parseConsent,
  readConsentCookie,
  type ConsentRecord,
  type GrantedCategory,
} from '@/lib/consent/consent'

import { CookieBanner } from './CookieBanner'
import { PreferencesDialog } from './PreferencesDialog'

export type ConsentContextValue = {
  /** The stored choice for the current registry version; `null` before hydration or without one. */
  consent: ConsentRecord | null
  has: (category: GrantedCategory) => boolean
  save: (categories: GrantedCategory[]) => void
  openPreferences: () => void
}

const noConsent: ConsentContextValue = {
  consent: null,
  has: () => false,
  save: () => {},
  openPreferences: () => {},
}

const ConsentContext = createContext<ConsentContextValue>(noConsent)

/** Outside a provider (tests, Studio) nothing is granted. */
export function useConsent(): ConsentContextValue {
  return useContext(ConsentContext)
}

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

const readCookie = () => readConsentCookie(document.cookie)
const readNothing = () => null
const noopSubscribe = () => () => {}

export type ConsentProviderProps = {
  /** Localized path of the cookie policy, linked from the banner and the dialog. */
  cookiePolicyHref?: string | undefined
  children: ReactNode
}

/**
 * Consent state in a first-party `consent` cookie, read only on the client (pages stay static).
 * Renders the banner (when a non-essential item is enabled and no choice is stored) and the
 * preferences dialog after the page content.
 */
export function ConsentProvider({ cookiePolicyHref, children }: ConsentProviderProps) {
  const raw = useSyncExternalStore(subscribe, readCookie, readNothing)
  const hydrated = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
  const [preferencesOpen, setPreferencesOpen] = useState(false)
  const consent = useMemo(() => parseConsent(raw, cookieRegistryVersion), [raw])

  const save = useCallback(
    (categories: GrantedCategory[]) => {
      const withdrawn = (consent?.categories ?? []).filter((c) => !categories.includes(c))
      for (const assignment of expireCookieStrings(
        document.cookie,
        cookiePrefixesFor(withdrawn),
        location.hostname,
      )) {
        document.cookie = assignment
      }
      document.cookie = consentCookieString(
        { version: cookieRegistryVersion, categories, timestamp: new Date().toISOString() },
        location.protocol === 'https:',
      )
      for (const listener of listeners) listener()
    },
    [consent],
  )

  const value = useMemo<ConsentContextValue>(
    () => ({
      consent,
      has: (category) => consent?.categories.includes(category) ?? false,
      save,
      openPreferences: () => setPreferencesOpen(true),
    }),
    [consent, save],
  )

  return (
    <ConsentContext.Provider value={value}>
      {children}
      {hydrated && !consent && requiresConsent() ? (
        <CookieBanner
          cookiePolicyHref={cookiePolicyHref}
          onSave={save}
          onSettings={() => setPreferencesOpen(true)}
        />
      ) : null}
      <PreferencesDialog
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        granted={consent?.categories ?? []}
        cookiePolicyHref={cookiePolicyHref}
        onSave={save}
      />
    </ConsentContext.Provider>
  )
}
