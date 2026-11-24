import 'server-only'

import { readServerEnv } from '@/env.server'

/** Viewer token for draft mode. Read per call so the Worker uses the bound secret. */
export function readToken(): string {
  return readServerEnv('SANITY_API_READ_TOKEN').SANITY_API_READ_TOKEN
}
