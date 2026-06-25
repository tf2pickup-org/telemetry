import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { SnapshotModel } from '../database/models/snapshot.model'

const find = vi.fn()

vi.mock('../database/collections', () => ({
  collections: { snapshots: { find: () => ({ toArray: find }) } },
}))

const { getAdoption } = await import('./get-adoption')

function snapshot(overrides: Partial<SnapshotModel> = {}): SnapshotModel {
  return {
    instanceId: Math.random().toString(36),
    version: '4.14.1',
    queueConfig: '6v6',
    features: {},
    integrations: {},
    usage: {},
    maps: {},
    mapPool: [],
    lastSeenAt: new Date(),
    firstSeenAt: new Date(),
    ...overrides,
  }
}

describe('getAdoption', () => {
  beforeEach(() => find.mockReset())
  afterEach(() => vi.clearAllMocks())

  it('counts instances', async () => {
    find.mockResolvedValue([snapshot(), snapshot()])
    const adoption = await getAdoption()
    expect(adoption.instanceCount).toBe(2)
  })

  it('breaks a boolean feature down by value', async () => {
    find.mockResolvedValue([
      snapshot({ features: { 'games.skill_suggestions': true } }),
      snapshot({ features: { 'games.skill_suggestions': true } }),
      snapshot({ features: { 'games.skill_suggestions': false } }),
    ])
    const adoption = await getAdoption()
    const feature = adoption.features.find(f => f.key === 'games.skill_suggestions')
    expect(feature?.reporting).toBe(3)
    expect(feature?.breakdown).toEqual([
      { value: 'enabled', count: 2 },
      { value: 'disabled', count: 1 },
    ])
  })

  it('ignores instances that do not report a feature', async () => {
    find.mockResolvedValue([
      snapshot({ features: { 'games.skill_suggestions': true } }),
      snapshot(),
    ])
    const adoption = await getAdoption()
    const feature = adoption.features.find(f => f.key === 'games.skill_suggestions')
    expect(feature?.reporting).toBe(1)
  })

  it('renders null feature values as unset', async () => {
    find.mockResolvedValue([snapshot({ features: { 'queue.player_skill_threshold': null } })])
    const adoption = await getAdoption()
    const feature = adoption.features.find(f => f.key === 'queue.player_skill_threshold')
    expect(feature?.breakdown).toEqual([{ value: 'unset', count: 1 }])
  })

  it('counts enabled integrations', async () => {
    find.mockResolvedValue([
      snapshot({ integrations: { discord: true } }),
      snapshot({ integrations: { discord: false } }),
    ])
    const adoption = await getAdoption()
    expect(adoption.integrations.find(i => i.key === 'discord')?.enabled).toBe(1)
  })

  it('surfaces feature keys not in the catalog', async () => {
    find.mockResolvedValue([snapshot({ features: { 'games.future_flag': true } })])
    const adoption = await getAdoption()
    expect(adoption.features.some(f => f.key === 'games.future_flag')).toBe(true)
  })

  it('sums usage counters and counts instances using them', async () => {
    find.mockResolvedValue([
      snapshot({ usage: { skillSuggestionsApplied30d: 5 } }),
      snapshot({ usage: { skillSuggestionsApplied30d: 3 } }),
      snapshot({ usage: { skillSuggestionsApplied30d: 0 } }),
    ])
    const adoption = await getAdoption()
    const usage = adoption.usage.find(u => u.key === 'skillSuggestionsApplied30d')
    expect(usage?.total).toBe(8)
    expect(usage?.instancesUsing).toBe(2)
  })

  it('sums played maps across instances and ranks them', async () => {
    find.mockResolvedValue([
      snapshot({ maps: { process: 10, gullywash: 4 } }),
      snapshot({ maps: { process: 5 } }),
    ])
    const adoption = await getAdoption()
    expect(adoption.maps).toEqual([
      { name: 'process', count: 15 },
      { name: 'gullywash', count: 4 },
    ])
  })

  it('counts how many instances include each pool map', async () => {
    find.mockResolvedValue([
      snapshot({ mapPool: ['cp_process_f12', 'cp_gullywash_f9'] }),
      snapshot({ mapPool: ['cp_process_f12'] }),
    ])
    const adoption = await getAdoption()
    expect(adoption.mapPool[0]).toEqual({ name: 'cp_process_f12', instances: 2 })
  })
})
