import { Accordion as AccordionPrimitive } from '@base-ui/react/accordion'
import { PlusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn('flex w-full flex-col', className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn('border-b border-border', className)}
      {...props}
    />
  )
}

// Base UI's Accordion.Header renders an <h3>, so the trigger is a heading-wrapped button.
function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          'group/accordion-trigger relative flex min-h-12 flex-1 cursor-pointer items-center justify-between gap-4 rounded-sm py-4 text-left font-display text-step-1 font-bold transition-colors hover:text-primary aria-disabled:pointer-events-none aria-disabled:opacity-50',
          className,
        )}
        {...props}
      >
        {children}
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-pill bg-tone-soft-bg text-primary transition-[transform,background-color] duration-(--duration-base) ease-standard group-hover/accordion-trigger:bg-accent group-hover/accordion-trigger:text-accent-fg group-aria-expanded/accordion-trigger:rotate-45"
        >
          <PlusIcon className="size-5" strokeWidth={2} />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-step-0 data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          'h-(--accordion-panel-height) max-w-(--container-prose) pt-0 pb-6 text-fg-muted data-ending-style:h-0 data-starting-style:h-0 [&_a]:text-link [&_a]:underline [&_a]:underline-offset-4 [&_p:not(:last-child)]:mb-4',
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
