import { useId } from 'react'

import { Input } from './input'
import { Label } from './label'

export function ErrorList({ id, errors }: { errors?: any; id?: string }) {
  const errorsToRender = errors?.filter(Boolean)
  if (!errorsToRender?.length) return null
  return (
    <ul id={id} className="space-y-1">
      {errorsToRender.map(e => (
        <li key={e} className="text-[10px] text-foreground-danger">
          {e}
        </li>
      ))}
    </ul>
  )
}

export function Field({
  labelProps,
  inputProps,
  errors,
  className,
}: {
  labelProps: Omit<React.LabelHTMLAttributes<HTMLLabelElement>, 'className'>
  inputProps: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>
  errors?: any
  className?: string
}) {
  const fallbackId = useId()
  const id = inputProps.id ?? fallbackId
  const errorId = errors?.length ? `${id}-error` : undefined
  const errorExist = errors[0] !== undefined
  return (
    <div className={className}>
      <Label htmlFor={id} {...labelProps} />
      <Input
        id={id}
        error={errorExist ? true : false}
        aria-invalid={errorId ? true : undefined}
        aria-describedby={errorId}
        {...inputProps}
      />
      <div className="min-h-[32px] px-4 pb-3 pt-1">{errorId ? <ErrorList id={errorId} errors={errors} /> : null}</div>
    </div>
  )
}
