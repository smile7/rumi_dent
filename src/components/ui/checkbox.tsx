'use client'

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// 24px box; the ::after pseudo-element extends the hit area to ~44px without changing layout.
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer relative flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-sm border-2 border-input bg-surface transition-colors duration-(--duration-fast) after:absolute after:-inset-2.5 hover:border-fg-muted aria-invalid:border-danger data-checked:border-primary data-checked:bg-primary data-checked:text-primary-fg data-disabled:cursor-not-allowed data-disabled:opacity-50',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current [&>svg]:size-4"
      >
        <CheckIcon aria-hidden="true" strokeWidth={3} />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
