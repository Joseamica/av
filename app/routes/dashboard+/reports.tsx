import { Link, useLoaderData } from '@remix-run/react'
import { IoCard, IoList, IoPerson, IoShieldCheckmarkOutline } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { formatCurrency } from '~/utils'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const employeeId = session.get('employeeId')
  const feedbacks = await prisma.feedback.findMany({
    where: {
      branchId,
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
  })

  return json({ feedbacks })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Reports() {
  const data = useLoaderData()
  return <div>Reports</div>
}

export function Table({ to, clients, products, tableNumber }: { to: string; clients: string; products: any; tableNumber: string }) {
  const total = products?.reduce((acc, curr) => {
    return Number(acc) + Number(curr.price)
  }, 0)

  return (
    <Link to={products ? to : ''} className="w-full  relative flex items-center justify-between space-x-4" preventScrollReset>
      <div className="border rounded-lg flex justify-around w-full">
        <div className="flex justify-center items-center  bg-dashb-bg w-14 rounded-lg">
          <p className="text-3xl">{tableNumber}</p>
        </div>
        <div className="flex flex-row  divide-x divide-gray-300 items-center w-full h-full  bg-white rounded-lg  ">
          <TableContainer title="Clientes" value={clients} icon={<IoPerson className="bg-indigo-500 rounded-sm p-1 fill-white" />} />
          <TableContainer
            title="Productos"
            value={products?.length}
            icon={<IoList className="bg-[#F19F82] rounded-sm p-1 fill-white text-white" />}
          />
          <TableContainer
            title="Total"
            value={total ? formatCurrency('$', total || 0) : null}
            icon={<IoCard className="bg-[#548AF7] rounded-sm p-1 fill-white" />}
          />
        </div>
      </div>
      <div className=" right-2">
        <IoShieldCheckmarkOutline />
      </div>
    </Link>
  )
}

export function TableContainer({ title, value, icon }: { title: string; value: string | number; icon: JSX.Element }) {
  return (
    <div className="flex flex-col space-y-1  px-3 py-2 w-full">
      <div />
      <div className="flex flex-row space-x-2 items-center ">
        {icon}
        <span className="text-xs font-medium">{title}</span>
      </div>
      <p className="text-sm font-bold">{value ? value : '-'}</p>
    </div>
  )
}
