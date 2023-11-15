import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Form, Link, NavLink, Outlet, useFetcher, useLocation, useSubmit } from '@remix-run/react'
import React, { useEffect } from 'react'
import { FaChair, FaHome } from 'react-icons/fa'
import { IoNotifications, IoNotificationsOutline, IoPerson, IoRestaurant } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { dashboardGetBranchAndEmployee } from '~/models/dashboard/utils'

import { Button, H3, Modal, PlusIcon } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const employeeId = session.get('employeeId')

  const data = (await dashboardGetBranchAndEmployee(employeeId)) as any

  if (data.error) return redirect('/pos')

  if (!session.get('branchId')) session.set('branchId', data.branch.id)

  const pendingNotifications = await prisma.notification.findMany({
    where: {
      branchId: data.branch.id,
      status: 'pending',
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
  })

  const checkedNotifications = pendingNotifications.length > 0 ? false : true

  const newOrderNotifications = await prisma.notification.findMany({
    where: {
      branchId: data.branch.id,
      status: 'pending',
      type_temp: 'ORDER',
      employees: {
        some: {
          id: employeeId,
        },
      },
    },
  })

  const tables = await prisma.table.findMany({
    where: {
      branchId: data.branch.id,
      order: {
        active: true,
      },
    },
  })

  const payments = await prisma.payments.findMany({
    where: {
      branchId: data.branch.id,
      order: {
        active: true,
      },
    },
  })

  return json(
    { employee: data.employee, checkedNotifications, newOrderNotifications, tables, branch: data.branch, payments },
    { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } },
  )
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const table = formData.get('table') as string

  const session = await getSession(request)
  const employeeId = session.get('employeeId')

  const data = (await dashboardGetBranchAndEmployee(employeeId)) as any
  const isTable = await prisma.table.findFirst({
    where: {
      number: parseInt(table),
      branchId: data.branch.id,
      // order: {
      //   active: true,
      // },
    },
  })

  if (isTable) {
    return redirect(`/dashboard/actions/${isTable.id}`)
  }
  return json({ success: false })
}

export default function Dashboard() {
  const data = useLiveLoader() as any
  const location = useLocation()
  const fetcher = useFetcher()
  const { pathname } = location
  const active = pathname.split('/')[2]
  const [addModal, setAddModal] = React.useState<boolean>(false)
  const [table, setTable] = React.useState('')

  useEffect(() => {
    // Check if the fetcher has finished submitting and was successful
    if (fetcher.data?.success === true) {
      setAddModal(false)

      // If you need to redirect or perform some action after clearing, you can do it here.
    }
  }, [fetcher])

  const notify = data.payments.find(payment => payment.status === 'pending') ? true : false

  return (
    <main className="flex flex-col h-screen mx-0 bg-dashb-bg">
      <div className="sticky inset-x-0 top-0 bg-white">
        <Header employee={data.employee} checkedNotifications={data.checkedNotifications} branchName={data.branch.name} />
      </div>
      <div className="bg-dashb-bg">
        <Outlet />
      </div>
      <div
        className={`dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal fixed inset-x-0 bottom-0 z-40 m-auto flex w-full max-w-md flex-row items-center justify-between rounded-t-xl bg-day-bg_principal px-2 py-4 drop-shadow-md sm:rounded-none`}
      >
        <TabBar active={active} setAddModal={setAddModal} notify={notify} />
      </div>
      <div className="pb-[75px]" />
      {addModal ? (
        <Modal onClose={() => setAddModal(false)} title="Agregar">
          <div className="p-4">
            <H3>Ingresa la mesa</H3>
            <fetcher.Form method="POST" className="flex flex-row space-x">
              <input
                type="number"
                inputMode="numeric"
                onChange={e => setTable(e.target.value)}
                name="table"
                value={table}
                className="w-full h-14"
              />
              <Button size="medium">Submit</Button>
            </fetcher.Form>
          </div>
        </Modal>
      ) : null}
    </main>
  )
}

export function Header({
  employee,
  checkedNotifications,
  branchName,
}: {
  employee: any
  checkedNotifications: boolean
  branchName: string
}) {
  return (
    <nav className="px-[10px] flex justify-between items-center h-[70px] rounded-b-xl shadow-sm">
      <UserDropdown employee={employee} />
      <span className="px-2 truncate">{branchName}</span>
      <NotificationButton checkedNotifications={checkedNotifications} />
    </nav>
  )
}

export function NotificationButton({ checkedNotifications }: { checkedNotifications: boolean }) {
  const location = useLocation()
  const { pathname } = location
  const active = pathname.includes('notifications')
  return (
    <Link to="notifications" className="h-[40px] w-[40px] flex justify-center items-center bg-dashb-bg rounded-md">
      <div className="relative">
        {!checkedNotifications ? <div className="absolute w-2 h-2 rounded-full bg-warning -top-1 -right-1 animate-pulse" /> : null}
        {active ? <IoNotifications className="w-5 h-5" /> : <IoNotificationsOutline className="w-5 h-5" />}
      </div>
    </Link>
  )
}

export function TabBar({ active, setAddModal, notify }: { active: string; setAddModal: any; notify?: boolean }) {
  return (
    <div className="relative flex flex-row items-center justify-between w-full">
      <NavLink
        to="/dashboard"
        className={clsx(
          'flex space-x-1 items-center justify-center w-1/4 p-2 rounded-lg',
          !active ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        <FaHome className="w-4 h-4 " />
        <span className="text-[15px]">Home</span>
      </NavLink>
      <NavLink
        to="tables"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1 relative',
          active === 'tables' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        <FaChair className="w-4 h-4 " />
        <span className="text-[15px]">Mesas</span>
        {notify ? <div className="absolute w-3 h-3 bg-red-200 rounded-full -top-1 -right-1" /> : null}
      </NavLink>
      <NavLink
        to="selectTable"
        prefetch="viewport"
        className={clsx(
          'absolute inset-x-0 -top-14 border rounded-full flex items-center justify-center  p-2 space-x-1 bg-white h-12 w-12  z-30 m-auto',
          active === 'tables' ? 'bg-dashb-buttonSelected text-dashb-text font-bold' : '',
        )}
      >
        {/* <FaTablets className="w-5 h-5 " /> */}
        <span className="text-[15px]">
          <PlusIcon />
        </span>
      </NavLink>
      <NavLink
        to="products"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'products' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        <IoRestaurant className="w-4 h-4 shrink-0" />

        <span className="text-[15px]">Productos</span>
      </NavLink>
      {/* <Link
        to="reports"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'reports' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        <ExclamationTriangleIcon className="w-4 h-4 fill-black" />

        <span className="text-[15px]">Reportes</span>
      </Link> */}
    </div>
  )
}

function UserDropdown({ employee }: { employee: any }) {
  // const user = useUser()

  const submit = useSubmit()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <div
          // to={`/users/${employee.name}`}
          // this is for progressive enhancement
          onClick={e => e.preventDefault()}
          className="flex items-center gap-2 rounded-md bg-dashb-bg py-1 px-3 h-[40px] outline-none   hover:bg-day-600 focus:bg-night-400 radix-state-open:bg-night-400 text-day-principal "
        >
          {/* <img
            className="object-cover w-8 h-8 rounded-full"
            alt={data.user.name ?? data.user.username}
            // src={getUserImgSrc(data.user.imageId)}
            src={data.user.image}
          /> */}
          <IoPerson />
          <span className="text-body-sm ">{employee.name}</span>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="start" className="flex flex-col bg-white border rounded-3xl ">
          {/* bg-[#323232] */}
          <DropdownMenu.Item asChild>
            <Link
              prefetch="intent"
              to={`/users/${employee.id}`}
              className="py-5 outline-none rounded-t-3xl px-7 hover:bg-day-300 radix-highlighted:bg-night-500"
            >
              👤 Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link prefetch="intent" to="notifications" className="py-5 outline-none px-7 hover:bg-night-500 radix-highlighted:bg-night-500">
              🔔 Notificaciones
            </Link>
            {/* </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link prefetch="intent" to="/bookings" className="py-5 outline-none px-7 hover:bg-night-500 radix-highlighted:bg-night-500">
              🚀 Bookings
            </Link>*/}
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className="">
            <Form
              action="/logout?redirectTo=/pos"
              method="POST"
              className="py-5 outline-none rounded-b-3xl px-7 radix-highlighted:bg-night-500 hover:bg-day-300"
              onClick={e => submit(e.currentTarget)}
            >
              <button type="submit">🚪 Logout</button>
            </Form>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
