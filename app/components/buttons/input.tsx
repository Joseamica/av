import clsx from 'clsx'
import {H3, H4} from '../util/typography'

interface RadioInputButtonProps {
  // variant?: 'primary' | 'secondary' | 'danger'
  // size?: 'small' | 'medium' | 'large'
  // children: React.ReactNode | React.ReactNode[]
  title?: string
  state: string
  value: string
  className?: string
  handlerFunction: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function RadioInputButton({
  title,
  state,
  className,
  handlerFunction,
  ...inputProps
}: RadioInputButtonProps & JSX.IntrinsicElements['input']) {
  return (
    <label
      htmlFor={inputProps.id}
      className={clsx(
        'flex flex-row space-x-2 rounded-lg px-4 py-1 outline-button-outline ring-2 ',
        {
          'text-2 rounded-full bg-button-primary px-2 py-1  text-white  ring-4   ring-button-outline':
            state === inputProps.value,
        },
        className,
      )}
    >
      <H4 className="capitalize">{title}</H4>
      <input
        {...inputProps}
        className="sr-only bg-red-200"
        onChange={handlerFunction}
      />
    </label>
  )
}
export {RadioInputButton}
