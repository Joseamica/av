import {EventEmitter} from 'events'

declare global {
  var tableEvents: EventEmitter
}

global.tableEvents = global.tableEvents || new EventEmitter()

export const table = tableEvents

export const EVENTS = {
  TABLE_CHANGED: (tableId: string) => {
    tableEvents.emit('/')
    tableEvents.emit(`/table/${tableId}`)
  },
}
