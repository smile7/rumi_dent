/*
 * Client fonts (DESIGN-SYSTEM §3). Every family must ship the Cyrillic subset.
 * Rumi Dent: M PLUS Rounded 1c (playful display) + Onest (clean body).
 */
import { M_PLUS_Rounded_1c, Onest } from 'next/font/google'

export const displayFont = M_PLUS_Rounded_1c({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  weight: ['500', '700', '800'],
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