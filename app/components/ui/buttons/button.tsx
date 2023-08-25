import { Link } from '@remix-run/react'
import React from 'react'

import clsx from 'clsx'

import { AnchorOrLink } from '~/utils/misc'

import { DeleteIcon } from '~/components/icons'

interface ButtonProps {
  fullWith?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'payment' | 'custom'
  size?: 'small' | 'medium' | 'large' | 'icon'
  children: React.ReactNode | React.ReactNode[]
  to?: string
  custom?: string
}

interface LinkProps {
  fullWith?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'icon' | 'payment' | 'custom'
  size?: 'small' | 'medium' | 'large' | 'icon'
  children: React.ReactNode | React.ReactNode[]
  to: string
  custom?: string
  onClick?: () => void
}

function getClassName({ className, fullWith }: { className?: string; fullWith?: boolean }) {
  return clsx(
    'group relative inline-flex text-lg  focus:outline-none opacity-100 disabled:opacity-50 transition ',
    { 'w-full': fullWith },

    className,
  )
}

function ButtonInner({ children, variant, custom, size = 'large' }: ButtonProps & Pick<ButtonProps, 'children' | 'variant' | 'size'>) {
  return (
    <>
      <div
        className={clsx(
          `focus-ring  absolute inset-0 transform rounded-full   opacity-100  transition disabled:opacity-50 ${
            variant === 'custom' && custom
          }`,
          {
            'border-2 border-button-outline bg-transparent ': variant === 'secondary' || variant === 'danger',
            danger: variant === 'danger',
            'shadow-md': variant === 'icon',
            'border-button-outline bg-button-primary': variant === 'primary',
            'border-button-successBg bg-success text-white': variant === 'payment',
          },
        )}
      />

      <div
        className={clsx(`relative flex h-full w-full items-center justify-center whitespace-nowrap`, {
          'text-primary': variant === 'secondary',
          'text-white': variant === 'primary' || variant === 'payment',
          'text-red-500': variant === 'danger',
          'space-x-5 px-11 py-6 ': size === 'large',
          'space-x-3 px-8 py-4': size === 'medium',
          'space-x-1 px-5 py-2 text-sm ': size === 'small',
          'space-x-1 p-3 px-5 text-sm ': size === 'icon',
        })}
      >
        {children}
      </div>
    </>
  )
}

/**
 * Button component
 * NOTE - If use variant=custom you must pass a custom className and text white
 * @param {boolean} fullWith - If true, the button will take the full width of its parent
 * @param {string} variant - The variant of the button
 * @param {string} size - The size of the button
 * @param {string} className - The className of the button
 * @param {string} custom - The custom className of the button
 * @param {React.ReactNode} children - The children of the button
 * @param {string} to - The link of the button
 * @param {function} onClick - The onClick function of the button
 */

function Button({
  children,
  fullWith,
  variant = 'primary',
  size = 'large',
  className,
  custom,
  ...buttonProps
}: ButtonProps & JSX.IntrinsicElements['button']) {
  return (
    <button {...buttonProps} className={getClassName({ className, fullWith })}>
      <ButtonInner variant={variant} size={size} custom={custom}>
        {children}
      </ButtonInner>
    </button>
  )
}

function LinkButton({
  children,
  fullWith,
  variant = 'primary',
  size = 'large',
  className,
  custom,
  to = '/',
  onClick,
}: LinkProps & JSX.IntrinsicElements['button']) {
  return (
    <Link onClick={onClick} to={to} preventScrollReset className={getClassName({ className, fullWith })}>
      <ButtonInner variant={variant} size={size} custom={custom}>
        {children}
      </ButtonInner>
    </Link>
  )
}

function QuantityButton({
  onDecrease,
  onIncrease,
  quantity,
  disabled,
  isForm = false,
  name,
  decreaseValue,
  increaseValue,
}: {
  onDecrease?: () => void
  onIncrease?: () => void
  quantity: number
  disabled?: boolean
  isForm?: boolean
  name?: string
  decreaseValue?: string
  increaseValue?: string
}) {
  return (
    <div className="flex items-center justify-between w-32 p-1 rounded-full dark:bg-button-primary">
      {/* NOTE - Esto es que si el componente isForm, entonces aparezca el icono de basura cuando este en quantity <= 1*/}
      {isForm ? (
        <>
          {quantity <= 1 ? (
            <button
              type={'submit'}
              className="flex items-center justify-center w-10 h-10 text-2xl rounded-full shadow-lg dark:bg-mainDark dark:text-night-text_principal bg-day-bg_principal text-warning disabled:text-gray-300 xs:h-7 xs:w-7"
              onClick={onDecrease}
              disabled={disabled}
              name={name}
              value={decreaseValue}
            >
              <DeleteIcon className="w-5 h-5 fill-warning" />
            </button>
          ) : (
            <button
              type={isForm ? 'submit' : 'button'}
              className="w-10 h-10 text-2xl rounded-full shadow-lg dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal bg-day-bg_principal disabled:text-gray-300 xs:h-7 xs:w-7"
              onClick={onDecrease}
              disabled={disabled}
              name={name}
              value={decreaseValue}
            >
              -
            </button>
          )}
        </>
      ) : (
        <button
          type={isForm ? 'submit' : 'button'}
          className="w-10 h-10 text-2xl rounded-full shadow-lg dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal bg-day-bg_principal disabled:text-gray-300 xs:h-7 xs:w-7"
          onClick={onDecrease}
          disabled={disabled}
          name={name}
          value={decreaseValue}
        >
          -
        </button>
      )}
      <span className="flex justify-center px-3 py-2 text-white w-7 disabled:text-gray-200 xs:px-2 xs:py-1 xs:text-xs">{quantity}</span>
      <button
        type={isForm ? 'submit' : 'button'}
        onClick={onIncrease}
        className="w-10 h-10 text-2xl rounded-full shadow-lg dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal bg-day-bg_principal xs:h-7 xs:w-7"
        name={name}
        value={increaseValue}
      >
        +
      </button>
    </div>
  )
}
/**
 * A link that looks like a button
 */
const ButtonLink = React.forwardRef<HTMLAnchorElement, React.ComponentPropsWithRef<typeof AnchorOrLink> & ButtonProps>(function ButtonLink(
  { children, variant = 'primary', className, size = 'large', ...rest },
  ref,
) {
  return (
    <AnchorOrLink ref={ref} className={getClassName({ className })} {...rest}>
      <ButtonInner variant={variant} size={size}>
        {children}
      </ButtonInner>
    </AnchorOrLink>
  )
})

export { Button, ButtonLink, LinkButton, QuantityButton }
