import { Link, useFetcher, useLoaderData, useLocation, useParams, useSearchParams } from '@remix-run/react'
import { FaPause, FaPlay } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

import { H1 } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const { branchId, employeeId } = params
  const employee = await prisma.employee.findUnique({
    where: {
      id: employeeId,
    },
  })
  return json({ employee })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const id = formData.get('id') as string
  const active = formData.get('active') === 'true'
  console.log('id, availabile', id, active)
  await prisma.employee.update({
    where: {
      id: id,
    },
    data: {
      active: !active,
    },
  })

  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()
  const { employeeId, branchId } = useParams()
  const fetcher = useFetcher()
  const [searchParams, setSearchParams] = useSearchParams()
  console.log('data', data)
  return (
    <div className="space-y-7">
      <H1>Link de QR</H1>
      <p className="border px-2 py-1 rounded-full">{`https://av.fly.dev/${branchId}/waiter-control?employeeId=${employeeId}`}</p>
      <H1>
        {data.employee.name} se encuentra{' '}
        {data.employee.active ? (
          <span className="text-white bg-success rounded-full px-2">Activo</span>
        ) : (
          <span className="text-white bg-warning rounded-full px-2">Inactivo</span>
        )}
      </H1>
      <fetcher.Form method="POST">
        <button className="icon-button w-10 flex items-center justify-center ">
          {data.employee.active ? <FaPause /> : <FaPlay className="fill-green-300" />}
        </button>
        <input type="hidden" name="id" value={data.employee.id} />
        <input type="hidden" name="active" value={data.employee.active} />
      </fetcher.Form>
    </div>
  )
}
