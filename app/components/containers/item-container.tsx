import clsx from 'clsx'
import { motion } from 'framer-motion'
import React from 'react'
import { ChevronDownIcon, ChevronUpIcon } from '../icons'

interface SectionContainerProps {
  children: React.ReactNode | React.ReactNode[]
  className?: string
  divider?: boolean
  collapse?: boolean
  handleCollapse?: any | (() => void)
  showCollapse?: boolean
  unActive?: boolean
}

function getClassName({ unActive, className }: { unActive?: boolean; className?: string }) {
  return clsx(
    'no-scrollbar flex flex-row justify-between rounded-lg bg-day-bg_principal  dark:bg-night-bg_principal dark:text-night-text_principal p-4 font-sans shadow-md  container',
    { 'text-disabled': unActive },
    className,
  )
}

export function ItemContainer({ children, className, divider = false, collapse, handleCollapse, showCollapse = false, unActive = false, ...rest }: SectionContainerProps) {
  return (
    <motion.label {...rest} className={clsx(getClassName({ unActive, className }))}>
      {showCollapse && (
        <button
          {...rest}
          onClick={handleCollapse}
          className={clsx('flex cursor-pointer ', {
            // 'justify-center': collapse,
            // 'justify-center': !collapse,
          })}
        >
          {collapse ? <ChevronDownIcon className="h-7 w-7 rounded-full p-1 shadow-md" /> : <ChevronUpIcon className="h-7 w-7 rounded-full p-1 shadow-md" />}
        </button>
      )}
      {children}
    </motion.label>
  )
}
