'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

import type { Href, PageTranslations as Translations } from '@/lib/i18n/translations'

export type PageTranslationsValue = { translations: Translations; fallback: Href }

type Store = {
  value: PageTranslationsValue | null
  set: (value: PageTranslationsValue | null) => void
}

const PageTranslationsContext = createContext<Store | null>(null)

/**
 * The layout's header can't see which CMS document the page renders, so CMS pages publish their
 * translations here (`SetPageTranslations`) and the language switcher reads them.
 */
export function PageTranslationsProvider({ children }: { children: ReactNode }) {
  const [value, set] = useState<PageTranslationsValue | null>(null)
  return <PageTranslationsContext value={{ value, set }}>{children}</PageTranslationsContext>
}

export function usePageTranslations(): PageTranslationsValue | null {
  return useContext(PageTranslationsContext)?.value ?? null
}

/** Rendered by CMS pages; renders nothing. */
export function SetPageTranslations({ translations, fallback }: PageTranslationsValue) {
  const set = useContext(PageTranslationsContext)?.set
  const key = JSON.stringify([translations, fallback])
  useEffect(() => {
    if (!set) return
    const [t, f] = JSON.parse(key) as [Translations, Href]
    set({ translations: t, fallback: f })
    return () => set(null)
  }, [set, key])
  return null
}
