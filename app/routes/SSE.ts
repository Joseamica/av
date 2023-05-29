import {LoaderArgs, LoaderFunction} from '@remix-run/node'
import type {CleanupFunction, SendFunction} from 'remix-sse'
import {EventStream} from 'remix-sse'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const total = await prisma.order.findFirst({}).then(res => res?.total)
  console.log('total', total)
  return new EventStream(
    request,
    (send: SendFunction, _cleanup: CleanupFunction) => {
      send('total', JSON.stringify({total}))
    },
  )
}
