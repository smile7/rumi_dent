'use client'

import { PhoneIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Cluster, Stack } from '@/components/primitives/Stack'
import { Text } from '@/components/primitives/Text'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button, buttonVariants } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Toaster } from '@/components/ui/sonner'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { DemoBlock } from './DemoBlock'

const variants = ['primary', 'secondary', 'outline', 'ghost', 'link'] as const

export function ButtonsDemo() {
  return (
    <Stack gap="lg">
      {variants.map((variant) => (
        <Cluster key={variant} gap="md">
          <Text as="span" size="small" tone="muted" className="w-24">
            {variant}
          </Text>
          <Button variant={variant}>Запазете час</Button>
          <Button variant={variant} disabled>
            Неактивен
          </Button>
          <Button variant={variant} loading>
            Изпращане
          </Button>
        </Cluster>
      ))}
      <Cluster gap="md">
        <Text as="span" size="small" tone="muted" className="w-24">
          call
        </Text>
        <a href="tel:+35982841190" className={cn(buttonVariants({ variant: 'call' }))}>
          <PhoneIcon aria-hidden="true" strokeWidth={2} />
          082 841 190
        </a>
      </Cluster>
      <Cluster gap="md">
        <Text as="span" size="small" tone="muted" className="w-24">
          sizes
        </Text>
        <Button size="sm">Малък</Button>
        <Button size="md">Среден</Button>
        <Button size="lg">Голям</Button>
      </Cluster>
    </Stack>
  )
}

export function FormDemo() {
  return (
    <form className="grid max-w-(--container-prose) gap-6" noValidate>
      <div className="grid gap-2">
        <Label htmlFor="sg-name">Име на родителя</Label>
        <Input id="sg-name" name="name" autoComplete="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sg-phone">Телефон</Label>
        <Input id="sg-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sg-email">Имейл</Label>
        <Input
          id="sg-email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue="ivana@"
          aria-invalid="true"
          aria-describedby="sg-email-error"
        />
        <p id="sg-email-error" className="text-step--1 font-semibold text-danger">
          Въведете имейл във формат име@домейн.bg
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sg-message">Съобщение</Label>
        <Textarea id="sg-message" name="message" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="sg-disabled">Неактивно поле</Label>
        <Input id="sg-disabled" disabled defaultValue="Само за четене" />
      </div>
      <Label className="items-start gap-3 font-normal">
        <Checkbox name="consent" />
        <span className="pt-0.5">
          Съгласен/на съм данните ми да бъдат използвани за връзка с мен.
        </span>
      </Label>
    </form>
  )
}

export function DisplayDemo() {
  return (
    <Stack gap="lg">
      <Cluster gap="sm">
        <Badge>За деца</Badge>
        <Badge variant="brand">Ново</Badge>
        <Badge variant="accent">Първо посещение</Badge>
        <Badge variant="success">Отворено</Badge>
        <Badge variant="warning">Почивен ден</Badge>
        <Badge variant="danger">Затворено</Badge>
        <Badge variant="outline">Възрастни</Badge>
      </Cluster>
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Профилактичен преглед</CardTitle>
          <CardDescription>Преглед, почистване и съвети за домашна грижа.</CardDescription>
        </CardHeader>
        <CardContent>
          <Text>Подходящ за деца от първия зъб нататък.</Text>
        </CardContent>
        <CardFooter>
          <Button variant="link">Научете повече</Button>
        </CardFooter>
      </Card>
    </Stack>
  )
}

export function DisclosureDemo() {
  return (
    <Stack gap="xl">
      <Accordion className="max-w-(--container-prose)">
        <AccordionItem value="first-visit">
          <AccordionTrigger>Как да подготвя детето за първото посещение?</AccordionTrigger>
          <AccordionContent>
            <p>Разкажете му спокойно какво ще се случи и изберете час, в който не е уморено.</p>
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="parent">
          <AccordionTrigger>Мога ли да остана в кабинета?</AccordionTrigger>
          <AccordionContent>
            <p>Да, родителят може да присъства по време на прегледа.</p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Tabs defaultValue="kids">
        <TabsList>
          <TabsTrigger value="kids">За деца</TabsTrigger>
          <TabsTrigger value="adults">За възрастни</TabsTrigger>
        </TabsList>
        <TabsContent value="kids">
          <Text>Детска дентална медицина</Text>
        </TabsContent>
        <TabsContent value="adults">
          <Text>Дентална медицина за възрастни</Text>
        </TabsContent>
      </Tabs>
    </Stack>
  )
}

export function OverlaysDemo() {
  const [sheetOpen, setSheetOpen] = useState(false)
  return (
    <TooltipProvider>
      <Cluster gap="md">
        <Dialog>
          <DialogTrigger render={<Button variant="outline" />}>Отвори диалог</DialogTrigger>
          <DialogContent closeLabel="Затвори">
            <DialogHeader>
              <DialogTitle>Настройки на бисквитките</DialogTitle>
              <DialogDescription>Изберете кои бисквитки да използваме.</DialogDescription>
            </DialogHeader>
            <Label className="gap-3 font-normal">
              <Checkbox name="analytics" />
              Аналитични бисквитки
            </Label>
            <DialogFooter>
              <DialogClose render={<Button variant="ghost" />}>Отказ</DialogClose>
              <DialogClose render={<Button />}>Запази избора</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger render={<Button variant="outline" />}>Отвори меню</SheetTrigger>
          <SheetContent closeLabel="Затвори менюто">
            <SheetHeader>
              <SheetTitle>Меню</SheetTitle>
              <SheetDescription>Навигация за мобилни устройства.</SheetDescription>
            </SheetHeader>
            <nav className="grid gap-1 px-6">
              <a className="rounded-sm py-3 font-semibold text-link" href="#buttons">
                Бутони
              </a>
              <a className="rounded-sm py-3 font-semibold text-link" href="#forms">
                Форми
              </a>
            </nav>
          </SheetContent>
        </Sheet>

        <Drawer>
          <DrawerTrigger render={<Button variant="outline" />}>Отвори панел</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Работно време</DrawerTitle>
              <DrawerDescription>Панел, който се плъзга отдолу.</DrawerDescription>
            </DrawerHeader>
            <DrawerFooter>
              <DrawerClose render={<Button />}>Готово</DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>

        <Tooltip>
          <TooltipTrigger render={<Button variant="ghost" />}>Подсказка</TooltipTrigger>
          <TooltipContent>Допълнителна информация (не е критична)</TooltipContent>
        </Tooltip>

        <Button variant="secondary" onClick={() => toast.success('Съобщението е изпратено')}>
          Покажи известие
        </Button>
      </Cluster>
      <Toaster />
    </TooltipProvider>
  )
}

export function ComponentsDemo() {
  return (
    <>
      <DemoBlock id="buttons" title="Buttons">
        <ButtonsDemo />
      </DemoBlock>
      <DemoBlock id="forms" title="Form controls">
        <FormDemo />
      </DemoBlock>
      <DemoBlock id="display" title="Badges and cards">
        <DisplayDemo />
      </DemoBlock>
      <DemoBlock id="disclosure" title="Accordion and tabs">
        <DisclosureDemo />
      </DemoBlock>
      <DemoBlock id="overlays" title="Dialog, sheet, drawer, tooltip, toast">
        <OverlaysDemo />
      </DemoBlock>
    </>
  )
}
