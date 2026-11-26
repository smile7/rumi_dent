/*
 * Client fonts (DESIGN-SYSTEM §3). Every family must ship the Cyrillic subset.
 * Rumi Dent: Noto Serif Display is the face the wordmark was drawn from (BRIEF §6.4), so headings
 * and the logo speak the same language; Manrope is the friendly, open body face (BRIEF §6.3).
 * The italic carries the emotional accent words in headings. Alternatives are compared in /styleguide.
 */
import { Manrope, Noto_Serif_Display } from 'next/font/google'

export const displayFont = Noto_Serif_Display({
  subsets: ['latin', 'cyrillic'],
  weight: 'variable',
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display-family',
  adjustFontFallback: true,
})

export const bodyFont = Manrope({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  variable: '--font-body-family',
  adjustFontFallback: true,
})

/** Class names that define `--font-display-family` / `--font-body-family` on `<html>`. */
export const fontVariables = `${displayFont.variable} ${bodyFont.variable}`
