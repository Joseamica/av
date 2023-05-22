import React from 'react'

export function SendComments() {
  return (
    <textarea
      className="dark:bg-mainDark h-20 w-full resize-none rounded-lg bg-slate-200 p-2"
      placeholder="Comentarios"
      maxLength={245}
      name="sendComments"
      defaultValue=""
    />
  )
}
