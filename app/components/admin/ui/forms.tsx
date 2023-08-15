import { useInputEvent } from '@conform-to/react'
import React, { useId, useRef } from 'react'

import { Checkbox, type CheckboxProps } from './checkbox'
import { Input } from './input'
import { Label } from './label'

export type ListOfErrors = Array<string | null | undefined> | null | undefined

const sizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function ErrorList({ id, errors, size }: { errors?: any; id?: string; size?: string }) {
  const errorsToRender = errors?.filter(Boolean)
  if (!errorsToRender?.length) return null
  return (
    <ul id={id} className="space-y-1">
      {errorsToRender.map(e => (
        <li key={e} className={`text-[10px] text-warning ${sizes[size]}`}>
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
  const errorExist = errors?.length && errors[0] !== undefined
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

export function CheckboxField({
  labelProps,
  buttonProps,
  errors,
  className,
}: {
  labelProps: JSX.IntrinsicElements['label']
  buttonProps: CheckboxProps
  errors?: ListOfErrors
  className?: string
}) {
  const fallbackId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)
  // To emulate native events that Conform listen to:
  // See https://conform.guide/integrations
  const control = useInputEvent({
    // Retrieve the checkbox element by name instead as Radix does not expose the internal checkbox element
    // See https://github.com/radix-ui/primitives/discussions/874
    ref: () => buttonRef.current?.form?.elements.namedItem(buttonProps.name ?? ''),
    onFocus: () => buttonRef.current?.focus(),
  })

  const id = buttonProps.id ?? buttonProps.name ?? fallbackId
  const errorId = errors?.length ? `${id}-error` : undefined
  return (
    <div className={className}>
      <div className="flex gap-2">
        <Checkbox
          id={id}
          ref={buttonRef}
          aria-invalid={errorId ? true : undefined}
          aria-describedby={errorId}
          {...buttonProps}
          onCheckedChange={state => {
            control.change(Boolean(state.valueOf()))
            buttonProps.onCheckedChange?.(state)
          }}
          onFocus={event => {
            control.focus()
            buttonProps.onFocus?.(event)
          }}
          onBlur={event => {
            control.blur()
            buttonProps.onBlur?.(event)
          }}
          type="button"
        />
        <label htmlFor={id} {...labelProps} className="self-center text-xs text-zinc-400" />
      </div>
      <div className="px-4 pb-3 pt-1">{errorId ? <ErrorList id={errorId} errors={errors} /> : null}</div>
    </div>
  )
}
