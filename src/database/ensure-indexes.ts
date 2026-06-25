import { hoursToSeconds } from 'date-fns'
import { collections } from './collections'
import { logger } from '../logger'

// instances report roughly daily; drop an instance a week after it goes quiet
const snapshotTtlHours = 24 * 8

export async function ensureIndexes() {
  logger.info('ensuring indexes...')
  await collections.snapshots.createIndex({ instanceId: 1 }, { unique: true })
  await collections.snapshots.createIndex(
    { lastSeenAt: 1 },
    { expireAfterSeconds: hoursToSeconds(snapshotTtlHours) },
  )
  logger.info('indexes ensured')
}
