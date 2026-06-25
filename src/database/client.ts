import { MongoClient } from 'mongodb'
import { environment } from '../environment'

export const client = new MongoClient(environment.MONGODB_URI, { ignoreUndefined: true })
await client.connect()
