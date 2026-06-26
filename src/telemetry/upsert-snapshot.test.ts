import { afterEach, describe, expect, it, vi } from 'vitest'
import type { TelemetryPayload } from './telemetry.schema'

const updateOne = vi.fn()

vi.mock('../database/collections', () => ({
  collections: { snapshots: { updateOne } },
}))

const { upsertSnapshot } = await import('./upsert-snapshot')

function payload(overrides: Partial<TelemetryPayload> = {}): TelemetryPayload {
  return {
    instanceId: 'abc',
    version: '4.14.1',
    queueConfig: '6v6',
    features: { 'games.skill_suggestions': true },
    integrations: { discord: true },
    usage: { skillSuggestionsApplied30d: 4 },
    maps: { process: 10 },
    mapPool: ['cp_process_f12'],
    meta: {
      features: [{ key: 'games.skill_suggestions', label: 'Skill suggestions', group: 'Games' }],
    },
    ...overrides,
  }
}

describe('upsertSnapshot', () => {
  afterEach(() => vi.clearAllMocks())

  it('upserts keyed by instanceId', async () => {
    await upsertSnapshot(payload())
    expect(updateOne).toHaveBeenCalledOnce()
    const [filter, , options] = updateOne.mock.calls[0]!
    expect(filter).toEqual({ instanceId: 'abc' })
    expect(options).toEqual({ upsert: true })
  })

  it('sets firstSeenAt only on insert', async () => {
    await upsertSnapshot(payload())
    const update = updateOne.mock.calls[0]![1]
    expect(update.$setOnInsert).toHaveProperty('firstSeenAt')
    expect(update.$set).toHaveProperty('lastSeenAt')
  })

  it('unsets version when absent', async () => {
    await upsertSnapshot(payload({ version: undefined }))
    const update = updateOne.mock.calls[0]![1]
    expect(update.$unset).toEqual({ version: '' })
  })

  it('persists display metadata', async () => {
    await upsertSnapshot(payload())
    const update = updateOne.mock.calls[0]![1]
    expect(update.$set.meta).toEqual({
      features: [{ key: 'games.skill_suggestions', label: 'Skill suggestions', group: 'Games' }],
    })
  })
})
