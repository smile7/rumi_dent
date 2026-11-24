export type Oklch = { l: number; c: number; h: number }

/** Reads every `--name: value;` declaration from a CSS string (later declarations win). */
export function parseCustomProperties(css: string): Map<string, string> {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '')
  const props = new Map<string, string>()
  for (const match of withoutComments.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match
    if (name && value) props.set(name, value.trim())
  }
  return props
}

/** Follows `var(--x)` references until a literal value is reached. */
export function resolveValue(
  props: Map<string, string>,
  name: string,
  seen = new Set<string>(),
): string {
  if (seen.has(name)) throw new Error(`Circular reference while resolving --${name}`)
  seen.add(name)
  const value = props.get(name)
  if (value === undefined) throw new Error(`Token --${name} is not defined`)
  const reference = /^var\(--([\w-]+)\)$/.exec(value)
  return reference?.[1] ? resolveValue(props, reference[1], seen) : value
}

export function parseOklch(value: string): Oklch {
  const match = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value)
  if (!match) throw new Error(`Expected an opaque oklch(L C H) color, got "${value}"`)
  const [, l = '0', percent, c = '0', h = '0'] = match
  return { l: percent ? Number(l) / 100 : Number(l), c: Number(c), h: Number(h) }
}

/** OKLCH → linear sRGB (Björn Ottosson's OKLab matrices), clipped to the sRGB gamut. */
export function oklchToLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const hue = (h * Math.PI) / 180
  const a = c * Math.cos(hue)
  const b = c * Math.sin(hue)

  const l1 = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m1 = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s1 = (l - 0.0894841775 * a - 1.291485548 * b) ** 3

  const clip = (x: number) => Math.min(1, Math.max(0, x))
  return [
    clip(4.0767416621 * l1 - 3.3077115913 * m1 + 0.2309699292 * s1),
    clip(-1.2684380046 * l1 + 2.6097574011 * m1 - 0.3413193965 * s1),
    clip(-0.0041960863 * l1 - 0.7034186147 * m1 + 1.707614701 * s1),
  ]
}

function luminanceFromLinear([r, g, b]: [number, number, number]): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

/** WCAG 2.x relative luminance from linear sRGB channels. */
export function relativeLuminance(color: Oklch): number {
  return luminanceFromLinear(oklchToLinearSrgb(color))
}

/** WCAG 2.x relative luminance from 8-bit sRGB channels (e.g. canvas pixel data). */
export function relativeLuminanceFromSrgb8([r, g, b]: [number, number, number]): number {
  const toLinear = (channel: number) => {
    const c = channel / 255
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  }
  return luminanceFromLinear([toLinear(r), toLinear(g), toLinear(b)])
}

export function ratioFromLuminance(la: number, lb: number): number {
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/** `#rrggbb` (gamma-encoded sRGB) for places that can't read CSS tokens: manifest, OG images. */
export function oklchToHex(color: Oklch): string {
  const encode = (x: number) => (x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055)
  return `#${oklchToLinearSrgb(color)
    .map((x) =>
      Math.round(encode(x) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`
}

export function contrastRatio(a: Oklch, b: Oklch): number {
  return ratioFromLuminance(relativeLuminance(a), relativeLuminance(b))
}
