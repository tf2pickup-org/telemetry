import { collections } from '../database/collections'
import type { TelemetryPayload } from './telemetry.schema'

function unset(payload: TelemetryPayload) {
  const fields = {
    ...(payload.version === undefined ? { version: '' } : {}),
    ...(payload.queues === undefined ? { queues: '' } : {}),
  }
  return Object.keys(fields).length > 0 ? { $unset: fields } : {}
}

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
        ...(payload.queues === undefined ? {} : { queues: payload.queues }),
        meta: payload.meta,
        lastSeenAt: now,
      },
      ...unset(payload),
      $setOnInsert: { firstSeenAt: now },
    },
    { upsert: true },
  )
}
