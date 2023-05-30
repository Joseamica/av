// import {EventEmitter} from 'events'

// declare global {
//   var tableEvents: EventEmitter
// }
// export const emitter = new EventEmitter()

// global.tableEvents = global.tableEvents || new EventEmitter()

// export const table = tableEvents

// export const EVENTS = {
//   TABLE_CHANGED: (tableId: string, data?: any) => {
//     console.log('tableId', tableId)
//     table.emit('/')
//     table.emit(`/table/${tableId}`, {data})
//     table.emit(`/table/${tableId}/pay/custom`)
//   },
// }

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
    // emitter.emit('/')
    emitter.emit(`/table/${tableId}`, {data})
  },
}

export {emitter}

// import {EventEmitter} from 'node:events'

// declare global {
//   var tableEvents: EventEmitter
// }

// global.tableEvents = global.tableEvents || new EventEmitter()

// export const table = tableEvents

// export function updateAmountLeft(user: string, message: string) {
//   tableEvents.emit('amountLeft', {user, message})
// }
