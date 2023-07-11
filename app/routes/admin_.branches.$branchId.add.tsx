import {type ActionArgs, json, redirect} from '@remix-run/node'
import {useLoaderData, useSearchParams, useNavigate, Form} from '@remix-run/react'
import React, {useState} from 'react'
import {Button, FlexRow, Modal, Spacer} from '~/components'
import {prisma} from '~/db.server'

// await prisma.menu.create({
//     data: {
//       name,
//       image,
//       currency,
//       allday: allDay,
//       type,
//       branchId: branchId,
//     },
//   })

export async function action({request, params}: ActionArgs) {
  const {branchId} = params
  const formData = await request.formData()

  const _create = formData.get('_create') as string

  switch (_create) {
    case 'menu':
      const name = formData.get('name') as string
      const image = formData.get('image') as string
      const currency = formData.get('currency') as string
      const allday = formData.get('allday') === 'on' ? true : false
      const type = formData.get('type') as string

      await prisma.menu.create({
        data: {
          name,
          image,
          currency,
          allday,
          type,
          branchId: branchId,
        },
      })
      break
    case 'table':
      const number = formData.get('tableNumber') as string
      await prisma.table.create({
        data: {
          table_number: Number(number),
          branchId: branchId,
          order_in_progress: false,
        },
      })
  }

  return redirect(`/admin/branches/${branchId}`)
}

export default function Add() {
  const data = useLoaderData()

  const [searchParams] = useSearchParams()

  const addTable = searchParams.get('type') === 'table'
  const addMenu = searchParams.get('type') === 'menu'
  const addUser = searchParams.get('type') === 'user'

  if (addTable) {
    return <AddTable />
  } else if (addMenu) {
    return <AddMenu />
  } else if (addUser) {
    return <AddUser />
  } else {
    throw new Error('No tienes permisos para acceder a esta pagina')
  }
}

export function AddTable() {
  return (
    <Form method="post">
      <label htmlFor="tableNumber" className="capitalize">
        Numero
      </label>
      <input
        type="number"
        required
        name="tableNumber"
        id="tableNumber"
        min={0}
        className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full px-3 dark:ring-1"
      />
      {/* <label htmlFor="waiter" className="capitalize">
        Mesero
      </label>
      <FlexRow>
        <input
          type="text"
          required
          name="waiter"
          id="waiter"
          onChange={e => e.target.value}
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />
        <Button
          onClick={e => setWaiters([...waiters])}
          type="button"
          size="small"
        >
          Agregar
        </Button>
        <div>
          {waiters.map((waiter, index) => (
            <div key={index}>{waiter}</div>
          ))}
        </div>
      </FlexRow> */}
      <Spacer spaceY="2" />
      <Button name="_create" value="table" fullWith={true}>
        Crear mesa
      </Button>
    </Form>
  )
}

export function AddMenu() {
  return (
    <Form method="post" className="pl-2">
      <label htmlFor="name" className="capitalize">
        Nombre
      </label>
      <input
        type="text"
        required
        name="name"
        id="name"
        className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full px-3 dark:ring-1"
      />
      <label htmlFor="type" className="capitalize">
        Tipo de menu
      </label>
      <input
        type="text"
        required
        name="type"
        id="type"
        className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full px-3 dark:ring-1"
      />
      <label htmlFor="image" className="capitalize">
        Imagen
      </label>
      <input
        type="url"
        required
        name="image"
        id="image"
        className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full px-3 dark:ring-1"
      />
      <label htmlFor="currency" className="capitalize">
        Moneda
      </label>
      <input
        type="text"
        required
        name="currency"
        id="currency"
        className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full px-3 dark:ring-1"
        placeholder="euro"
      />
      <FlexRow>
        <label htmlFor="allDay" className="shrink-0">
          Todo el dia?
        </label>
        <input type="checkBox" required name="allday" id="allDay" className="dark:bg-DARK_2 dark:ring-DARK_4 w-full " />
      </FlexRow>
      <Button name="_create" value="menu" fullWith={true}>
        Crear menu
      </Button>
    </Form>
  )
}

export function AddUser() {
  return <Form method="post">User</Form>
}
