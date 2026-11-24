import { describe, expect, it } from 'vitest'

import { adjacentBlogPages, blogPageHref, resolveBlogPage } from './pagination'

describe('resolveBlogPage', () => {
  it('accepts pages 2…N', () => {
    expect(resolveBlogPage('2', 3)).toEqual({ kind: 'page', page: 2 })
    expect(resolveBlogPage('3', 3)).toEqual({ kind: 'page', page: 3 })
  })

  it('redirects page 1 to /blog', () => {
    expect(resolveBlogPage('1', 3)).toEqual({ kind: 'redirect' })
  })

  it('is a 404 out of range or for anything that is not a plain page number', () => {
    for (const n of ['4', '0', '-1', '02', '2.5', 'abc', '']) {
      expect(resolveBlogPage(n, 3)).toEqual({ kind: 'notFound' })
    }
    expect(resolveBlogPage('2', 1)).toEqual({ kind: 'notFound' })
  })
})

describe('blog page links', () => {
  it('links page 1 to /blog and later pages to /blog/page/[n]', () => {
    expect(blogPageHref(1)).toBe('/blog')
    expect(blogPageHref(2)).toEqual({ pathname: '/blog/page/[n]', params: { n: '2' } })
  })

  it('has prev/next only where a page exists', () => {
    expect(adjacentBlogPages(1, 1)).toEqual({})
    expect(adjacentBlogPages(1, 3)).toEqual({ next: blogPageHref(2) })
    expect(adjacentBlogPages(2, 3)).toEqual({ prev: '/blog', next: blogPageHref(3) })
    expect(adjacentBlogPages(3, 3)).toEqual({ prev: blogPageHref(2) })
  })
})
