import type { Href } from '@/lib/i18n/translations'

export type BlogPageParam =
  | { kind: 'page'; page: number }
  /** Page 1 lives at `/blog` only. */
  | { kind: 'redirect' }
  | { kind: 'notFound' }

/** `/blog/page/[n]`: `n` must be a plain integer from 2 to `pages`; `1` redirects to `/blog`. */
export function resolveBlogPage(n: string, pages: number): BlogPageParam {
  if (!/^[1-9]\d*$/.test(n)) return { kind: 'notFound' }
  const page = Number(n)
  if (page === 1) return { kind: 'redirect' }
  return page <= pages ? { kind: 'page', page } : { kind: 'notFound' }
}

export function blogPageHref(page: number): Href {
  return page <= 1 ? '/blog' : { pathname: '/blog/page/[n]', params: { n: String(page) } }
}

/** Newer (`prev`) and older (`next`) list pages around `page`, when they exist. */
export function adjacentBlogPages(page: number, pages: number): { prev?: Href; next?: Href } {
  return {
    ...(page > 1 ? { prev: blogPageHref(page - 1) } : {}),
    ...(page < pages ? { next: blogPageHref(page + 1) } : {}),
  }
}
