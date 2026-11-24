/**
 * A same-origin path to redirect to, or `fallback`. Rejects absolute URLs, protocol-relative
 * `//host` and backslash tricks (`/\host`), which browsers treat as another origin.
 */
export function safeRedirectPath(value: string | null | undefined, fallback = '/'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback
  }
  try {
    const base = 'http://same-origin.invalid'
    const url = new URL(value, base)
    return url.origin === base ? `${url.pathname}${url.search}${url.hash}` : fallback
  } catch {
    return fallback
  }
}
