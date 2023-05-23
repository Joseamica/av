import clsx from 'clsx'
import React from 'react'

function getClassName({className}: {className?: string}) {
  return clsx(
    'relative inline-flex text-lg font-medium focus:outline-none opacity-100 disabled:opacity-50 transition ',
    className,
  )
}

export function SectionContainer({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <main
      className={clsx(
        `no-scrollbar container space-y-4 rounded-lg bg-white p-2  font-sans drop-shadow-md`,
        className,
      )}
    >
      {children}
    </main>
  )
}
