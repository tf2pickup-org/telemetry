import type { UsageAdoption } from '../../get-adoption'

export function UsageCard(props: { usage: UsageAdoption[] }) {
  return (
    <div class="bg-abru-light-3 border-abru-light-15 flex flex-col gap-4 rounded-xl border p-5">
      <h3 class="text-ash font-bold">Usage</h3>
      <div class="flex flex-col gap-3">
        {props.usage.map(metric => (
          <div class="flex items-baseline justify-between gap-3">
            <span class="text-abru-light-75 text-sm" safe>
              {metric.label}
            </span>
            <span class="shrink-0 text-right">
              <span class="text-ash text-lg font-bold tabular-nums" safe>
                {metric.total.toLocaleString('en-US')}
              </span>
              <span class="text-abru-light-50 block text-xs">
                {metric.instancesUsing} {metric.instancesUsing === 1 ? 'instance' : 'instances'}{' '}
                using
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
