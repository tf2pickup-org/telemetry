export type FeatureValue = string | number | boolean | null

export interface SnapshotModel {
  /** stable, anonymous per-instance identifier (sha256 of the instance url) */
  instanceId: string
  version?: string
  /** queue type the instance runs, e.g. 6v6 / 9v9 */
  queueConfig: string
  /** allow-listed, non-PII configuration values */
  features: Record<string, FeatureValue>
  /** which integrations the instance has enabled */
  integrations: Record<string, boolean>
  /** accumulated usage counters, e.g. skill suggestions applied (absent on pre-usage snapshots) */
  usage?: Record<string, number>
  /** played map name -> number of games (absent on pre-usage snapshots) */
  maps?: Record<string, number>
  /** map names in the instance's configured pool (absent on pre-usage snapshots) */
  mapPool?: string[]
  lastSeenAt: Date
  firstSeenAt: Date
}
