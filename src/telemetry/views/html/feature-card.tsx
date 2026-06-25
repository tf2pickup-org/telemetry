import type { FeatureAdoption } from '../../get-adoption'
import { BreakdownBars } from './breakdown-bars'

export function FeatureCard(props: { feature: FeatureAdoption }) {
  const { feature } = props

  return (
    <div class="bg-abru-light-3 border-abru-light-15 flex flex-col gap-4 rounded-xl border p-5">
      <div class="flex flex-col gap-0.5">
        <h3 class="text-ash font-bold" safe>
          {feature.label}
        </h3>
        <p class="text-abru-light-50 text-xs">
          reported by <span class="tabular-nums">{feature.reporting}</span>{' '}
          {feature.reporting === 1 ? 'instance' : 'instances'}
        </p>
      </div>
      <BreakdownBars items={feature.breakdown} total={feature.reporting} />
    </div>
  )
}
