import React from 'react'

export function SendComments() {
  return (
    <textarea
      className="w-full h-20 p-2 rounded-lg resize-none dark:bg-mainDark bg-slate-200"
      placeholder="Comentarios"
      maxLength={245}
      name="sendComments"
    />
  )
}
