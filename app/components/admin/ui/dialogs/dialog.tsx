import * as Dialog from '@radix-ui/react-dialog'
import { useSearchParams } from '@remix-run/react'
import React from 'react'

import { XIcon } from '~/components/icons'

export function QueryDialog({
  title,
  description,
  children,
  query,
  value,
  ...props
}: {
  title?: string
  description?: string
  children: React.ReactNode
  query: string
  value?: string
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const getQuery = searchParams.get(query)

  const handleOnOpenChange = param => {
    searchParams.delete(param)
    setSearchParams(searchParams)
  }

  return (
    <Dialog.Root
      open={getQuery === value || (!value && getQuery) ? true : false}
      onOpenChange={() => {
        handleOnOpenChange(query)
      }}
    >
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
      <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <Dialog.Close className="absolute top-0 right-0 m-3">
          <XIcon />
        </Dialog.Close>
        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">{title ? title : getQuery}</Dialog.Title>
        <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">{description}</Dialog.Description>
        {children}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export function ScrollableQueryDialog({
  title,
  description,
  children,
  query,
  value,
  ...props
}: {
  title?: string
  description?: string
  children: React.ReactNode
  query: string
  value?: string
}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const getQuery = searchParams.get(query)

  const handleOnOpenChange = param => {
    searchParams.delete(param)
    setSearchParams(searchParams)
  }

  return (
    <Dialog.Root
      open={getQuery === value || (!value && getQuery) ? true : false}
      onOpenChange={() => {
        handleOnOpenChange(query)
      }}
    >
      <Dialog.Overlay className="fixed top-0 left-0 right-0 bottom-0 grid place-items-center overflow-y-auto bg-black bg-opacity-80">
        <Dialog.Close className="absolute top-0 right-0 m-3">
          <XIcon />
        </Dialog.Close>
        <Dialog.Content className="bg-white p-8 rounded-md min-w-[450px]">
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">{title ? title : getQuery}</Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">{description}</Dialog.Description>
          {children}
        </Dialog.Content>
      </Dialog.Overlay>
    </Dialog.Root>
  )
}
