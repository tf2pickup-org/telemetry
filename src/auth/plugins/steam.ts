import fp from 'fastify-plugin'
import { openId } from '../open-id'
import { environment } from '../../environment'

declare module '@fastify/secure-session' {
  interface SessionData {
    steamId: string
  }
}

const getSteamLoginUrl = (): Promise<string> =>
  new Promise((resolve, reject) => {
    openId.authenticate('https://steamcommunity.com/openid', false, (err, authUrl) => {
      if (err) {
        reject(new Error(err.message))
        return
      }

      if (!authUrl) {
        reject(new Error('Authentication failed: authUrl is empty'))
        return
      }

      resolve(authUrl)
    })
  })

const verifySteamCallback = (url: string): Promise<string> =>
  new Promise((resolve, reject) => {
    openId.verifyAssertion(url, (err, result) => {
      if (err) {
        reject(new Error(err.message))
        return
      }

      if (result?.claimedIdentifier === undefined) {
        reject(new Error('no auth info from Steam'))
        return
      }

      if (!result.authenticated) {
        reject(new Error('not authenticated'))
        return
      }

      if (!/^https?:\/\/steamcommunity\.com\/openid\/id\/\d{17}$/.test(result.claimedIdentifier)) {
        reject(new Error('invalid claimedIdentifier'))
        return
      }

      const steamId = result.claimedIdentifier.split('/').pop()
      if (!steamId) {
        reject(new Error('invalid claimedIdentifier'))
        return
      }

      resolve(steamId)
    })
  })

export default fp(
  // eslint-disable-next-line @typescript-eslint/require-await
  async app => {
    app.get('/auth/steam', async (_request, reply) => {
      const url = await getSteamLoginUrl()
      return reply.redirect(url, 302)
    })

    app.get('/auth/steam/return', async (request, reply) => {
      const steamId = await verifySteamCallback(request.url)
      if (!environment.ADMIN_STEAM_IDS.includes(steamId)) {
        return reply.code(403).send('Your Steam account is not authorized to view this dashboard.')
      }

      request.session.set('steamId', steamId)
      return reply.redirect('/', 302)
    })

    app.addHook('onRequest', async (request, reply) => {
      if (request.routeOptions.url !== '/') {
        return
      }

      const steamId = request.session.get('steamId')
      if (!steamId || !environment.ADMIN_STEAM_IDS.includes(steamId)) {
        return reply.redirect('/auth/steam', 302)
      }
    })
  },
  { name: 'auth/steam' },
)
