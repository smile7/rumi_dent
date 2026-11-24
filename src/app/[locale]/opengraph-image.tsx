import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import { hasLocale } from 'next-intl'
import { ImageResponse } from 'next/og'

import brandColors from '@/config/brand-colors.json'
import { OG_IMAGE_SIZE } from '@/lib/content/image-loader'
import { getSiteSettings } from '@/lib/content'
import { withoutStega } from '@/lib/content/stega'
import { routing } from '@/i18n/routing'

// The sharing image for pages without a CMS image (SEO.md §5). Rendered at build time only:
// generating it per request would blow the Worker's CPU budget.
export const size = OG_IMAGE_SIZE
export const contentType = 'image/png'
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

const fontFile = (name: string) => readFile(join(process.cwd(), 'public/fonts', name))

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) throw new Error(`Unknown locale "${locale}"`)
  const [settings, latin, cyrillic] = await Promise.all([
    getSiteSettings(locale).then(withoutStega),
    fontFile('nunito-latin-800.ttf'),
    fontFile('nunito-cyrillic-800.ttf'),
  ])

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 96,
        background: brandColors.primary,
        color: brandColors.primaryFg,
        fontFamily: 'Nunito, NunitoCyrillic',
      }}
    >
      <div style={{ width: 120, height: 12, borderRadius: 6, background: brandColors.accent }} />
      <div style={{ marginTop: 48, fontSize: 96, lineHeight: 1.05, letterSpacing: -2 }}>
        {settings?.brandName}
      </div>
      {settings?.tagline ? (
        <div style={{ marginTop: 28, fontSize: 44, lineHeight: 1.25, opacity: 0.9 }}>
          {settings.tagline}
        </div>
      ) : null}
    </div>,
    {
      ...size,
      fonts: [
        { name: 'Nunito', data: latin, weight: 800, style: 'normal' },
        { name: 'NunitoCyrillic', data: cyrillic, weight: 800, style: 'normal' },
      ],
    },
  )
}
