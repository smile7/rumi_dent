/** Generated query results and row types derived from them. The only importer of `sanity.types`. */
import type {
  AnnouncementQueryResult,
  ArticleBySlugQueryResult,
  ArticlesQueryResult,
  ContactFormSettingsQueryResult,
  FaqQueryResult,
  GalleryQueryResult,
  LegalPageQueryResult,
  NavigationQueryResult,
  PageByKeyQueryResult,
  PageBySlugQueryResult,
  ServiceBySlugQueryResult,
  ServicesQueryResult,
  SiteSettingsQueryResult,
  SitemapQueryResult,
  StaticSlugsQueryResult,
  TeamQueryResult,
  TestimonialsQueryResult,
  TranslationsQueryResult,
} from '../../../../sanity.types'

export type {
  AnnouncementQueryResult,
  ArticleBySlugQueryResult,
  ArticlesQueryResult,
  ContactFormSettingsQueryResult,
  FaqQueryResult,
  GalleryQueryResult,
  LegalPageQueryResult,
  NavigationQueryResult,
  PageByKeyQueryResult,
  PageBySlugQueryResult,
  ServiceBySlugQueryResult,
  ServicesQueryResult,
  SiteSettingsQueryResult,
  SitemapQueryResult,
  StaticSlugsQueryResult,
  TeamQueryResult,
  TestimonialsQueryResult,
  TranslationsQueryResult,
}

export type TeamMemberQueryRow = TeamQueryResult[number]
export type FaqItemQueryRow = FaqQueryResult[number]
export type GalleryItemQueryRow = GalleryQueryResult[number]
export type TestimonialQueryRow = TestimonialsQueryResult[number]
export type ServiceSummaryQueryRow = ServicesQueryResult[number]
export type ArticleSummaryQueryRow = ArticlesQueryResult['items'][number]

export type PageQueryRow = NonNullable<PageByKeyQueryResult>
export type SectionQueryRow = NonNullable<PageQueryRow['sections']>[number]
export type ServiceQueryRow = NonNullable<ServiceBySlugQueryResult>
export type ArticleQueryRow = NonNullable<ArticleBySlugQueryResult>
export type LegalPageQueryRow = NonNullable<LegalPageQueryResult>

export type SiteSettingsQueryRow = NonNullable<SiteSettingsQueryResult>
export type NavigationQueryRow = NonNullable<NavigationQueryResult>
export type AnnouncementQueryRow = NonNullable<AnnouncementQueryResult>
