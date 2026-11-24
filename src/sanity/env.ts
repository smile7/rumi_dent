import { readPublicEnv } from '../env'

const { NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET } = readPublicEnv(
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
  'NEXT_PUBLIC_SANITY_DATASET',
)

export const projectId = NEXT_PUBLIC_SANITY_PROJECT_ID
export const dataset = NEXT_PUBLIC_SANITY_DATASET

/** Bump deliberately after reading the API changelog; never use "today". */
export const apiVersion = '2026-11-01'

/** Must match `src/app/admin` and the `/admin/:path+` rewrite in `next.config.ts`. */
export const studioBasePath = '/admin'
