import type { HeroSection } from '@/lib/content'

import { fixtureImage } from './image'

const base = {
  tone: 'base' as const,
  spacing: 'default' as const,
  key: 'hero-fixture',
  ctas: [
    { label: 'Book', action: 'booking' as const, style: 'primary' as const, link: null },
    { label: 'Call', action: 'call' as const, style: 'secondary' as const, link: null },
  ],
  trustItems: [
    { key: 't1', icon: 'baby' as const, text: 'Children from age 1' },
    { key: 't2', icon: 'shield-check' as const, text: 'Gentle care' },
  ],
}

export const heroSplitBg: HeroSection = {
  ...base,
  type: 'hero',
  heading: 'Усмивки без страх',
  subheading: 'Детска и семейна дентална клиника.',
  image: fixtureImage,
  variant: 'split',
}

export const heroCutoutEn: HeroSection = {
  ...base,
  type: 'hero',
  heading: 'Fear-free smiles',
  subheading: 'A children’s and family dental clinic.',
  image: fixtureImage,
  variant: 'cutout',
}

export const heroFullBleedBg: HeroSection = {
  ...base,
  type: 'hero',
  heading: 'Грижа с усмивка',
  image: fixtureImage,
  variant: 'fullBleed',
  tone: 'inverse',
}