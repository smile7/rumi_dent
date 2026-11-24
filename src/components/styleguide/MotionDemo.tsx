import { Reveal } from '@/components/motion/Reveal'
import { Text } from '@/components/primitives/Text'
import { DemoBlock } from './DemoBlock'

const samples = ['Първо посещение', 'Профилактика', 'Детска стоматология']

export function MotionDemo() {
  return (
    <DemoBlock id="motion" title="Motion: Reveal">
      <Text tone="muted" className="mb-6">
        Fade + 12px lift, once, --duration-slow / --ease-standard, staggered 0.06s. Static under
        reduced motion.
      </Text>
      <div className="grid gap-4 md:grid-cols-3">
        {samples.map((label, index) => (
          <Reveal key={label} delay={index * 0.06}>
            <div className="rounded-card bg-surface p-6 shadow-sm">
              <Text className="font-display font-bold">{label}</Text>
            </div>
          </Reveal>
        ))}
      </div>
    </DemoBlock>
  )
}
