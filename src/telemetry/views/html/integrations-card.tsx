import type { IntegrationAdoption } from '../../get-adoption'

export function IntegrationsCard(props: {
  integrations: IntegrationAdoption[]
  instanceCount: number
}) {
  const { integrations, instanceCount } = props

  return (
    <div class="bg-abru-light-3 border-abru-light-15 flex flex-col gap-4 rounded-xl border p-5">
      <h3 class="text-ash font-bold">Integrations</h3>
      <div class="flex flex-col gap-2">
        {integrations.map(integration => {
          const percent =
            instanceCount === 0 ? 0 : Math.round((integration.enabled / instanceCount) * 100)
          return (
            <div class="flex flex-col gap-1">
              <div class="flex items-baseline justify-between gap-2 text-sm">
                <span class="text-abru-light-75" safe>
                  {integration.label}
                </span>
                <span class="text-abru-light-50 shrink-0 tabular-nums">
                  <span class="text-ash font-semibold">{integration.enabled}</span> ({percent}%)
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
    </div>
  )
}
