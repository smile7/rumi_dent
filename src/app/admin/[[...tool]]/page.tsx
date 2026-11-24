import { NextStudio } from 'next-sanity/studio'

import config from '../../../../sanity.config'

export { metadata, viewport } from 'next-sanity/studio'

// Prerender /admin once (deep links reach it via the rewrite in next.config.ts). Otherwise every
// Studio request renders on the Worker, above the Workers Free 10 ms CPU limit.
export const dynamic = 'force-static'
export const dynamicParams = false

export function generateStaticParams() {
  return [{ tool: [] }]
}

export default function StudioPage() {
  return <NextStudio config={config} />
}
