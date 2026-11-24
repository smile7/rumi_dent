import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { defaultLocale } from '@/config/i18n'
import { safeRedirectPath } from '@/lib/safe-redirect'

/** `?redirect=/bg/uslugi` → leaves draft mode and goes back to that page (same origin only). */
export async function GET(request: NextRequest) {
  ;(await draftMode()).disable()
  redirect(safeRedirectPath(request.nextUrl.searchParams.get('redirect'), `/${defaultLocale}`))
}
