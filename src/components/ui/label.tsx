import * as React from 'react'
import { cn } from '@/lib/utils'

function Label({ className, ...props }: React.ComponentProps<'label'>) {
  return (
    // eslint-disable-next-line jsx-a11y/label-has-associated-control -- generic primitive; callers pass htmlFor or nest the control (checked via labelComponents)
    <label
      data-slot="label"
      className={cn(
        'flex items-center gap-2 text-step--1 font-semibold text-fg select-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Label }
