import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import {motion} from 'framer-motion'
import React, {useState} from 'react'
import {FlexRow} from '../util/flexrow'
import {H2, H3, H5, H6} from '../util/typography'

interface SectionContainerProps {
  children: React.ReactNode | React.ReactNode[]
  className?: string
  divider?: boolean
  collapse?: boolean
  handleCollapse?: any | (() => void)
  showCollapse?: boolean
}

function getClassName({className}: {className?: string}) {
  return clsx(
    'relative inline-flex text-lg font-medium focus:outline-none opacity-100 disabled:opacity-50 transition ',
    className,
  )
}

export function SectionContainer({
  children,
  className,
  divider = false,
  collapse,
  handleCollapse,
  showCollapse,
  ...rest
}: SectionContainerProps) {
  return (
    <motion.main
      initial={{opacity: 0, width: '0'}}
      animate={{opacity: 1, width: '100%'}}
      exit={{opacity: 0, width: '0'}}
      transition={{
        duration: 0.9,
        ease: [0.04, 0.62, 0.23, 0.98],
      }}
      {...rest}
      className={clsx(
        `no-scrollbar container  rounded-lg  bg-white p-2 font-sans shadow-lg outline outline-1 outline-offset-2 outline-day-200`,
        // {' divide-y': divider},
        className,
      )}
    >
      {showCollapse && (
        <div
          onClick={handleCollapse}
          className={clsx('flex cursor-pointer justify-center ', {
            'justify-center': collapse,
            // 'justify-center': !collapse,
          })}
        >
          {collapse ? (
            <ChevronUpIcon className="h-7 w-7 rounded-full p-1 shadow-md" />
          ) : (
            <ChevronDownIcon className="h-7 w-7 rounded-full p-1 shadow-md" />
          )}
        </div>
      )}
      <div className={clsx({'divide-y': divider})}>{children}</div>
    </motion.main>
  )
}
