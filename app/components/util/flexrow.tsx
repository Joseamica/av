import {motion} from 'framer-motion'

const justifyContent = {
  between: 'justify-between',
  center: 'justify-center ',
  start: 'justify-start',
}

/**
 *
 * @function FlexRow
 * @param {string} justify - justify content
 * @param {string} className - class name
 * @param {React.ReactNode}
 * @param {string} spaceX - space between items on X axis
 * @param {any} rest - rest of props
 * @returns {React.ReactNode}
 * @description - FlexRow component
 * @since 1.0.0
 * @example
 * <FlexRow justify="between" className="flex flex-row space-x-2">
 *
 */

export function FlexRow({
  justify = 'start',
  className,
  children,
  spaceX = '2',
  ...rest
}: {
  justify?: 'between' | 'center' | 'start'
  children: React.ReactNode | React.ReactNode[]
  space?: string
  className?: string
  [x: string]: any
}) {
  return (
    <motion.div
      {...rest}
      className={`flex flex-row items-center space-x-${spaceX} ${justifyContent[justify]} ${className}`}
    >
      {children}
    </motion.div>
  )
}
