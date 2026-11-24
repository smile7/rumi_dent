/*
 * Client fonts (DESIGN-SYSTEM §3). Every family must ship the Cyrillic subset.
 * Rumi Dent: rounded, friendly display face + neutral body. Alternatives are compared in /styleguide.
 */
import { Nunito, Onest } from 'next/font/google'

export const displayFont = Nunito({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-display-family',
  adjustFontFallback: true,
  preload: false,
})

export const bodyFont = Onest({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-body-family',
  adjustFontFallback: true,
})

/** Class names that define `--font-display-family` / `--font-body-family` on `<html>`. */
export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`
