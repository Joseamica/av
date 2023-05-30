import {ChevronDownIcon, ChevronUpIcon} from '@heroicons/react/solid'
import clsx from 'clsx'
import {motion} from 'framer-motion'
import React from 'react'
import {H1, H2, H3, H4} from '../util/typography'

interface SectionContainerProps {
  id?: string
  children: React.ReactNode | React.ReactNode[]
  className?: string
  title?: string
  as?: React.ElementType
  divider?: boolean
  collapse?: boolean
  handleCollapse?: any | (() => void)
  collapseTitle?: string
  showCollapse?: boolean
}

function getClassName({className}: {className?: string}) {
  return clsx(
    'no-scrollbar container  rounded-lg bg-day-bg_principal dark:text-night-text_principal dark:bg-night-bg_principal p-2 font-sans shadow-lg border border-gray_light ',
    className,
  )
}

const SectionContainer = React.forwardRef<HTMLElement, SectionContainerProps>(
  function SectionContainer(
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
      ...rest
    },
    ref,
  ) {
    const MotionTag = motion(Tag)

    return (
      <MotionTag
        // initial={{opacity: 0, h: 0}} // Inicia fuera de la vista hacia arriba
        // animate={{opacity: 1, h: '100%'}} // Luego se mueve a su posición original
        // exit={{opacity: 0, h: 0}} // Al salir, se desplaza hacia arriba
        // transition={{
        //   duration: 0.9,
        //   ease: [0.04, 0.62, 0.23, 0.98],
        // }}
        id={id}
        {...rest}
        ref={ref}
        className={clsx(getClassName({className}))}
      >
        {showCollapse && (
          <div
            onClick={handleCollapse}
            className={clsx(
              'mb-2 flex cursor-pointer items-center justify-end space-x-3',
              {
                // 'justify-center': collapse,
                // 'justify-center': !collapse,
              },
            )}
          >
            <H4>{collapseTitle}</H4>
            {collapse ? (
              <ChevronDownIcon className="h-7 w-7 rounded-full border border-gray_light p-1 shadow-md" />
            ) : (
              <ChevronUpIcon className="h-7 w-7 rounded-full border border-gray_light p-1 shadow-md" />
            )}
          </div>
        )}
        <H1 className="font-medium">{title}</H1>
        <div className={clsx({'divide-y': divider === true})}>{children}</div>
      </MotionTag>
    )
  },
)

export {SectionContainer}
