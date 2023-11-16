import React from 'react'

import clsx from 'clsx'
import { motion } from 'framer-motion'

import { ChevronDownIcon, ChevronUpIcon, Spacer } from '..'
import { H1 } from '../util/typography'

interface SectionContainerProps {
  id?: string
  children: React.ReactNode | React.ReactNode[]
  className?: string
  title?: string
  as?: React.ElementType
  divider?: boolean
  collapse?: boolean
  handleCollapse?: any | (() => void)
  collapseTitle?: React.ReactNode
  showCollapse?: boolean
  roundedPosition?: 'top' | 'bottom' | 'both'
}

const roundedPositions = {
  top: 'rounded-t-xl',
  bottom: 'rounded-b-xl',
  both: 'rounded-xl',
}

function getClassName({
  className,
  roundedPosition,
}: {
  className?: string

  roundedPosition: 'top' | 'bottom' | 'both'
}) {
  return clsx(
    roundedPositions[roundedPosition],
    'no-scrollbar container  bg-day-bg_principal dark:text-night-text_principal dark:bg-night-bg_principal p-2 font-sans  border-2 ',
    className,
  )
}

const SectionContainer = React.forwardRef<HTMLElement, SectionContainerProps>(function SectionContainer(
  {
    id,
    children,
    className,
    title,
    as: Tag = 'main',
    divider = false,
    collapse,
    handleCollapse,
    collapseTitle,
    showCollapse = false,
    roundedPosition = 'both',
    ...rest
  },
  ref,
) {
  return (
    <motion.div
      key="content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // transition={{
      //   duration: 0.8,
      //   ease: [0.04, 0.62, 0.23, 0.98],
      // }}
      id={id}
      {...rest}
      ref={ref}
      className={clsx(getClassName({ className, roundedPosition }))}
    >
      {showCollapse && (
        <div
          onClick={handleCollapse}
          className={clsx('mb-2 flex cursor-pointer items-center justify-end space-x-3', {
            // 'justify-center': collapse,
            // 'justify-center': !collapse,
          })}
        >
          {collapseTitle}
          {collapse ? (
            <ChevronDownIcon className="h-7 w-7 rounded-full border border-gray_light p-1 shadow-md" />
          ) : (
            <ChevronUpIcon className="h-7 w-7 rounded-full border border-gray_light p-1 shadow-md" />
          )}
        </div>
      )}
      <H1 className="font-medium">{title}</H1>
      {title && (
        <>
          <Spacer spaceY="1" /> <hr />
        </>
      )}
      <div className={clsx({ 'divide-y': divider === true })}>{children}</div>
    </motion.div>
  )
})

export { SectionContainer }
