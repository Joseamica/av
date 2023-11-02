import { Form, Link, Outlet, useFetcher, useLoaderData, useNavigate } from '@remix-run/react'
import React from 'react'
import { FaEdit, FaPause, FaPlay } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'

import { Button, FlexRow, H1, H2, H4, Modal, Spacer } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const { branchId, modifierId } = params
  const modifier = await prisma.modifiers.findFirst({
    where: {
      id: modifierId,
    },
    include: {
      modifierGroups: true,
    },
  })
  const modifierGroups = await prisma.modifierGroup.findMany({
    where: {
      branchId,
    },
  })
  return json({ modifier, modifierGroups })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const { modifierId } = params
  const modifierGroupId = formData.get('modifierGroupId') as string
  const isAvailable = formData.get('isAvailable') as string

  if (isAvailable === 'true') {
    await prisma.modifiers.update({
      where: {
        id: modifierId,
      },
      data: {
        available: false,
      },
    })
  } else if (isAvailable === 'false') {
    await prisma.modifiers.update({
      where: {
        id: modifierId,
      },
      data: {
        available: true,
      },
    })
  }

  if (modifierGroupId) {
    await prisma.modifiers.update({
      where: {
        id: modifierId,
      },
      data: {
        modifierGroupId,
      },
    })
  }
  return json({ success: true })
}

export default function ModifierId() {
  const data = useLoaderData()

  const [modifierGroupId, setModifierGroupId] = React.useState<string>(data.modifier?.modifierGroupId || '')
  const navigate = useNavigate()
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  return (
    <>
      <Modal className="p-4" onClose={() => navigate(-1)} title={data.modifier.name}>
        <div className="p-2">
          <FlexRow>
            <H2>Estado</H2>
            <div
              className={clsx('h-3 w-3 rounded-full', {
                'bg-green-500': data.modifier.available,
                'bg-red-500': !data.modifier.available,
              })}
            />
          </FlexRow>

          <fetcher.Form className="flex flex-row space-x-2 justify-between" method="POST">
            <button
              className="flex flex-row space-x-2 items-center border px-2 py-1 rounded-lg"
              disabled={isSubmitting}
              name="isAvailable"
              value={data.modifier.available}
            >
              {data.modifier.available ? (
                <>
                  <p>Pausar</p>
                  <FaPause />
                </>
              ) : (
                <>
                  <p>Resumir</p>
                  <FaPlay className="fill-green-300" />
                </>
              )}
            </button>
            <Link to="edit" className="flex flex-row space-x-2 items-center border px-2 py-1 rounded-lg">
              <p>Editar</p>
              <FaEdit />
            </Link>
          </fetcher.Form>

          <Spacer spaceY="2" />
          <fetcher.Form method="POST" className="border rounded-lg p-1">
            <H2>Grupo de modificadores</H2>
            <div className="p-2 ">
              {data.modifierGroups?.map(md => {
                return (
                  <div key={md.id} className="flex items-center space-x-2">
                    <label htmlFor="md">
                      <input
                        id="md"
                        className="h-7 w-7"
                        type="radio"
                        onChange={() => setModifierGroupId(md.id)}
                        checked={modifierGroupId === md.id}
                      />
                    </label>
                    <span> {md.name}</span>
                  </div>
                )
              })}
            </div>
            <Button disabled={isSubmitting}>Agregar al grupo modificador</Button>
            <input type="hidden" name="modifierGroupId" value={modifierGroupId} />
          </fetcher.Form>
        </div>
      </Modal>
      <Outlet />
    </>
  )
}
