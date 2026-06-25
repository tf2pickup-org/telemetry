import openid from 'openid'
import { environment } from '../environment'

export const openId = new openid.RelyingParty(
  `${environment.PUBLIC_URL}/auth/steam/return`,
  environment.PUBLIC_URL,
  true,
  true,
  [],
)
