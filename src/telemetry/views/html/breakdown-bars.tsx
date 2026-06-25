import type { ValueBreakdown } from '../../get-adoption'

const barClasses = ['bg-accent', 'bg-accent/70', 'bg-accent/45', 'bg-accent/30', 'bg-abru-light-25']

export function BreakdownBars(props: { items: ValueBreakdown[]; total: number }) {
  const { items, total } = props

  if (total === 0) {
    return <p class="text-abru-light-50 text-sm">No data yet.</p>
  }

  return (
    <div class="flex flex-col gap-2">
      {items.map((item, index) => {
        const percent = Math.round((item.count / total) * 100)
        return (
          <div class="flex flex-col gap-1">
            <div class="flex items-baseline justify-between gap-2 text-sm">
              <span class="text-abru-light-75 truncate" safe>
                {item.value}
              </span>
              <span class="text-abru-light-50 shrink-0 tabular-nums">
                <span class="text-ash font-semibold">{item.count}</span> ({percent}%)
              </span>
            </div>
            <div class="bg-abru-light-5 h-2 w-full overflow-hidden rounded-full">
              <div
                class={`h-full rounded-full ${barClasses[Math.min(index, barClasses.length - 1)]}`}
                style={`width: ${Math.max(percent, 2)}%`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
