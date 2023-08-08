import { Form, useNavigate, useSearchParams } from '@remix-run/react'
import React, { useState } from 'react'

import { type ActionArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'

import { Button, Modal } from '~/components'

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData.entries())
  console.log('data', data)
  return json({ success: true })
}

export default function AdminAddBranch() {
  const [tipPercentages, setTipPercentages] = useState(['10', '12', '15'])
  const navigate = useNavigate()

  const onClose = () => {
    navigate('/admin')
  }

  const handleTipPercentageChange = e => {
    setTipPercentages(e.target.value.split(','))
  }
  return (
    <Modal title="Add Restaurant" onClose={onClose}>
      <Form method="post" className="pl-2">
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

        <label htmlFor="timezone" className="capitalize">
          Zona Horaria
        </label>
        <input type="text" name="timezone" id="timezone" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />

        <label htmlFor="language" className="capitalize">
          Idioma
        </label>
        <input type="text" name="language" id="language" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />

        <label htmlFor="ppt_image" className="capitalize">
          Imagen PPT
        </label>
        <input
          type="url"
          name="ppt_image"
          id="ppt_image"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />

        <label htmlFor="email" className="capitalize">
          Correo Electrónico
        </label>
        <input
          type="email"
          required
          name="email"
          id="email"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />

        <label htmlFor="phone" className="capitalize">
          Teléfono
        </label>
        <input type="text" name="phone" id="phone" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />

        <label htmlFor="city" className="capitalize">
          Ciudad
        </label>
        <input
          type="text"
          required
          name="city"
          id="city"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />

        <label htmlFor="address" className="capitalize">
          Dirección
        </label>
        <input
          type="text"
          required
          name="address"
          id="address"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />

        <label htmlFor="extraAddress" className="capitalize">
          Dirección Adicional
        </label>
        <input
          type="text"
          name="extraAddress"
          id="extraAddress"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />

        <label htmlFor="cuisine" className="capitalize">
          Cocina
        </label>
        <input type="text" name="cuisine" id="cuisine" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />

        <label htmlFor="wifiName" className="capitalize">
          Nombre de WiFi
        </label>
        <input type="text" name="wifiName" id="wifiName" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />

        <label htmlFor="wifipwd" className="capitalize">
          Contraseña de WiFi
        </label>
        <input type="text" name="wifipwd" id="wifipwd" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />

        <label htmlFor="coordinates" className="capitalize">
          Coordenadas
        </label>
        <input
          type="text"
          name="coordinates"
          id="coordinates"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
        />

        <label htmlFor="open" className="capitalize">
          Hora de Apertura
        </label>
        <input type="number" name="open" id="open" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />

        <label htmlFor="close" className="capitalize">
          Hora de Cierre
        </label>
        <input type="number" name="close" id="close" className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1" />
        <label htmlFor="tipsPercentages" className="capitalize">
          Porcentajes de Propinas
        </label>
        <input
          type="text"
          name="tipsPercentages"
          id="tipsPercentages"
          className="w-full px-3 rounded-full dark:bg-DARK_2 dark:ring-DARK_4 dark:ring-1"
          value={tipPercentages.join(',')}
          onChange={handleTipPercentageChange}
        />
        {/* Additional fields like Json, arrays, or relationships might need special handling */}

        <Button name="_create" value="branch" fullWith={true}>
          Crear sucursal
        </Button>
      </Form>
    </Modal>
  )
}
