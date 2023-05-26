import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import {motion} from 'framer-motion'
import React from 'react'

interface SectionContainerProps {
  children: React.ReactNode | React.ReactNode[]
  className?: string
  divider?: boolean
  collapse?: boolean
  handleCollapse?: any | (() => void)
  showCollapse?: boolean
  unActive?: boolean
}

function getClassName({
  unActive,
  className,
}: {
  unActive?: boolean
  className?: string
}) {
  return clsx(
    'no-scrollbar flex flex-row justify-between rounded-lg bg-white p-2 font-sans shadow-lg  container',
    {'text-disabled': unActive},
    {className},
  )
}

export function ItemContainer({
  children,
  className,
  divider = false,
  collapse,
  handleCollapse,
  showCollapse = false,
  unActive = false,
  ...rest
}: SectionContainerProps) {
  return (
    <motion.label
      {...rest}
      className={clsx(getClassName({unActive, className}))}
    >
      {showCollapse && (
        <button
          onClick={handleCollapse}
          className={clsx('flex cursor-pointer ', {
            // 'justify-center': collapse,
            // 'justify-center': !collapse,
          })}
        >
          {collapse ? (
            <ChevronDownIcon className="h-7 w-7 rounded-full p-1 shadow-md" />
          ) : (
            <ChevronUpIcon className="h-7 w-7 rounded-full p-1 shadow-md" />
          )}
        </button>
      )}
      {children}
    </motion.label>
  )
}
