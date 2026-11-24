import { defineEnableDraftMode } from 'next-sanity/draft-mode'

import { client } from '@/lib/content/sanity/client'
import { readToken } from '@/lib/content/sanity/token'

/**
 * Called by the Presentation tool with a signed secret; validates it, sets the draft cookie.
 * The token is read per request, so builds without it (CI) still succeed.
 */
export function GET(request: Request) {
  return defineEnableDraftMode({ client: client.withConfig({ token: readToken() }) }).GET(request)
}
