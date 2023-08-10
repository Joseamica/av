import { Form, useNavigate, useSearchParams } from '@remix-run/react'
import React from 'react'

import { type ActionArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'

import { Button, Modal } from '~/components'

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const create = formData.get('_create') as string
  const name = formData.get('name') as string
  if (create) {
    await prisma.restaurant.create({
      data: {
        name,
      },
    })
  }
  return json({ success: true })
}

export default function AdminAddRest() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()

  const onClose = () => {
    navigate('/admin')
  }
  return (
    <Modal title="Add Restaurant" onClose={onClose}>
      <Form method="post">
        <label htmlFor="name" className="capitalize">
          Nombre
        </label>
        <input
          type="text"
          required
          name="name"
          id="name"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />
        {/* <label htmlFor="type" className="capitalize">
        Tipo de menu
      </label>
      <input type="text" required name="type" id="type" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />
      <label htmlFor="image" className="capitalize">
        Imagen
      </label>
      <input type="url" required name="image" id="image" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />
      <label htmlFor="currency" className="capitalize">
        Moneda
      </label>
      <input
        type="text"
        required
        name="currency"
        id="currency"
        className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        placeholder="euro"
      /> */}
        <Button name="_create" value="rest" fullWith={true}>
          Crear restaurante
        </Button>
      </Form>
    </Modal>
  )
}
