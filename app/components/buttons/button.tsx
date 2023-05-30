import {Link} from '@remix-run/react'
import clsx from 'clsx'
import {H3} from '../util/typography'
import {XIcon} from '@heroicons/react/outline'

interface ButtonProps {
  fullWith?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'icon'
  size?: 'small' | 'medium' | 'large' | 'icon'
  children: React.ReactNode | React.ReactNode[]
  to?: string
}

interface LinkProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'icon'
  size?: 'small' | 'medium' | 'large' | 'icon'
  children: React.ReactNode | React.ReactNode[]
  to: string
}

function getClassName({
  className,
  fullWith,
}: {
  className?: string
  fullWith?: boolean
}) {
  return clsx(
    'group relative inline-flex text-lg font-medium focus:outline-none opacity-100 disabled:opacity-50 transition  ',
    {'w-full': fullWith},
    className,
  )
}

function ButtonInner({
  children,
  variant,
  size = 'large',
}: Pick<ButtonProps, 'children' | 'variant' | 'size'>) {
  return (
    <>
      <div
        className={clsx(
          'focus-ring  absolute inset-0 transform rounded-full  border-4 opacity-100 transition disabled:opacity-50 ',
          {
            'border-secondary border-2 bg-transparent group-hover:border-transparent group-focus:border-transparent':
              variant === 'secondary' || variant === 'danger',
            danger: variant === 'danger',
            'shadow-md': variant === 'icon',
            'border-button-outline bg-button-primary': variant === 'primary',
          },
        )}
      />

      <div
        className={clsx(
          'relative flex h-full w-full items-center justify-center whitespace-nowrap',
          {
            'text-primary': variant === 'secondary',
            'text-white': variant === 'primary',
            'text-red-500': variant === 'danger',
            'space-x-5 px-11 py-6 ': size === 'large',
            'space-x-3 px-8 py-4': size === 'medium',
            'space-x-1 px-5 py-2 text-sm ': size === 'small',
            'space-x-1 p-3 px-5 text-sm ': size === 'icon',
          },
        )}
      >
        {children}
      </div>
    </>
  )
}

function Button({
  children,
  fullWith,
  variant = 'primary',
  size = 'large',
  className,
  ...buttonProps
}: ButtonProps & JSX.IntrinsicElements['button']) {
  return (
    <button {...buttonProps} className={getClassName({className, fullWith})}>
      <ButtonInner variant={variant} size={size}>
        {children}
      </ButtonInner>
    </button>
  )
}

//TODO SELECT BUTTON

function LinkButton({
  children,
  variant = 'primary',
  size = 'large',
  className,
  to = '/',
}: LinkProps & JSX.IntrinsicElements['button']) {
  return (
    <Link to={to} preventScrollReset className={getClassName({className})}>
      <ButtonInner variant={variant} size={size}>
        {children}
      </ButtonInner>
    </Link>
  )
}

export {Button, LinkButton}
