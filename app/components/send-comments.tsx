import React from 'react'

import clsx from 'clsx'

export function SendComments({ error }: { error?: string }) {
  console.log('error', error)
  return (
    <textarea
      className={clsx('dark:bg-mainDark h-20 w-full resize-none rounded-lg bg-slate-200 p-2', {
        'border border-warning placeholder:text-warning': error,
      })}
      placeholder="Comentarios"
      maxLength={245}
      name="sendComments"
      defaultValue=""
    />
  )
}
