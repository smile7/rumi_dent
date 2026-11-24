import * as React from 'react'
import { Input as InputPrimitive } from '@base-ui/react/input'
import { cn } from '@/lib/utils'

/** Shared field look for Input and Textarea. Text stays ≥ 16px so iOS does not zoom on focus. */
export const fieldClasses =
  'w-full min-w-0 rounded-field border-2 border-input bg-surface px-3.5 text-step-0 text-fg transition-colors duration-(--duration-fast) placeholder:text-fg-muted hover:border-fg-muted focus-visible:border-focus disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-fg-muted aria-invalid:border-danger'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        fieldClasses,
        'min-h-12 py-2 file:inline-flex file:border-0 file:bg-transparent file:font-semibold file:text-fg',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
