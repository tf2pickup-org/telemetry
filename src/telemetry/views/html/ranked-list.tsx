export function RankedList(props: { items: { label: string; value: number }[]; unit: string }) {
  const { items, unit } = props

  if (items.length === 0) {
    return <p class="text-abru-light-50 text-sm">No data yet.</p>
  }

  const max = Math.max(...items.map(item => item.value))

  return (
    <div class="flex flex-col gap-2">
      {items.map(item => {
        const percent = max === 0 ? 0 : Math.round((item.value / max) * 100)
        return (
          <div class="flex flex-col gap-1">
            <div class="flex items-baseline justify-between gap-2 text-sm">
              <span class="text-abru-light-75 truncate" safe>
                {item.label}
              </span>
              <span class="text-abru-light-50 shrink-0 tabular-nums">
                <span class="text-ash font-semibold">{item.value.toLocaleString('en-US')}</span>{' '}
                {unit}
              </span>
            </div>
            <div class="bg-abru-light-5 h-2 w-full overflow-hidden rounded-full">
              <div
                class="bg-accent h-full rounded-full"
                style={`width: ${Math.max(percent, 2)}%`}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
