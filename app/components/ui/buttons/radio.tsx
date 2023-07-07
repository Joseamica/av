import {Link} from '@remix-run/react'
import clsx from 'clsx'
import {ReactElement} from 'react'

interface ButtonProps {
  id?: string
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode | React.ReactNode[]
  className?: string
  to?: string
}

interface LinkProps {
  variant?: 'primary' | 'secondary' | 'danger'
  size?: 'small' | 'medium' | 'large'
  children: React.ReactNode | React.ReactNode[]
  to: string
}

function getClassName({className}: {className?: string}) {
  return clsx(
    'group relative inline-flex text-lg font-medium focus:outline-none opacity-100 disabled:opacity-50 transition bg-purple-200',
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
          'focus-ring absolute inset-0 transform rounded-full opacity-100 transition disabled:opacity-50',
          {
            'border-secondary bg-primary border-2 group-hover:border-transparent group-focus:border-transparent':
              variant === 'secondary' || variant === 'danger',
            danger: variant === 'danger',
            'bg-inverse': variant === 'primary',
          },
        )}
      />

      <div
        className={clsx(
          'relative flex h-full w-full items-center justify-center whitespace-nowrap',
          {
            'text-primary': variant === 'secondary',
            'text-inverse': variant === 'primary',
            'text-red-500': variant === 'danger',
            'space-x-5 px-11 py-6 ': size === 'large',
            'space-x-3 px-8 py-4': size === 'medium',
            'space-x-1 px-5 py-2 text-sm': size === 'small',
          },
        )}
      >
        {children}
      </div>
    </>
  )
}

function RadioButton({
  children,
  id,
  variant = 'primary',
  size = 'large',
  className,
  ...radioProps
}: ButtonProps & ReactElement) {
  return (
    <label htmlFor={id}>
      {children}
      <input {...radioProps} type="radio" />
    </label>
    // <button {...buttonProps} className={getClassName({className})}>
    //   <ButtonInner variant={variant} size={size}>
    //     {children}
    //   </ButtonInner>
    // </button>
  )
}

function LinkButton({
  children,
  variant = 'primary',
  size = 'large',
  className,
  to = '/',
}: LinkProps & JSX.IntrinsicElements['button']) {
  return (
    <Link to={to} className={getClassName({className})}>
      <ButtonInner variant={variant} size={size}>
        {children}
      </ButtonInner>
    </Link>
  )
}

export {RadioButton, LinkButton}
