import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { Container } from '@/components/primitives/Container'
import { Heading } from '@/components/primitives/Heading'
import { Text } from '@/components/primitives/Text'
import { ComponentsDemo } from '@/components/styleguide/ComponentsDemo'
import { SectionsDemo } from '@/components/styleguide/SectionsDemo'
import { MotionDemo } from '@/components/styleguide/MotionDemo'
import { PaletteDemo } from '@/components/styleguide/PaletteDemo'
import { ScalesDemo } from '@/components/styleguide/ScalesDemo'
import { TypeDemo } from '@/components/styleguide/TypeDemo'
import { locales, type Locale } from '@/config/i18n'
import { hasLocale } from 'next-intl'
import { readPublicEnv } from '@/env'

export const metadata: Metadata = {
  title: 'Styleguide',
  robots: { index: false, follow: false },
}

/** Internal sign-off surface. 404 unless NEXT_PUBLIC_ENABLE_STYLEGUIDE=true. */
export default async function StyleguidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const { NEXT_PUBLIC_ENABLE_STYLEGUIDE } = readPublicEnv('NEXT_PUBLIC_ENABLE_STYLEGUIDE')
  if (!NEXT_PUBLIC_ENABLE_STYLEGUIDE) notFound()

  return (
    <>
      <Container className="pt-12">
        <Heading as="h1" size="step-4">
          Styleguide
        </Heading>
        <Text tone="muted" className="mt-2 max-w-(--container-prose)">
          Tokens, type, components, sections and motion for review.
        </Text>
      </Container>
      <PaletteDemo />
      <TypeDemo />
      <ScalesDemo />
      <ComponentsDemo />
      <MotionDemo />
      <SectionsDemo locale={hasLocale(locales, locale) ? (locale as Locale) : 'bg'} />
    </>
  )
}
