import { Heading } from '@/components/primitives/Heading'
import { ContrastTable } from './ContrastTable'
import { DemoBlock } from './DemoBlock'

const scaleSteps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950']

const primitiveScales = [
  { name: 'brand', steps: scaleSteps },
  { name: 'accent', steps: scaleSteps },
  { name: 'neutral', steps: ['0', ...scaleSteps] },
]

const semanticTokens = [
  'color-bg',
  'color-surface',
  'color-surface-muted',
  'color-fg',
  'color-fg-muted',
  'color-border',
  'color-border-strong',
  'color-primary',
  'color-primary-hover',
  'color-accent',
  'color-accent-hover',
  'color-link',
  'color-focus',
  'color-focus-on-dark',
  'color-success',
  'color-warning',
  'color-danger',
  'color-tone-soft-bg',
  'color-tone-brand-bg',
  'color-tone-accent-bg',
  'color-tone-inverse-bg',
]

function Swatch({ token, label }: { token: string; label: string }) {
  return (
    <li className="flex min-w-0 flex-col gap-1.5">
      <span
        className="h-12 rounded-sm border border-border"
        style={{ background: `var(--${token})` }}
      />
      <code className="text-step--1 break-all text-fg-muted">{label}</code>
    </li>
  )
}

export function PaletteDemo() {
  return (
    <DemoBlock id="palette" title="Palette">
      <div className="flex flex-col gap-10">
        {primitiveScales.map((scale) => (
          <div key={scale.name}>
            <Heading as="h3" size="step-1" className="mb-4">
              {`Primitives: ${scale.name}`}
            </Heading>
            <ul className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-12">
              {scale.steps.map((step) => (
                <Swatch key={step} token={`color-${scale.name}-${step}`} label={step} />
              ))}
            </ul>
          </div>
        ))}
        <div>
          <Heading as="h3" size="step-1" className="mb-4">
            Semantic tokens
          </Heading>
          <ul className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
            {semanticTokens.map((token) => (
              <Swatch key={token} token={token} label={token.replace('color-', '')} />
            ))}
          </ul>
        </div>
        <ContrastTable />
      </div>
    </DemoBlock>
  )
}
