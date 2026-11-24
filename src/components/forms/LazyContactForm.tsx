'use client'

import dynamic from 'next/dynamic'

/**
 * The section registry puts every section in every page's module graph. Through `dynamic()` the
 * form (zod, react-hook-form, Turnstile) still renders on the server, but its JS only loads on
 * pages that show it.
 */
export const LazyContactForm = dynamic(() =>
  import('./ContactForm').then((mod) => mod.ContactForm),
)
