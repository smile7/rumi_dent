'use client'

import type { ReactNode } from 'react'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

type FaqAccordionItem = {
  id: string
  question: string
  answer: ReactNode
}

type FaqAccordionProps = {
  items: FaqAccordionItem[]
  idPrefix: string
}

export function FaqAccordion({ items, idPrefix }: FaqAccordionProps) {
  return (
    <Accordion className="faq-accordion-cards mt-8 max-w-(--container-content)">
      {items.map((item) => (
        <AccordionItem key={item.id} value={item.id}>
          <AccordionTrigger id={`${idPrefix}-${item.id}`}>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}