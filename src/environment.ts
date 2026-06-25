import { z } from 'zod'
import dotenv from 'dotenv'

dotenv.config()

const environmentSchema = z.object({
  NODE_ENV: z.string().default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']).default('info'),
  APP_HOST: z.string().default('localhost'),
  APP_PORT: z.coerce.number().default(3000),

  MONGODB_URI: z.url(),

  // public-facing url of this service, used as the Steam OpenID realm/return url
  PUBLIC_URL: z.url().default('http://localhost:3000'),
  // secret used to sign the dashboard session cookie
  SESSION_SECRET: z.string().min(32),
  // steam id64s allowed to view the dashboard, comma-separated
  ADMIN_STEAM_IDS: z
    .string()
    .default('')
    .transform(value =>
      value
        .split(',')
        .map(id => id.trim())
        .filter(Boolean),
    ),

  // requests per minute per client IP accepted on the ingest endpoint
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(20),
  // trust X-Forwarded-For when running behind a reverse proxy
  TRUST_PROXY: z
    .enum(['true', 'false'])
    .default('false')
    .transform(value => value === 'true'),
})

export const environment = environmentSchema.parse(process.env)
