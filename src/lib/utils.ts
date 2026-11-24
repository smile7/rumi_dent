import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

// Teach tailwind-merge our custom theme keys so e.g. `text-step-2` (size) and `text-fg` (color)
// are not treated as conflicting classes.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['step--1', 'step-0', 'step-1', 'step-2', 'step-3', 'step-4', 'step-5'],
      radius: ['pill', 'button', 'field', 'card', 'tile', 'media'],
      container: ['prose', 'content', 'wide'],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
