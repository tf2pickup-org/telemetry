import { Layout } from '../../../html/layout'
import { getAdoption } from '../../get-adoption'
import { FeatureCard } from './feature-card'
import { IntegrationsCard } from './integrations-card'
import { BreakdownBars } from './breakdown-bars'
import { UsageCard } from './usage-card'
import { RankedList } from './ranked-list'

export async function IndexPage() {
  const adoption = await getAdoption()

  return (
    <Layout>
      <main class="container mx-auto max-w-6xl px-4 py-10">
        <header class="mb-8 flex flex-col gap-1">
          <h1 class="text-ash text-4xl font-black">telemetry</h1>
          <p class="text-abru-light-50 text-lg">
            anonymous feature adoption across tf2pickup.org instances
          </p>
        </header>

        <section class="bg-abru-light-3 border-abru-light-15 mb-8 rounded-xl border p-5">
          <h2 class="text-ash text-3xl font-bold tabular-nums">{adoption.instanceCount}</h2>
          <p class="text-abru-light-50 text-sm">
            {adoption.instanceCount === 1 ? 'instance' : 'instances'} reporting in the last 8 days
          </p>
        </section>

        {adoption.instanceCount === 0 ? (
          <p class="text-abru-light-50 py-16 text-center text-lg">No telemetry received yet.</p>
        ) : (
          <>
            <h2 class="text-ash mb-3 text-xl font-bold">Features</h2>
            <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {adoption.features.map(feature => (
                <FeatureCard feature={feature} />
              ))}
            </div>

            <h2 class="text-ash mb-3 text-xl font-bold">Usage &amp; maps</h2>
            <div class="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <UsageCard usage={adoption.usage} />
              <div class="bg-abru-light-3 border-abru-light-15 flex flex-col gap-4 rounded-xl border p-5">
                <h3 class="text-ash font-bold">Most played maps</h3>
                <RankedList
                  items={adoption.maps.map(map => ({ label: map.name, value: map.count }))}
                  unit="games"
                />
              </div>
              <div class="bg-abru-light-3 border-abru-light-15 flex flex-col gap-4 rounded-xl border p-5">
                <h3 class="text-ash font-bold">Maps in pools</h3>
                <RankedList
                  items={adoption.mapPool.map(map => ({ label: map.name, value: map.instances }))}
                  unit="instances"
                />
              </div>
            </div>

            <h2 class="text-ash mb-3 text-xl font-bold">Deployment</h2>
            <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              <IntegrationsCard
                integrations={adoption.integrations}
                instanceCount={adoption.instanceCount}
              />
              <div class="bg-abru-light-3 border-abru-light-15 flex flex-col gap-4 rounded-xl border p-5">
                <h3 class="text-ash font-bold">Queue config</h3>
                <BreakdownBars items={adoption.queueConfigs} total={adoption.instanceCount} />
              </div>
              <div class="bg-abru-light-3 border-abru-light-15 flex flex-col gap-4 rounded-xl border p-5">
                <h3 class="text-ash font-bold">Version</h3>
                <BreakdownBars
                  items={adoption.versions}
                  total={adoption.versions.reduce((sum, item) => sum + item.count, 0)}
                />
              </div>
            </div>
          </>
        )}
      </main>
    </Layout>
  )
}
