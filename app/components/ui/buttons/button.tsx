import { Link } from '@remix-run/react'
import clsx from 'clsx'
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
  variant?: 'primary' | 'secondary' | 'danger' | 'icon'
  size?: 'small' | 'medium' | 'large' | 'icon'
  children: React.ReactNode | React.ReactNode[]
  to: string
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
        className={clsx(`focus-ring  absolute inset-0 transform rounded-full  border-4 opacity-100  transition disabled:opacity-50 ${variant === 'custom' && custom}`, {
          'border-2 border-button-outline bg-transparent group-hover:border-transparent group-focus:border-transparent': variant === 'secondary' || variant === 'danger',
          danger: variant === 'danger',
          'shadow-md': variant === 'icon',
          'border-button-outline bg-button-primary': variant === 'primary',
          'border-button-successBg bg-success text-white': variant === 'payment',
        })}
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

function Button({ children, fullWith, variant = 'primary', size = 'large', className, custom, ...buttonProps }: ButtonProps & JSX.IntrinsicElements['button']) {
  return (
    <button {...buttonProps} className={getClassName({ className, fullWith })}>
      <ButtonInner variant={variant} size={size} custom={custom}>
        {children}
      </ButtonInner>
    </button>
  )
}

function LinkButton({ children, fullWith, variant = 'primary', size = 'large', className, to = '/', onClick }: LinkProps & JSX.IntrinsicElements['button']) {
  return (
    <Link onClick={onClick} to={to} preventScrollReset className={getClassName({ className, fullWith })}>
      <ButtonInner variant={variant} size={size}>
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
    <div className="flex w-32 items-center justify-between rounded-full p-1 dark:bg-button-primary">
      {/* NOTE - Esto es que si el componente isForm, entonces aparezca el icono de basura cuando este en quantity <= 1*/}
      {isForm ? (
        <>
          {quantity <= 1 ? (
            <button
              type={'submit'}
              className="dark:bg-mainDark dark:text-night-text_principal flex h-10 w-10 items-center justify-center rounded-full bg-day-bg_principal text-2xl text-warning shadow-lg disabled:text-gray-300 xs:h-7 xs:w-7"
              onClick={onDecrease}
              disabled={disabled}
              name={name}
              value={decreaseValue}
            >
              <DeleteIcon className="h-5 w-5 fill-warning" />
            </button>
          ) : (
            <button
              type={isForm ? 'submit' : 'button'}
              className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal h-10 w-10 rounded-full bg-day-bg_principal text-2xl shadow-lg disabled:text-gray-300 xs:h-7 xs:w-7"
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
          className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal h-10 w-10 rounded-full bg-day-bg_principal text-2xl shadow-lg disabled:text-gray-300 xs:h-7 xs:w-7"
          onClick={onDecrease}
          disabled={disabled}
          name={name}
          value={decreaseValue}
        >
          -
        </button>
      )}
      <span className="flex w-7 justify-center px-3 py-2 text-white disabled:text-gray-200 xs:px-2 xs:py-1 xs:text-xs">{quantity}</span>
      <button
        type={isForm ? 'submit' : 'button'}
        onClick={onIncrease}
        className="dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal h-10 w-10 rounded-full bg-day-bg_principal text-2xl shadow-lg xs:h-7 xs:w-7"
        name={name}
        value={increaseValue}
      >
        +
      </button>
    </div>
  )
}

export { Button, LinkButton, QuantityButton }
