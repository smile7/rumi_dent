import type { Announcement } from '@/lib/content'

export type BannerState = {
  startsAt: string
  endsAt?: string
  pages: Announcement['pages']
  /** `sessionStorage` key of this announcement revision. */
  storageKey: string
  /** Localized home path, e.g. `/bg`. */
  homePath: string
}

/** sessionStorage key: dismissing hides only this revision (ID + `_updatedAt`). */
export function dismissKey(announcement: Pick<Announcement, 'id' | 'updatedAt'>): string {
  return `announcement-dismissed:${announcement.id}:${announcement.updatedAt}`
}

/**
 * Whether the banner should be hidden right now. Self-contained on purpose (no imports, no
 * closures): it is also serialized into the inline script that hides the banner before first paint.
 */
export function isBannerHidden(
  state: BannerState,
  now: number,
  pathname: string,
  storage: Pick<Storage, 'getItem'> | null,
): boolean {
  if (state.pages === 'home' && pathname !== state.homePath) return true
  if (now < Date.parse(state.startsAt)) return true
  if (state.endsAt && now >= Date.parse(state.endsAt)) return true
  try {
    return storage?.getItem(state.storageKey) === '1'
  } catch {
    return false
  }
}

/** Inline script for the banner element `id`: runs during HTML parsing, so a hidden banner never paints. */
export function bannerScript(id: string, state: BannerState): string {
  return `(function(){try{var e=document.getElementById(${JSON.stringify(id)});var s=null;try{s=window.sessionStorage}catch(_){}if(e)e.hidden=(${isBannerHidden.toString()})(${JSON.stringify(state)},Date.now(),location.pathname,s)}catch(_){}})()`
}
