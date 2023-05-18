import type {LoaderArgs} from '@remix-run/node'
import {eventStream} from 'remix-utils'

import {table} from '~/events'

export const loader = ({request, params}: LoaderArgs) => {
  const path = `/${params['*']}`

  return eventStream(request.signal, send => {
    const handler = (message: string) => {
      send({data: Date.now().toString()})
    }

    table.addListener(path, handler)
    return () => {
      table.removeListener(path, handler)
    }
  })
}
