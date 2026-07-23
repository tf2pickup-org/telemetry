import { collections } from '../database/collections'
import type {
  FeatureValue,
  MetaEntry,
  SnapshotMeta,
  SnapshotModel,
} from '../database/models/snapshot.model'
import { humanizeKey } from './humanize-key'

export interface ValueBreakdown {
  value: string
  count: number
}

export interface FeatureAdoption {
  key: string
  label: string
  group?: string
  /** how many instances reported this feature at all */
  reporting: number
  breakdown: ValueBreakdown[]
}

export interface IntegrationAdoption {
  key: string
  label: string
  enabled: number
}

export interface UsageAdoption {
  key: string
  label: string
  /** summed across all reporting instances */
  total: number
  /** how many instances reported a non-zero value */
  instancesUsing: number
}

export interface MapAdoption {
  name: string
  /** games played on the map, summed across instances */
  count: number
}

export interface MapPoolAdoption {
  name: string
  /** how many instances include the map in their pool */
  instances: number
}

export interface Adoption {
  instanceCount: number
  features: FeatureAdoption[]
  integrations: IntegrationAdoption[]
  usage: UsageAdoption[]
  maps: MapAdoption[]
  mapPool: MapPoolAdoption[]
  versions: ValueBreakdown[]
  queueConfigs: ValueBreakdown[]
}

const topMapsShown = 25

function formatValue(value: FeatureValue): string {
  if (value === null) {
    return 'unset'
  }
  if (typeof value === 'boolean') {
    return value ? 'enabled' : 'disabled'
  }
  return String(value)
}

function breakdown(values: string[]): ValueBreakdown[] {
  const counts = new Map<string, number>()
  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
}

/**
 * The display catalog (labels + order) is authored in tf2pickup and shipped in
 * each snapshot's `meta`; the newest reporting version wins. Keys present in the
 * data but missing from that catalog are appended with a humanized label.
 */
function newestMeta(snapshots: SnapshotModel[]): SnapshotMeta {
  return (
    [...snapshots]
      .filter(snapshot => snapshot.meta)
      .sort((a, b) =>
        (b.version ?? '').localeCompare(a.version ?? '', undefined, { numeric: true }),
      )
      .at(0)?.meta ?? {}
  )
}

function catalog(metaList: MetaEntry[] | undefined, dataKeys: string[]): MetaEntry[] {
  const meta = metaList ?? []
  const known = new Set(meta.map(entry => entry.key))
  const extra = dataKeys
    .filter((key, index, all) => all.indexOf(key) === index)
    .filter(key => !known.has(key))
    .map(key => ({ key, label: humanizeKey(key) }))
  return [...meta, ...extra]
}

function featureAdoption(snapshots: SnapshotModel[], meta: SnapshotMeta): FeatureAdoption[] {
  const dataKeys = snapshots.flatMap(snapshot => Object.keys(snapshot.features))
  return catalog(meta.features, dataKeys).map(({ key, label, group }) => {
    const reported = snapshots
      .filter(snapshot => key in snapshot.features)
      .map(snapshot => formatValue(snapshot.features[key]!))
    return {
      key,
      label,
      ...(group === undefined ? {} : { group }),
      reporting: reported.length,
      breakdown: breakdown(reported),
    }
  })
}

/**
 * Ratio metrics cannot be summed across instances; older tf2pickup versions
 * reported them per-instance, so those keys are dropped and the fleet-wide
 * ratios are recomputed here from the summed counters of instances that
 * report `games30d`.
 */
const legacyRatioKeys = new Set([
  'gameReinitializationsPerGame',
  'gameServerReassignmentsPerGame',
  'gamesForceEndedShare',
])

const derivedRatios = [
  {
    key: 'gameReinitializationsPerGame',
    label: 'Game reinitializations per game (30d)',
    numerator: 'gameReinitializations30d',
  },
  {
    key: 'gameServerReassignmentsPerGame',
    label: 'Game server reassignments per game (30d)',
    numerator: 'gameServerReassignments30d',
  },
  {
    key: 'gamesForceEndedShare',
    label: 'Games force-ended share (30d)',
    numerator: 'gamesForceEnded30d',
  },
]

function usageAdoption(snapshots: SnapshotModel[], meta: SnapshotMeta): UsageAdoption[] {
  const dataKeys = snapshots.flatMap(snapshot => Object.keys(snapshot.usage ?? {}))
  const rows = catalog(meta.usage, dataKeys)
    .filter(({ key }) => !legacyRatioKeys.has(key))
    .map(({ key, label }) => {
      const values = snapshots.map(snapshot => snapshot.usage?.[key] ?? 0)
      return {
        key,
        label,
        total: values.reduce((sum, value) => sum + value, 0),
        instancesUsing: values.filter(value => value > 0).length,
      }
    })

  const contributing = snapshots.filter(snapshot => (snapshot.usage?.['games30d'] ?? 0) > 0)
  const games = contributing.reduce((sum, s) => sum + (s.usage?.['games30d'] ?? 0), 0)

  for (const { key, label, numerator } of derivedRatios) {
    const count = contributing.reduce((sum, s) => sum + (s.usage?.[numerator] ?? 0), 0)
    const row = {
      key,
      label,
      total: games === 0 ? 0 : Math.round((count / games) * 1000) / 1000,
      instancesUsing: contributing.length,
    }
    const at = rows.findIndex(existing => existing.key === numerator)
    rows.splice(at === -1 ? rows.length : at + 1, 0, row)
  }

  return rows
}

function integrationAdoption(
  snapshots: SnapshotModel[],
  meta: SnapshotMeta,
): IntegrationAdoption[] {
  const dataKeys = snapshots.flatMap(snapshot => Object.keys(snapshot.integrations))
  return catalog(meta.integrations, dataKeys).map(({ key, label }) => ({
    key,
    label,
    enabled: snapshots.filter(snapshot => snapshot.integrations[key]).length,
  }))
}

function mapsAdoption(snapshots: SnapshotModel[]): MapAdoption[] {
  const counts = new Map<string, number>()
  for (const snapshot of snapshots) {
    for (const [name, count] of Object.entries(snapshot.maps ?? {})) {
      counts.set(name, (counts.get(name) ?? 0) + count)
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
    .slice(0, topMapsShown)
}

function mapPoolAdoption(snapshots: SnapshotModel[]): MapPoolAdoption[] {
  const counts = new Map<string, number>()
  for (const snapshot of snapshots) {
    for (const name of new Set(snapshot.mapPool ?? [])) {
      counts.set(name, (counts.get(name) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([name, instances]) => ({ name, instances }))
    .sort((a, b) => b.instances - a.instances || a.name.localeCompare(b.name))
    .slice(0, topMapsShown)
}

export async function getAdoption(): Promise<Adoption> {
  const snapshots = await collections.snapshots.find({}).toArray()
  const meta = newestMeta(snapshots)

  const versions = breakdown(
    snapshots.map(snapshot => snapshot.version).filter((v): v is string => v !== undefined),
  )
  const queueConfigs = breakdown(snapshots.map(snapshot => snapshot.queueConfig))

  return {
    instanceCount: snapshots.length,
    features: featureAdoption(snapshots, meta),
    integrations: integrationAdoption(snapshots, meta),
    usage: usageAdoption(snapshots, meta),
    maps: mapsAdoption(snapshots),
    mapPool: mapPoolAdoption(snapshots),
    versions,
    queueConfigs,
  }
}
