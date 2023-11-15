import { EventEmitter } from 'events'

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
  ISSUE_CHANGED: (tableId?: string, branchId?: string, data?: any) => {
    emitter.emit('/', data)
    emitter.emit(`/admin/${branchId}/notifications`, data)
    emitter.emit(`/dashboard`, data)
    emitter.emit(`/dashboard/notifications`, data)
    emitter.emit(`/dashboard/tables`, data)

    emitter.emit(`/table/${tableId}`, data)
  },
}

export { emitter }
