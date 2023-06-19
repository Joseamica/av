import {EventEmitter} from 'events'

let emitter: EventEmitter

declare global {
  var __emitter: EventEmitter | undefined
}

if (process.env.NODE_ENV === 'production') {
  emitter = new EventEmitter()
} else {
  if (!global.__emitter) {
    global.__emitter = new EventEmitter()
  }
  emitter = global.__emitter
}

export const EVENTS = {
  ISSUE_CHANGED: (tableId: string, data?: any) => {
    emitter.emit('/')
    emitter.emit(`/table/${tableId}`, data)
  },
}

export {emitter}
