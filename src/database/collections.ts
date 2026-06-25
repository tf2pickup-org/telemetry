import { database } from './database'
import type { SnapshotModel } from './models/snapshot.model'

export const collections = {
  snapshots: database.collection<SnapshotModel>('snapshots'),
} as const
