import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Form, Link, Outlet, useLocation, useMatches, useNavigate, useSubmit } from '@remix-run/react'
import { FaDizzy } from 'react-icons/fa'
import { IoNotifications, IoNotificationsOutline, IoPerson } from 'react-icons/io5'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession, sessionStorage } from '~/session.server'
import { useLiveLoader } from '~/use-live-loader'

import { dashboardGetBranchAndEmployee } from '~/models/dashboard/utils'

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

  return json(
    { employee: data.employee, checkedNotifications, newOrderNotifications },
    { headers: { 'Set-Cookie': await sessionStorage.commitSession(session) } },
  )
}
export async function action({ request, params }: ActionArgs) {
  // const formData = await request.formData()
  return json({ success: true })
}

export default function Dashboard() {
  const data = useLiveLoader() as any
  const location = useLocation()
  const { pathname } = location
  const active = pathname.split('/')[2]

  return (
    <main className="flex flex-col h-screen mx-0 bg-dashb-bg">
      <div className="sticky inset-x-0 top-0 bg-white">
        <Header employee={data.employee} checkedNotifications={data.checkedNotifications} />
      </div>
      <div className="bg-dashb-bg">
        <Outlet />
      </div>
      <div
        className={`dark:bg-mainDark dark:bg-night-bg_principal dark:text-night-text_principal fixed inset-x-0 bottom-0 z-30 m-auto flex w-full max-w-md flex-row items-center justify-between rounded-t-xl bg-day-bg_principal p-4 drop-shadow-md sm:rounded-none`}
      >
        <TabBar active={active} />
      </div>
      <div className="pb-[75px]" />
    </main>
  )
}

export function Header({ employee, checkedNotifications }: { employee: any; checkedNotifications: boolean }) {
  return (
    <nav className="px-[10px] flex justify-between items-center h-[70px] rounded-b-xl shadow-sm">
      <UserDropdown employee={employee} />

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

export function TabBar({ active }: { active: string }) {
  return (
    <div className="flex flex-row items-center justify-between w-full">
      <Link
        to="/dashboard"
        className={clsx(
          'flex space-x-1 items-center justify-center w-1/4 p-2 rounded-lg',
          !active ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        {/* <FaHome className="w-5 h-5 " /> */}
        <span className="text-[15px]">Home</span>
      </Link>
      <Link
        to="tables"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'tables' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        {/* <FaTablets className="w-5 h-5 " /> */}
        <span className="text-[15px]">Mesas</span>
      </Link>
      <Link
        to="products"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'products' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        <span className="text-[15px]">Productos</span>
      </Link>
      <Link
        to="reports"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'reports' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        <span className="text-[15px]">Reportes</span>
      </Link>
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
