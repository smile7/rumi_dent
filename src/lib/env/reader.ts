import type { z } from 'zod'

type EnvShape = Record<string, z.ZodType>
type RawEnv<Shape extends EnvShape> = { [K in keyof Shape]: string | undefined }
type EnvValues<Shape extends EnvShape, K extends keyof Shape> = { [P in K]: z.output<Shape[P]> }

/**
 * Builds a lazy, per-key env reader: only the requested keys are validated, so a page that needs
 * the site URL does not fail because an unrelated integration is not configured yet.
 */
export function createEnvReader<Shape extends EnvShape>(
  scope: string,
  shape: Shape,
  readRaw: () => RawEnv<Shape>,
) {
  return function readEnv<K extends keyof Shape & string>(...keys: K[]): EnvValues<Shape, K> {
    const raw = readRaw()
    const values: Partial<EnvValues<Shape, K>> = {}
    const problems: string[] = []

    for (const key of keys) {
      const input = raw[key] === '' ? undefined : raw[key]
      const parsed = shape[key]!.safeParse(input)
      if (parsed.success) {
        values[key] = parsed.data as z.output<Shape[K]>
      } else if (input === undefined) {
        problems.push(`  - ${key}: missing`)
      } else {
        problems.push(`  - ${key}: ${parsed.error.issues[0]?.message ?? 'invalid value'}`)
      }
    }

    if (problems.length > 0) {
      throw new Error(
        `Invalid ${scope} environment variables:\n${problems.join('\n')}\nSee .env.example for every variable and its purpose.`,
      )
    }
    return values as EnvValues<Shape, K>
  }
}
