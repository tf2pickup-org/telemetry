import pino from 'pino'
import { environment } from './environment'

const stream =
  environment.NODE_ENV === 'production'
    ? process.stdout
    : (pino.transport({ target: 'pino-princess' }) as pino.DestinationStream)

export const logger = pino({ level: environment.LOG_LEVEL }, stream)
