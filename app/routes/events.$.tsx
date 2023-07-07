import type {LoaderArgs} from '@remix-run/node'
import {eventStream} from 'remix-utils'
import {emitter} from '~/events'

export const loader = ({request, params}: LoaderArgs) => {
  const path = `/${params['*']}`

  return eventStream(request.signal, send => {
    const handler = (message: string) => {
      console.log('message', message)
      if (message) {
        send({event: 'message', data: message})
      } else {
        send({data: Date.now().toString()})
      }
    }

    emitter.addListener(path, handler)

    //added this to prevent timeouts on my app, but i dont know the implications
    // const heartbeatInterval = setInterval(() => {
    //   send({event: 'heartbeat', data: 'ping'})
    // }, 30000)

    return () => {
      // clearInterval(heartbeatInterval)
      emitter.removeListener(path, handler)
    }
  })
}
