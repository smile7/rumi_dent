import { ContentImage } from '@/components/primitives/ContentImage'
import type { ImageAsset } from '@/lib/content'
import { cn } from '@/lib/utils'

import { Wordmark } from './Wordmark'

type SiteLogoProps = {
  name: string
  logo?: ImageAsset
  /** Optional short mark from site settings: shown instead of `logo` on small screens. */
  logoCompact?: ImageAsset
  /** Size of the text wordmark fallback. */
  variant?: 'full' | 'compact'
  /** Height of the uploaded logo; the width follows its aspect ratio. */
  className?: string
}

function LogoImage({
  image,
  name,
  className,
}: {
  image: ImageAsset
  name: string
  className?: string
}) {
  return (
    <ContentImage
      image={{ ...image, alt: name }}
      sizes="20rem"
      quality={85}
      className={cn('h-9 w-auto max-w-none', className)}
    />
  )
}

/** The client's uploaded logo (Sanity `siteSettings.logo`), else the text wordmark. */
export function SiteLogo({ name, logo, logoCompact, variant = 'full', className }: SiteLogoProps) {
  const single = logo ?? logoCompact
  if (!single) return <Wordmark name={name} variant={variant} />
  if (logo && logoCompact) {
    return (
      <>
        <LogoImage image={logoCompact} name={name} className={cn(className, 'md:hidden')} />
        <LogoImage image={logo} name={name} className={cn(className, 'hidden md:block')} />
      </>
    )
  }
  return <LogoImage image={single} name={name} className={className} />
}
