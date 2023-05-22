import clsx from 'clsx'
import {H3} from '../util/typography'

interface RadioInputButtonProps {
  // variant?: 'primary' | 'secondary' | 'danger'
  // size?: 'small' | 'medium' | 'large'
  // children: React.ReactNode | React.ReactNode[]
  title?: string
  state: string
  value: string
  handlerFunction: (event: React.ChangeEvent<HTMLInputElement>) => void
}

function RadioInputButton({
  title,
  state,
  handlerFunction,
  ...inputProps
}: RadioInputButtonProps & JSX.IntrinsicElements['input']) {
  return (
    <label
      htmlFor={inputProps.id}
      className={clsx('flex flex-row space-x-2 px-4 py-2', {
        'bg-day-400  ring-2 ring-day-500 dark:bg-night-400 dark:ring-night-700':
          state === inputProps.value,
      })}
    >
      <H3 className="capitalize">{title}</H3>
      <input {...inputProps} className="sr-only" onChange={handlerFunction} />
    </label>
  )
}
export {RadioInputButton}
