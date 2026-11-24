import { createClient } from 'next-sanity'

import { readPublicEnv } from '@/env'
import { apiVersion, dataset, projectId } from '@/sanity/env'

const { NEXT_PUBLIC_SANITY_STUDIO_URL } = readPublicEnv('NEXT_PUBLIC_SANITY_STUDIO_URL')

/** Published, CDN-backed and tokenless. `sanityFetch` switches it to drafts per call. */
export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  perspective: 'published',
  stega: { enabled: false, studioUrl: NEXT_PUBLIC_SANITY_STUDIO_URL },
})
