import { withoutStega } from '@/lib/content/stega'

/**
 * Serializes structured data for a `<script type="application/ld+json">`: stega markers are
 * stripped (draft mode) and `<` is escaped so CMS text can't close the script element.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(withoutStega(data)).replace(/</g, '\\u003c')
}
