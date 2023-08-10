import * as LabelPrimitive from '@radix-ui/react-label'
import * as React from 'react'

import clsx from 'clsx'

const labelVariants = clsx('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70')

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(
  ({ className, ...props }, ref) => <LabelPrimitive.Root ref={ref} className={clsx(labelVariants, className)} {...props} />,
)
Label.displayName = LabelPrimitive.Root.displayName

export { Label }
