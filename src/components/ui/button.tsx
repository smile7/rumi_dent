import { Button as ButtonPrimitive } from '@base-ui/react/button'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2Icon, PhoneIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

// Focus ring comes from the global :focus-visible style (2px --color-focus, 2px offset).
const buttonVariants = cva(
  "group/button inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-button border-2 border-transparent font-body font-semibold whitespace-nowrap transition-[background-color,border-color,color,box-shadow,transform] duration-(--duration-fast) ease-standard select-none active:not-aria-[haspopup]:translate-y-px disabled:cursor-not-allowed disabled:opacity-50 aria-busy:cursor-progress data-disabled:cursor-not-allowed data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-fg shadow-md hover:bg-primary-hover hover:shadow-lg active:shadow-sm',
        secondary:
          'bg-accent text-accent-fg shadow-sm hover:bg-accent-hover hover:shadow-md active:shadow-sm',
        outline: 'border-primary bg-transparent text-primary hover:bg-tone-soft-bg',
        ghost: 'text-current hover:bg-muted aria-expanded:bg-muted',
        link: 'min-h-6 rounded-sm px-0 text-link underline decoration-2 underline-offset-4 hover:decoration-accent',
        call: 'bg-primary text-primary-fg tabular-nums shadow-sm hover:bg-primary-hover',
      },
      size: {
        sm: 'min-h-11 px-4 text-step--1',
        md: 'min-h-12 px-6 text-step-0',
        lg: 'min-h-14 px-8 text-step-1',
        icon: 'size-11',
      },
    },
    compoundVariants: [{ variant: 'link', className: 'min-h-6 px-0' }],
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Shows a spinner, sets `aria-busy` and blocks clicks while keeping focus on the button. */
    loading?: boolean
  }

/**
 * For links, put `cn(buttonVariants())` on a `Link` / `<a>` instead (`cn` resolves the border
 * classes the variants override). Base UI's Button adds
 * `role="button"` to non-button elements, so screen readers would announce a link as a button.
 * The `call` variant prepends a phone icon; pass the human-formatted number as children.
 */
function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      focusableWhenDisabled={loading}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    >
      {loading ? (
        <Loader2Icon aria-hidden="true" className="animate-spin" />
      ) : variant === 'call' ? (
        <PhoneIcon aria-hidden="true" strokeWidth={2} />
      ) : null}
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
