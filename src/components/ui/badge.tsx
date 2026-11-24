import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'group/badge inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-pill border border-transparent px-3 py-1 text-step--1 leading-tight font-semibold whitespace-nowrap [&>svg]:pointer-events-none [&>svg]:size-4',
  {
    variants: {
      variant: {
        soft: 'bg-tone-soft-bg text-fg',
        brand: 'bg-primary text-primary-fg',
        accent: 'bg-accent text-accent-fg',
        success: 'bg-success text-success-fg',
        warning: 'bg-warning text-warning-fg',
        danger: 'bg-danger text-danger-fg',
        outline: 'border-border-strong text-fg',
      },
    },
    defaultVariants: {
      variant: 'soft',
    },
  },
)

function Badge({
  className,
  variant = 'soft',
  render,
  ...props
}: useRender.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: 'span',
    props: mergeProps<'span'>({ className: cn(badgeVariants({ variant }), className) }, props),
    render,
    state: {
      slot: 'badge',
      variant,
    },
  })
}

export { Badge, badgeVariants }
