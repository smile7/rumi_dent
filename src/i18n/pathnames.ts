import type { Locale } from '@/config/i18n'

/**
 * Internal pathname → public pathname per locale (ARCHITECTURE §7.2).
 * A plain string means "the same in every locale". Localized entries must list every locale,
 * so adding a locale to `src/config/i18n.ts` makes TypeScript point at each missing slug.
 * Changing a public slug after launch needs a redirect (SEO.md §9).
 */
export const pathnames = {
  '/': '/',
  '/services': { bg: '/uslugi', en: '/services' },
  '/services/[slug]': { bg: '/uslugi/[slug]', en: '/services/[slug]' },
  '/about': { bg: '/za-nas', en: '/about' },
  '/gallery': { bg: '/galeriya', en: '/gallery' },
  '/blog': '/blog',
  '/blog/page/[n]': { bg: '/blog/stranica/[n]', en: '/blog/page/[n]' },
  '/blog/[slug]': '/blog/[slug]',
  '/contact': { bg: '/kontakti', en: '/contact' },
  '/legal/[slug]': { bg: '/pravna-informaciya/[slug]', en: '/legal/[slug]' },
  '/styleguide': '/styleguide',
  '/[slug]': '/[slug]',
} as const satisfies Record<string, string | Record<Locale, string>>

export type InternalPathname = keyof typeof pathnames

/** CMS `page.pageKey` → its internal pathname (the content mappers and the Presentation resolver). */
export const systemPathnames = {
  home: '/',
  services: '/services',
  about: '/about',
  gallery: '/gallery',
  blog: '/blog',
  contact: '/contact',
} as const satisfies Record<string, InternalPathname>
