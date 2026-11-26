/**
 * CMS-agnostic domain models (content-layer rule). Pages and components only see these.
 * Nothing here may mention Sanity shapes (`_type`, `_ref`, Portable Text internals).
 */
import type { Locale } from '@/config/i18n'
import type { ContentIcon } from '@/config/icons'
import type { Href, PageTranslations } from '@/lib/i18n/translations'

/** Locale → internal href of the same document in that locale. Missing = not translated. */
export type Translations = PageTranslations

export type ImageAsset = {
  /** CDN URL without size params; the image loader adds width, quality and format. */
  src: string
  width: number
  height: number
  /** Empty string for decorative images. */
  alt: string
  lqip?: string
  /** Focal point in % (0–100), for `object-position`. */
  focalPoint?: { x: number; y: number }
}

/** Portable Text, opaque on purpose: render it only with `<RichText>`. */
export type RichTextValue = readonly unknown[] & { readonly __brand: 'RichTextValue' }

export type LinkTarget = {
  /** Localized path (`/bg/uslugi/x`), absolute URL, `tel:`, `mailto:` or `#anchor`. */
  href: string
  external: boolean
  label: string
  newTab?: boolean
}

export type CtaAction = 'link' | 'call' | 'booking' | 'directions'
export type CtaStyle = 'primary' | 'secondary' | 'outline' | 'ghost'

/** `call` / `booking` / `directions` are resolved from `SiteSettings` by the renderer. */
export type Cta = {
  label: string
  action: CtaAction
  style: CtaStyle
  /** Only for `action: 'link'`. */
  link: LinkTarget | null
}

export type Seo = {
  title?: string
  description?: string
  ogImage?: ImageAsset
  noIndex: boolean
  canonicalOverride?: string
}

export type Weekday = 'Mo' | 'Tu' | 'We' | 'Th' | 'Fr' | 'Sa' | 'Su'

export type OpeningHours = { days: Weekday[]; opens: string; closes: string; note?: string }

export type SpecialHours = {
  label?: string
  date: string
  endDate?: string
  closed: boolean
  opens?: string
  closes?: string
}

export type Phone = { key: 'primary' | 'secondary'; e164: string; display: string; label?: string }

export type SocialPlatform =
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'viber'
  | 'whatsapp'
  | 'googleBusiness'
  | 'other'

export type BusinessType =
  | 'Dentist'
  | 'MedicalClinic'
  | 'Physician'
  | 'LocalBusiness'
  | 'ProfessionalService'
  | 'HealthAndBeautyBusiness'
  | 'Store'

export type Address = {
  street?: string
  city?: string
  postalCode?: string
  region?: string
  countryCode: string
}

export type SiteSettings = {
  brandName: string
  tagline?: string
  logo?: ImageAsset
  logoCompact?: ImageAsset
  businessType: BusinessType
  areaServed?: string
  priceRange?: string
  address: Address
  geo?: { lat: number; lng: number }
  phones: Phone[]
  email?: string
  mapEmbedUrl?: string
  mapPlaceholder?: ImageAsset
  googleBusinessUrl?: string
  openingHours: OpeningHours[]
  specialHours: SpecialHours[]
  timeZone: string
  socials: { platform: SocialPlatform; url: string; label?: string }[]
  booking: { mode: 'phone' | 'externalUrl'; url?: string; label?: string; note?: string }
  contactForm: { subjectPrefix?: string; successMessage?: string }
  legal: {
    legalName?: string
    uic?: string
    vatNumber?: string
    registeredAddress?: Address
    representative?: string
    /** Data protection contact (T09.4); the footer falls back to `email`. */
    privacyEmail?: string
    professionalBody?: string
    registration?: string
    supervisoryAuthority?: string
  }
  legalLinks: LinkTarget[]
  /** Localized path of the privacy policy (`legalPage` of kind `privacy`), for the contact form. */
  privacyHref?: string
  /** Localized path of the cookie policy (`legalPage` of kind `cookies`), for the preferences dialog. */
  cookiePolicyHref?: string
  footerNote?: string
  seoDefaults: {
    titleTemplate?: string
    description?: string
    ogImage?: ImageAsset
    googleVerification?: string
    bingVerification?: string
  }
}

/** What the contact Server Action reads at submit time (published content only). */
export type ContactFormSettings = { brandName?: string; recipient?: string; subjectPrefix?: string }

export type NavItem = LinkTarget & { children: LinkTarget[] }

export type Navigation = {
  header: NavItem[]
  headerCta: Cta | null
  footerColumns: { title: string; links: LinkTarget[] }[]
  mobileActionBar: {
    showDirections: boolean
    secondaryAction: 'none' | 'booking' | 'viber' | 'whatsapp' | 'email'
  }
}

export type Announcement = {
  id: string
  /** Revision (ISO date-time); a dismissal only hides this revision. */
  updatedAt: string
  message: string
  link: Cta | null
  tone: 'info' | 'promo' | 'warning'
  startsAt: string
  endsAt?: string
  dismissible: boolean
  pages: 'all' | 'home'
}

export type ServiceCategory = {
  id: string
  title: string
  slug?: string
  description?: string
  audience: 'children' | 'adults' | 'everyone'
  tone: 'soft' | 'brand' | 'accent'
}

export type TeamMember = {
  id: string
  name: string
  nameLatin?: string
  honorific?: string
  role: string
  specialties: string[]
  bioShort: string
  bio?: RichTextValue
  photo?: ImageAsset
  featured: boolean
  credentials: { label: string; year?: number }[]
  sameAs: string[]
  yearsExperience?: number
}

export type FaqItem = {
  id: string
  question: string
  answer: RichTextValue
  category?: 'general' | 'firstVisit' | 'children' | 'adults' | 'prices' | 'emergencies'
}

export type GalleryAlbum = 'clinic' | 'team' | 'patients' | 'events' | 'other'

export type GalleryItem = { id: string; image: ImageAsset; caption?: string; album: GalleryAlbum }

export type Testimonial = {
  id: string
  quote: string
  authorName: string
  rating?: number
  date?: string
  featured: boolean
}

/** A service as a tile / list item. */
export type ServiceSummary = {
  id: string
  title: string
  slug: string
  /** Detail page when `hasDetailPage`, otherwise the services page anchor. */
  href: string
  icon?: ContentIcon
  image?: ImageAsset
  teaser: string
  summary: RichTextValue
  durationNote?: string
  priceNote?: string
  hasDetailPage: boolean
  category: ServiceCategory | null
}

export type Service = ServiceSummary & {
  body?: RichTextValue
  faq: FaqItem[]
  doctors: TeamMember[]
  seo: Seo
  translations: Translations
}

export type ArticleSummary = {
  id: string
  title: string
  slug: string
  href: string
  excerpt: string
  cover?: ImageAsset
  publishedAt: string
  updatedAt?: string
}

export type Article = ArticleSummary & {
  body: RichTextValue
  readingTimeMinutes: number
  author: TeamMember | null
  reviewedBy: TeamMember | null
  related: ArticleSummary[]
  seo: Seo
  translations: Translations
}

export type LegalPage = {
  id: string
  kind: 'privacy' | 'cookies' | 'gdpr' | 'terms' | 'other'
  title: string
  slug: string
  body: RichTextValue
  lastUpdated?: string
  translations: Translations
  /** The first paragraph, shortened to ~160 characters: the meta description. */
  excerpt?: string
  /** The body's h2s; `id` matches the anchor `<RichText anchorHeadings>` renders. */
  toc: { id: string; text: string }[]
  /** Unreplaced template fields (`[[…]]`) in the title or body. Must be empty in production. */
  placeholders: string[]
}

// --- Sections ------------------------------------------------------------------------------

export type SectionTone = 'base' | 'soft' | 'brand' | 'accent' | 'inverse'
export type SectionSpacing = 'default' | 'compact' | 'none'

type SectionBase = {
  key: string
  tone: SectionTone
  spacing: SectionSpacing
  anchorId?: string
}

export type HeroSection = SectionBase & {
  type: 'hero'
  heading: string
  subheading?: string
  ctas: Cta[]
  image?: ImageAsset
  variant: 'split' | 'cutout' | 'fullBleed'
  trustItems: { key: string; icon?: ContentIcon; text: string }[]
}

export type TextImageSection = SectionBase & {
  type: 'textImage'
  heading?: string
  body: RichTextValue
  image?: ImageAsset
  imagePosition: 'left' | 'right'
  cta: Cta | null
}

export type RichTextSection = SectionBase & {
  type: 'richText'
  heading?: string
  body: RichTextValue
  width: 'prose' | 'wide'
}

export type TileItem = {
  key: string
  title: string
  teaser?: string
  icon?: ContentIcon
  image?: ImageAsset
  body?: RichTextValue
  cta: Cta | null
  /** Deep-link id (`#slug`). */
  slug?: string
  /** `source: services` only: the services index filters tiles by it. */
  audience?: ServiceCategory['audience']
  /** `source: services` only: the tile links to the service's own page. */
  hasDetailPage?: boolean
}

export type TilesSection = SectionBase & {
  type: 'tiles'
  heading?: string
  intro?: string
  source: 'manual' | 'services'
  /** Manual tiles, or the services mapped to tiles. */
  items: TileItem[]
  allowMultiple: boolean
  density: 'comfortable' | 'compact'
  layout: 'grid' | 'orbit'
}

export type ProcessStepsSection = SectionBase & {
  type: 'processSteps'
  heading?: string
  intro?: string
  steps: { key: string; title: string; text?: string; icon?: ContentIcon }[]
  cta: Cta | null
  layout: 'cards' | 'compact'
}

export type FaqSection = SectionBase & {
  type: 'faq'
  heading?: string
  intro?: string
  items: FaqItem[]
  emitSchema: boolean
  layout: 'accordion' | 'split'
}

export type BlogTeaserSection = SectionBase & {
  type: 'blogTeaser'
  heading?: string
  articles: ArticleSummary[]
  layout: 'grid' | 'featured'
}

export type TestimonialsSection = SectionBase & {
  type: 'testimonials'
  heading?: string
  items: Testimonial[]
  showRating: boolean
}

export type TeamSection = SectionBase & {
  type: 'team'
  heading?: string
  intro?: string
  members: TeamMember[]
  layout: 'featuredFirst' | 'grid' | 'duo'
}

export type GallerySection = SectionBase & {
  type: 'gallery'
  heading?: string
  items: GalleryItem[]
  showLinkToGallery: boolean
}

export type ContactHoursSection = SectionBase & {
  type: 'contactHours'
  heading?: string
  showMap: boolean
  showForm: boolean
  note?: string
}

export type CtaBandSection = SectionBase & {
  type: 'ctaBand'
  heading: string
  text?: string
  ctas: Cta[]
}

export type Section =
  | HeroSection
  | TextImageSection
  | RichTextSection
  | TilesSection
  | ProcessStepsSection
  | FaqSection
  | BlogTeaserSection
  | TestimonialsSection
  | TeamSection
  | GallerySection
  | ContactHoursSection
  | CtaBandSection

export type SectionType = Section['type']

export type SystemPageKey = 'home' | 'services' | 'about' | 'gallery' | 'blog' | 'contact'

export type Page = {
  id: string
  pageKey?: SystemPageKey
  title: string
  slug?: string
  intro?: string
  sections: Section[]
  seo: Seo
  hideFromNav: boolean
  hideFromSitemap: boolean
  translations: Translations
}

/** One indexable URL for the sitemap. `translations` lists only alternates that are indexable too. */
export type SitemapEntry = {
  locale: Locale
  href: Href
  /** Localized path, e.g. `/bg/uslugi/plombi`. */
  path: string
  /** ISO date-time of the last publish. */
  lastModified: string
  translations: Translations
}
