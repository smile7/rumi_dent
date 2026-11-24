import { stegaClean } from 'next-sanity'

/**
 * Content with Visual Editing markers removed (deep). In draft mode text fields carry invisible
 * stega characters; metadata, JSON-LD and anything compared in code must go through this.
 * A no-op on published content. Kept free of `server-only` so `src/lib/seo` can unit-test with it.
 */
export const withoutStega = <T>(value: T): T => stegaClean(value) as T
