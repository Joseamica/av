import {EventEmitter} from 'events'

declare global {
  var tableEvents: EventEmitter
}
export const emitter = new EventEmitter()

// global.tableEvents = global.tableEvents || new EventEmitter()

// export const table = tableEvents

export const EVENTS = {
  TABLE_CHANGED: (tableId: string) => {
    console.log('tableId', tableId)
    emitter.emit('/')
    emitter.emit(`/table/${tableId}`)
  },
}
