/** Decorative shapes for the hero band only (DESIGN-SYSTEM §6: SVG, aria-hidden, token-colored, ≤2 per viewport). */
export function HeroDecor() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute -end-32 -top-24 size-[min(36rem,90vw)] text-brand-300/55"
        viewBox="0 0 400 400"
        fill="currentColor"
      >
        <path d="M320 40c-72 8-128 56-152 120-28 76 4 168 88 196 52 18 108-4 144-48 44-54 56-132 24-196C388 72 352 36 320 40z" />
      </svg>
      <svg
        className="absolute -bottom-28 start-[-18%] size-[min(26rem,65vw)] text-accent-300/65"
        viewBox="0 0 320 320"
        fill="currentColor"
      >
        <path d="M48 200c40-88 128-136 208-112 52 16 88 64 92 120 4 64-32 120-96 136-72 20-152-24-204-88-24-32-20-40 0-56z" />
      </svg>
    </div>
  )
}