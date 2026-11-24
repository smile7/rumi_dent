/*
 * Candidate font pairings for client sign-off (T01.2). Only /styleguide imports this module,
 * so these files never load on public pages. Delete the losers once a pairing is chosen.
 */
import { Comfortaa, Golos_Text, M_PLUS_Rounded_1c, Manrope } from 'next/font/google'

const mPlusRounded = M_PLUS_Rounded_1c({
  weight: ['700', '800'],
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
  preload: false,
})

const manrope = Manrope({ subsets: ['latin', 'cyrillic'], display: 'swap', preload: false })

const comfortaa = Comfortaa({ subsets: ['latin', 'cyrillic'], display: 'swap', preload: false })

const golosText = Golos_Text({ subsets: ['latin', 'cyrillic'], display: 'swap', preload: false })

export type FontPairing = {
  name: string
  /** `undefined` uses the site's current `font-display` / `font-body`. */
  displayClass?: string
  bodyClass?: string
}

export const fontPairings: FontPairing[] = [
  { name: 'Nunito + Onest (current)' },
  {
    name: 'M PLUS Rounded 1c + Manrope',
    displayClass: mPlusRounded.className,
    bodyClass: manrope.className,
  },
  {
    name: 'Comfortaa + Golos Text',
    displayClass: comfortaa.className,
    bodyClass: golosText.className,
  },
]
