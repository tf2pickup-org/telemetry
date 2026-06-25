import { routes } from '../utils/routes'
import { IndexPage } from '../telemetry/views/html/index.page'

// eslint-disable-next-line @typescript-eslint/require-await
export default routes(async app => {
  app.get('/', async (_req, reply) => {
    reply.header('cache-control', 'no-store')
    return reply.html(IndexPage())
  })
})
