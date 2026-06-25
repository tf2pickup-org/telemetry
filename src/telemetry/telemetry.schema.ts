import { z } from 'zod'

const featureValueSchema = z.union([z.string().max(200), z.number(), z.boolean(), z.null()])

const maxKeys = 100
const maxMapKeys = 200

const boundedRecord = <T extends z.ZodType>(value: T, limit: number) =>
  z
    .record(z.string().max(80), value)
    .refine(record => Object.keys(record).length <= limit, { message: 'too many keys' })

export const telemetrySchema = z.object({
  instanceId: z.string().min(1).max(128),
  version: z.string().max(40).optional(),
  queueConfig: z.string().min(1).max(40),
  features: boundedRecord(featureValueSchema, maxKeys).default({}),
  integrations: boundedRecord(z.boolean(), maxKeys).default({}),
  usage: boundedRecord(z.number(), maxKeys).default({}),
  maps: boundedRecord(z.number().nonnegative(), maxMapKeys).default({}),
  mapPool: z.array(z.string().max(80)).max(maxMapKeys).default([]),
})

export type TelemetryPayload = z.infer<typeof telemetrySchema>
