/** Test fixtures shaped like the shared GROQ fragments. Test-only (imported by `*.test.ts`). */
import type { ImageInput, LinkInput, RouteDoc } from './shared'

/** Appends zero-width stega characters, like Sanity does to strings in draft mode. */
export const stega = (value: string) => `${value}${'\u200b\u200c\u200d\ufeff'.repeat(8)}`

/** Partial fixture typed as a generated query row. */
export const fixture = <T>(value: unknown) => value as T

export const imageRow = (overrides: Partial<ImageInput> = {}): ImageInput => ({
  url: 'https://cdn.sanity.io/images/p/d/abc-1200x800.jpg',
  width: 1200,
  height: 800,
  lqip: 'data:image/jpeg;base64,xyz',
  crop: null,
  hotspot: null,
  decorative: false,
  alt: 'Smiling child in the dental chair',
  ...overrides,
})

export const linkRow = (overrides: Partial<LinkInput> = {}): LinkInput => ({
  kind: 'internal',
  systemRoute: null,
  href: null,
  anchor: null,
  openInNewTab: null,
  internal: null,
  phone: null,
  email: null,
  ...overrides,
})

export const routeDoc = (overrides: Partial<RouteDoc> & { title?: string }) => ({
  _type: 'page' as const,
  title: 'Page',
  slug: null,
  pageKey: null,
  hasDetailPage: null,
  ...overrides,
})

export const blockRow = (
  text: string,
  markDefs: ({ _type: string; _key: string } & Partial<LinkInput>)[] = [],
  marks: string[] = [],
) => ({
  _type: 'block',
  _key: `b-${text.length}`,
  style: 'normal',
  markDefs,
  children: [{ _type: 'span', _key: 's0', text, marks }],
})
