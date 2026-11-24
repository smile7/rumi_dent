/**
 * Per-client feature switches. Reserved features are designed (CONTENT-MODEL §6) but not built:
 * switching one on means building its schema, query and component first.
 */
export const features = {
  /** `section.priceList` + `priceItem`. */
  priceList: false,
  /** `section.beforeAfter`. */
  beforeAfter: false,
  /** `section.googleReviews` (Google Places, fetched at build). */
  googleReviews: false,
} as const satisfies Record<string, boolean>
