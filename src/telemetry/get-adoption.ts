import { collections } from '../database/collections'
import type { FeatureValue, SnapshotModel } from '../database/models/snapshot.model'
import { featureCatalog, integrationCatalog, usageCatalog } from './feature-catalog'

export interface ValueBreakdown {
  value: string
  count: number
}

export interface FeatureAdoption {
  key: string
  label: string
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

function featureAdoption(snapshots: SnapshotModel[]): FeatureAdoption[] {
  const keys = [
    ...featureCatalog.map(feature => feature.key),
    ...snapshots
      .flatMap(snapshot => Object.keys(snapshot.features))
      .filter(key => !featureCatalog.some(feature => feature.key === key)),
  ].filter((key, index, all) => all.indexOf(key) === index)

  return keys.map(key => {
    const reported = snapshots
      .filter(snapshot => key in snapshot.features)
      .map(snapshot => formatValue(snapshot.features[key]!))
    return {
      key,
      label: featureCatalog.find(feature => feature.key === key)?.label ?? key,
      reporting: reported.length,
      breakdown: breakdown(reported),
    }
  })
}

function usageAdoption(snapshots: SnapshotModel[]): UsageAdoption[] {
  const keys = [
    ...usageCatalog.map(usage => usage.key),
    ...snapshots
      .flatMap(snapshot => Object.keys(snapshot.usage ?? {}))
      .filter(key => !usageCatalog.some(usage => usage.key === key)),
  ].filter((key, index, all) => all.indexOf(key) === index)

  return keys.map(key => {
    const values = snapshots.map(snapshot => snapshot.usage?.[key] ?? 0)
    return {
      key,
      label: usageCatalog.find(usage => usage.key === key)?.label ?? key,
      total: values.reduce((sum, value) => sum + value, 0),
      instancesUsing: values.filter(value => value > 0).length,
    }
  })
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

  const versions = breakdown(
    snapshots.map(snapshot => snapshot.version).filter((v): v is string => v !== undefined),
  )
  const queueConfigs = breakdown(snapshots.map(snapshot => snapshot.queueConfig))

  return {
    instanceCount: snapshots.length,
    features: featureAdoption(snapshots),
    integrations: integrationCatalog.map(({ key, label }) => ({
      key,
      label,
      enabled: snapshots.filter(snapshot => snapshot.integrations[key]).length,
    })),
    usage: usageAdoption(snapshots),
    maps: mapsAdoption(snapshots),
    mapPool: mapPoolAdoption(snapshots),
    versions,
    queueConfigs,
  }
}
