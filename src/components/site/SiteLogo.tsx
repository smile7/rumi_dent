'use client'

import { ContentImage } from '@/components/primitives/ContentImage'
import type { ImageAsset } from '@/lib/content/types'
import { cn } from '@/lib/utils'

import { Wordmark } from './Wordmark'

type SiteLogoProps = {
  brandName: string
  logo?: ImageAsset
  logoCompact?: ImageAsset
  className?: string
}

/**
 * CMS logo when set; otherwise text wordmark without the decorative arc.
 */
export function SiteLogo({ brandName, logo, logoCompact, className }: SiteLogoProps) {
  const compact = logoCompact ?? logo

  if (!logo) {
    return (
      <Wordmark
        name={brandName}
        variant="compact"
        accent={false}
        className={className}
      />
    )
  }

  return (
    <span className={cn('relative inline-flex h-9 w-auto items-center md:h-11', className)}>
      <ContentImage
        image={logo}
        sizes="(min-width: 768px) 12rem, 9rem"
        className="h-full w-auto max-w-40 object-contain object-left group-data-compact/header:hidden"
      />
      {compact ? (
        <ContentImage
          image={compact}
          sizes="(min-width: 768px) 10rem, 8rem"
          className="hidden h-full w-auto max-w-36 object-contain object-left group-data-compact/header:inline"
        />
      ) : null}
    </span>
  )
}