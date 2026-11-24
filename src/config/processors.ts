import { currentCookieContext, type CookieContext } from './cookies'

/**
 * Services that process data for the site (LEGAL-GDPR §2, §9.1 point 4). The privacy policy's
 * `processorsList` block renders this list, so it follows the analytics setting automatically.
 * Names and purposes are messages under `Processors.items.<id>`.
 */
export type ProcessorEntry = {
  id:
    | 'cloudflare'
    | 'cloudflareAnalytics'
    | 'umami'
    | 'googleAnalytics'
    | 'resend'
    | 'sanity'
    | 'googleMaps'
    | 'emailProvider'
  enabledWhen?: (context: CookieContext) => boolean
}

export const processors: readonly ProcessorEntry[] = [
  { id: 'cloudflare' },
  {
    id: 'cloudflareAnalytics',
    enabledWhen: ({ analytics }) => analytics === 'cloudflare',
  },
  { id: 'umami', enabledWhen: ({ analytics }) => analytics === 'umami' },
  {
    id: 'googleAnalytics',
    enabledWhen: ({ analytics }) => analytics === 'ga4',
  },
  { id: 'resend' },
  { id: 'sanity' },
  { id: 'googleMaps' },
  { id: 'emailProvider' },
]

export function enabledProcessors(
  context: CookieContext = currentCookieContext(),
): ProcessorEntry[] {
  return processors.filter((entry) => entry.enabledWhen?.(context) ?? true)
}
