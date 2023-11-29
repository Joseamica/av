import { Form, useActionData, useLoaderData } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { Button } from '~/components'
import { ErrorList } from '~/components/forms'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const employeeId = session.get('employeeId')

  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  })
  if (!employeeId) {
    return redirect('/pos')
  }
  return json({ employee })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const name = formData.get('name') as string
  const code = formData.get('code') as string
  const phone = formData.get('phone') as string

  const session = await getSession(request)
  const employeeId = session.get('employeeId')

  const usedCode = await prisma.employee.findFirst({
    where: {
      id: {
        not: {
          equals: employeeId,
        },
      },
      code,
    },
  })

  if (usedCode) {
    return json({ error: 'El código ya está en uso' })
  }

  await prisma.employee.update({
    where: {
      id: employeeId,
    },
    data: {
      name,
      code,
      phone,
    },
  })
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  const actionData = useActionData()
  return (
    <div>
      <Form method="POST" className="w-full p-4">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Nombre
        </label>
        <div className="mt-1">
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={20}
            defaultValue={data.employee.name}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700">
          Código
        </label>
        <div className="mt-1">
          <input
            id="code"
            name="code"
            type="text"
            autoComplete="code"
            maxLength={4}
            defaultValue={data.employee.code}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
          Teléfono
        </label>
        <div className="mt-1">
          <input
            id="phone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="phone"
            maxLength={20}
            defaultValue={data.employee.phone}
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        {actionData?.error ? (
          <ErrorList errors={[actionData?.error]} />
        ) : actionData?.success ? (
          <p className="text-green-500">Datos guardados</p>
        ) : null}

        <Button>Guardar</Button>
      </Form>
    </div>
  )
}
