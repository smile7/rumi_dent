'use client'

import { PortableText, type PortableTextComponents } from '@portabletext/react'
import { useTranslations } from 'next-intl'
import NextLink from 'next/link'
import type { ReactNode } from 'react'

import { CookieTable } from '@/components/consent/CookieTable'
import { ProcessorsList } from '@/components/consent/ProcessorsList'
import { ContentImage } from '@/components/primitives/ContentImage'
import { Heading, type HeadingLevel, type HeadingSize } from '@/components/primitives/Heading'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { headingAnchor } from './anchors'
import type {
  RichTextCalloutBlock,
  RichTextCtaBlock,
  RichTextGeneratedBlock,
  RichTextImageBlock,
  RichTextLinkMark,
} from './sanity/mappers/shared'
import type { RichTextValue } from './types'

const levels: HeadingLevel[] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6']

/** Visual size per CMS heading block — below page `h1` (`step-4`/`step-5`). */
const cmsHeadingSize: Record<2 | 3 | 4, HeadingSize> = {
  2: 'step-3',
  3: 'step-2',
  4: 'step-1',
}

/** CMS h2 → h(2 + offset), never above h6. The page owns the h1. */
const shift = (level: number, offset: number) =>
  levels[Math.min(levels.length, Math.max(2, level + offset)) - 1]!

function ExternalLink({ value, children }: { value: RichTextLinkMark; children: ReactNode }) {
  const t = useTranslations('RichText')
  return (
    <a
      href={value.href}
      {...(value.newTab ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {value.newTab ? <span className="sr-only"> {t('opensInNewTab')}</span> : null}
    </a>
  )
}

function components(headingOffset: number, anchorHeadings: boolean): PortableTextComponents {
  const heading = (level: number) =>
    function RichTextHeading({
      children,
      value,
    }: {
      children?: ReactNode
      value: { _key?: string }
    }) {
      const cmsSize = level >= 2 && level <= 4 ? cmsHeadingSize[level as 2 | 3 | 4] : undefined
      return (
        <Heading
          as={shift(level, headingOffset)}
          size={cmsSize}
          id={anchorHeadings && value._key ? headingAnchor(value._key) : undefined}
        >
          {children}
        </Heading>
      )
    }
  return {
    block: { h2: heading(2), h3: heading(3), h4: heading(4) },
    marks: {
      link: ({ value, children }: { value?: RichTextLinkMark; children: ReactNode }) => {
        if (!value) return <>{children}</>
        // Internal hrefs are already localized by the content layer (`getPathname`), so they go
        // through next/link; next-intl's Link only accepts internal pathnames.
        return value.external || !value.href.startsWith('/') ? (
          <ExternalLink value={value}>{children}</ExternalLink>
        ) : (
          <NextLink href={value.href}>{children}</NextLink>
        )
      },
    },
    types: {
      image: ({ value }: { value: RichTextImageBlock }) => (
        <figure>
          <ContentImage image={value.image} sizes="(min-width: 768px) 65ch, 100vw" />
          {value.caption ? <figcaption>{value.caption}</figcaption> : null}
        </figure>
      ),
      callout: ({ value }: { value: RichTextCalloutBlock }) => (
        <aside
          className={cn(
            'not-prose rounded-card border-s-4 p-4 text-pretty',
            value.tone === 'warning'
              ? 'border-warning bg-surface-muted'
              : 'border-primary bg-tone-soft-bg',
          )}
        >
          {value.text}
        </aside>
      ),
      cookieTable: ({ value }: { value: RichTextGeneratedBlock }) => (
        <CookieTable caption={value.caption} />
      ),
      processorsList: ({ value }: { value: RichTextGeneratedBlock }) => (
        <ProcessorsList caption={value.caption} />
      ),
      cta: ({ value }: { value: RichTextCtaBlock }) => {
        const link = value.cta.link
        if (!link) return null
        const variant = value.cta.style
        return (
          <p className="not-prose">
            {link.external ? (
              <a href={link.href} className={cn(buttonVariants({ variant }))}>
                {link.label}
              </a>
            ) : (
              <NextLink href={link.href} className={cn(buttonVariants({ variant }))}>
                {link.label}
              </NextLink>
            )}
          </p>
        )
      },
    },
  }
}

type RichTextProps = {
  value: RichTextValue
  /** Levels to push CMS headings down, e.g. 1 when the body sits under a section h2. */
  headingOffset?: number
  /** Give headings stable ids (for an in-page table of contents, e.g. `LegalPage.toc`). */
  anchorHeadings?: boolean
}

/** Renders content-layer rich text. Wrap it in `<Prose>` for long-form typography. */
export function RichText({ value, headingOffset = 0, anchorHeadings = false }: RichTextProps) {
  return (
    <PortableText
      value={value as unknown as Parameters<typeof PortableText>[0]['value']}
      components={components(headingOffset, anchorHeadings)}
    />
  )
}
