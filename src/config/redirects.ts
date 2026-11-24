/**
 * Permanent (308) redirects, mostly old-site URLs → new pages after a migration. `source` is a
 * Next path pattern (`/old/:slug`); `destination` is a full localized path (no locale is added).
 * `www` ↔ apex is a Cloudflare redirect rule, not a list entry (NEW-CLIENT).
 */
export type SiteRedirect = {
  source: string
  destination: string
}

export const siteRedirects: SiteRedirect[] = []

export function toNextRedirects(list: SiteRedirect[]) {
  return list.map(({ source, destination }) => ({ source, destination, permanent: true as const }))
}
