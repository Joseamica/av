import {motion} from 'framer-motion'

const justifyContent = {
  between: 'justify-between',
  center: 'text-principal dark:text-secondaryTextDark ',
  start: 'justify-start',
}

export function FlexRow({
  justify = 'start',
  className,
  children,
  ...rest
}: {
  justify?: 'between' | 'center' | 'start'
  children: React.ReactNode | React.ReactNode[]
  className?: string
  [x: string]: any
}) {
  return (
    <motion.div
      {...rest}
      className={`flex flex-row ${justifyContent[justify]} ${className}`}
    >
      {children}
    </motion.div>
  )
}
