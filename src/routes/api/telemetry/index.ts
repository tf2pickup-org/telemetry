import { routes } from '../../../utils/routes'
import { telemetrySchema } from '../../../telemetry/telemetry.schema'
import { upsertSnapshot } from '../../../telemetry/upsert-snapshot'

// eslint-disable-next-line @typescript-eslint/require-await
export default routes(async app => {
  app.put(
    '/',
    {
      config: { rateLimit: {} },
      bodyLimit: 16 * 1024,
      schema: {
        body: telemetrySchema,
      },
    },
    async (req, reply) => {
      await upsertSnapshot(req.body)
      await reply.status(204).send()
    },
  )
})
