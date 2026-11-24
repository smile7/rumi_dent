import createMiddleware from 'next-intl/middleware'

import { routing } from './i18n/routing'

export default createMiddleware(routing)

export const config = {
  // Skips API routes, the Studio, Next internals and any path with a dot
  // (static files, llms.txt, sitemap.xml, robots.txt).
  matcher: '/((?!api|admin|_next|_vercel|.*\\..*).*)',
}
