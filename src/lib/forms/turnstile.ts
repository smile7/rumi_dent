import 'server-only'

import { TURNSTILE_TEST_SECRET_KEY } from '@/env'

const SITEVERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

export type TurnstileCheck = {
  secret: string
  token: string
  remoteIp?: string
  /** Host the form was served from. Not checked with the test secret (it answers `example.com`). */
  hostname?: string
}

type SiteverifyResponse = { success: boolean; hostname?: string; 'error-codes'?: string[] }

/** Server-side Turnstile check. Returns `false` (never throws) on any failure. */
export async function verifyTurnstile({
  secret,
  token,
  remoteIp,
  hostname,
}: TurnstileCheck): Promise<boolean> {
  if (!token) return false
  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)
  try {
    const response = await fetch(SITEVERIFY_URL, { method: 'POST', body })
    if (!response.ok) return false
    const result = (await response.json()) as SiteverifyResponse
    if (!result.success) return false
    if (secret === TURNSTILE_TEST_SECRET_KEY || !hostname) return true
    return result.hostname === hostname
  } catch {
    return false
  }
}
