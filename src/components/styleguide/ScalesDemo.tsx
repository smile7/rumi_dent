import { Heading } from '@/components/primitives/Heading'
import { DemoBlock } from './DemoBlock'

const spacingSteps = [1, 2, 3, 4, 6, 8, 10, 12, 16, 24]

const sectionSpacing = ['space-section-compact', 'space-section']

const radii = [
  'radius-sm',
  'radius-md',
  'radius-lg',
  'radius-xl',
  'radius-pill',
  'radius-button',
  'radius-field',
  'radius-card',
  'radius-tile',
  'radius-media',
]

const shadows = ['shadow-sm', 'shadow-md', 'shadow-lg']

function Label({ children }: { children: string }) {
  return <code className="text-step--1 text-fg-muted">{children}</code>
}

export function ScalesDemo() {
  return (
    <DemoBlock id="scales" title="Spacing, radius, shadow">
      <div className="flex flex-col gap-12">
        <div>
          <Heading as="h3" size="step-1" className="mb-4">
            Spacing (× --spacing = 0.25rem)
          </Heading>
          <ul className="flex flex-col gap-2">
            {spacingSteps.map((step) => (
              <li key={step} className="flex items-center gap-4">
                <span className="w-10 shrink-0">
                  <Label>{String(step)}</Label>
                </span>
                <span
                  className="h-4 rounded-sm bg-brand-300"
                  style={{ width: `calc(var(--spacing) * ${step})` }}
                />
              </li>
            ))}
          </ul>
          <ul className="mt-6 flex flex-col gap-3">
            {sectionSpacing.map((token) => (
              <li key={token} className="flex flex-col gap-1">
                <Label>{token}</Label>
                <span
                  className="h-4 max-w-full rounded-sm bg-accent-300"
                  style={{ width: `var(--${token})` }}
                />
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Heading as="h3" size="step-1" className="mb-4">
            Radius
          </Heading>
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            {radii.map((token) => (
              <li key={token} className="flex flex-col gap-2">
                <span
                  className="h-20 border-2 border-primary bg-brand-50"
                  style={{ borderRadius: `var(--${token})` }}
                />
                <Label>{token}</Label>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <Heading as="h3" size="step-1" className="mb-4">
            Shadow
          </Heading>
          <ul className="grid gap-6 sm:grid-cols-3">
            {shadows.map((token) => (
              <li key={token} className="flex flex-col gap-3">
                <span
                  className="h-24 rounded-card bg-surface"
                  style={{ boxShadow: `var(--${token})` }}
                />
                <Label>{token}</Label>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </DemoBlock>
  )
}
