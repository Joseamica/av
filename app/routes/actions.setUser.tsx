import {redirect, type ActionArgs} from '@remix-run/node'
import {json} from 'stream/consumers'
import {prisma} from '~/db.server'
import {validateRedirect} from '~/redirect.server'
import {getSession, sessionStorage} from '~/session.server'
import {getTableIdFromUrl} from '~/utils'

const isNameValid = (name: string) => {
  return name.length >= 1
}
function validateUser(input: any) {
  let validationErrors = {} as any
  if (!isNameValid(input.name)) {
    validationErrors.name = 'El nombre debe tener al menos 1 carácter'
  }
  if (Object.keys(validationErrors).length > 0) {
    throw validationErrors
  }
}

const SESSION_EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 30

export const action = async ({request}: ActionArgs) => {
  //   let [body, session] = await Promise.all([request.text(), getSession(request)])
  const formData = (await request.formData()) as any
  const data = Object.fromEntries(formData.entries()) as any
  const pathname = formData.get('pathname') as string
  const redirectTo = validateRedirect(formData.get('pathname'), pathname)
  const searchParams = new URLSearchParams(request.url)
  const session = await getSession(request)
  const userId = session.get('userId')
  const tableId = getTableIdFromUrl(pathname)

  try {
    validateUser(data)
  } catch (error) {
    console.log('error', error)
    return redirect(redirectTo + `?error=${error.name}`)
  }
  searchParams.set('error', '')

  const sessionId = await prisma.session.create({
    data: {
      expirationDate: new Date(Date.now() + SESSION_EXPIRATION_TIME),
      user: {
        create: {
          id: userId,
          name: data.name,
          color: data.color ? data.color : '#00D100',
        },
      },
    },
    // select: {id: !0, expirationDate: !0},
  })

  session.set('username', data.name)
  if (tableId) {
    session.set('tableId', tableId)
  }

  return redirect(redirectTo, {
    headers: {'Set-Cookie': await sessionStorage.commitSession(session)},
  })
}
