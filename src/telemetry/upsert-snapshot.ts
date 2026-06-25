import { collections } from '../database/collections'
import type { TelemetryPayload } from './telemetry.schema'

export async function upsertSnapshot(payload: TelemetryPayload) {
  const now = new Date()
  await collections.snapshots.updateOne(
    { instanceId: payload.instanceId },
    {
      $set: {
        version: payload.version,
        queueConfig: payload.queueConfig,
        features: payload.features,
        integrations: payload.integrations,
        usage: payload.usage,
        maps: payload.maps,
        mapPool: payload.mapPool,
        lastSeenAt: now,
      },
      ...(payload.version === undefined ? { $unset: { version: '' } } : {}),
      $setOnInsert: { firstSeenAt: now },
    },
    { upsert: true },
  )
}
