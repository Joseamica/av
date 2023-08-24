import { type User } from '@prisma/client'
import { Authenticator } from 'remix-auth'
import { FormStrategy } from 'remix-auth-form'
import { sessionStorage } from '~/session.server'

import { verifyLogin } from '~/models/user.server'

// export const authenticator = new Authenticator<string>(sessionStorage, {
//   sessionKey: 'sessionId',
// })

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30

export let authenticator = new Authenticator<User>(sessionStorage)

// Tell the Authenticator to use the form strategy
authenticator.use(
  new FormStrategy(async ({ form }) => {
    let email = form.get('email') as string
    let password = form.get('password') as string
    let user = await verifyLogin(email, password)
    // the type of this user must match the type you pass to the Authenticator
    // the strategy will automatically inherit the type if you instantiate
    // directly inside the `use` method
    if (!user) {
      throw new Error('Invalid username or password')
    }
    return user
  }),
  // each strategy has a name and can be changed to use another one
  // same strategy multiple times, especially useful for the OAuth2 strategy.
  FormStrategy.name,
)
