import { Link, useLoaderData } from '@remix-run/react'
import { IoCashOutline, IoList, IoPerson } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const branchId = session.get('branchId')
  const employeeId = session.get('employeeId')
  const payments = await prisma.payments.findMany({
    where: {
      branchId: branchId,
      status: 'accepted',
      // employees: {
      //   some: {
      //     id: employeeId,
      //   },
      // },
      // createdAt: {
      //   gte: new Date()
      // }
    },
    include: {
      employees: true,
    },
  })

  const orders = await prisma.order.findMany({
    where: {
      branchId: branchId,
    },
  })

  const tips = payments.reduce((acc, curr) => Number(acc) + Number(curr.tip), 0)

  const tables = await prisma.table.findMany({
    where: {
      branchId: branchId,
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
    include: {
      order: true,
    },
  })
  return json({ tables, tips, orders, payments })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function Name() {
  const data = useLoaderData()

  const activeTables = data.tables.filter(table => table.order !== null)
  return (
    <div className="flex flex-wrap gap-1 p-4">
      <Container
        title="Mesas activas"
        icon={<IoPerson />}
        value={activeTables.length}
        desc={activeTables.length === 1 ? 'mesa' : 'mesas'}
        to="/dashboard/tables"
        bg="bg-purple-400"
      />
      <Container
        title="Propinas"
        icon={<IoCashOutline />}
        value={`$${data.tips}`}
        desc={'propinas acumuladas'}
        to="tips"
        bg="bg-green-400"
      />
      <Container title="Ordenes atendidas" icon={<IoList />} value={`${data.orders.length}`} desc={'ordenes'} to="" bg="bg-blue-400" />
      <Container
        title="Total de pagos"
        icon={<IoCashOutline />}
        value={data.payments.length}
        desc={'pagos realizados'}
        to=""
        bg="bg-violet-400"
      />
      {/*    <Container title="Propinas" icon={<FaMoneyBill />} value={`MX$${data.tips}`} desc={'en propinas'} bg={'bg-green-100'} />
      <Container title="Total de ordenes" bg={'bg-orange-300'} icon={<OrderIcon />} value={'45'} desc={'ordenes atendidas'} /> */}
    </div>
  )
}

function Container({
  title,
  icon,
  value,
  desc,
  bg,
  to,
}: {
  title: string
  icon?: React.ReactNode
  value?: string
  desc?: string
  bg?: string
  to: string
}) {
  return (
    <Link className={`relative w-40 h-32 flex justify-center items-center border rounded-lg ${bg}`} to={to}>
      <div className="absolute top-0 inset-x-0 pl-[10px] border-b-2 bg-white">
        <p className="overflow-hidden truncate">{title}</p>
      </div>

      <div className="flex flex-col items-center justify-center pt-4 text-center ">
        {icon}
        <p className="text-lg font-bold">{value}</p>
        <p className="text-sm">{desc}</p>
      </div>
    </Link>
  )
}
