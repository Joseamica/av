import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Form, Link, Outlet, useLocation, useMatches, useNavigate, useSubmit } from '@remix-run/react'
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

  if (data.error) return redirect('/login')

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
  // const [openNotificationModal, setOpenNotificationModal] = React.useState(false)

  // React.useEffect(() => {
  //   setOpenNotificationModal(true)
  // }, [data.newOrderNotifications.length > 0])

  return (
    <main className="flex flex-col  h-screen mx-0 bg-dashb-bg">
      <div className="sticky top-0 inset-x-0  bg-white">
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
      {/* {data.newOrderNotifications.length > 0 && openNotificationModal ? (
        <Dialog.Root open={data.newOrderNotifications.length > 0}>
          <Dialog.Portal>
            <Dialog.Overlay className="bg-blackA6 data-[state=open]:animate-overlayShow fixed inset-0" />
            <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
              <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Edit profile</Dialog.Title>
              <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
                Make changes to your profile here. Click save when you're done.
              </Dialog.Description>

              <div className="mt-[25px] flex justify-end">
                <Dialog.Close asChild>
                  <button className="bg-green4 text-green11 hover:bg-green5 focus:shadow-green7 inline-flex h-[35px] items-center justify-center rounded-[4px] px-[15px] font-medium leading-none focus:shadow-[0_0_0_2px] focus:outline-none">
                    Save changes
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Close asChild>
                <button
                  onClick={() => setOpenNotificationModal(false)}
                  className="text-violet11 hover:bg-violet4 focus:shadow-violet7 absolute top-[10px] right-[10px] inline-flex h-[25px] w-[25px] appearance-none items-center justify-center rounded-full focus:shadow-[0_0_0_2px] focus:outline-none"
                  aria-label="Close"
                >
                  x
                </button>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      ) : null} */}
    </main>
  )
}

export function Header({ employee, checkedNotifications }: { employee: any; checkedNotifications: boolean }) {
  const matches = useMatches()
  const sub = matches.find(match => match?.handle)?.handle?.sub
  const navigate = useNavigate()

  return (
    // <div className="flex w-full justify-between p-4 border rounded-b-md items-center">
    //   {sub ? (
    //     <button onClick={() => navigate(-1)} className=" border h-10 w-10 rounded-full flex justify-center items-center">
    //       <ChevronLeftIcon className="h-7 w-7" />
    //     </button>
    //   ) : (
    //     <Link to="notifications" className="relative border h-10 w-10 rounded-full flex justify-center items-center">
    //       {!checkedNotifications ? <div className="h-4 w-4 bg-warning absolute -top-1 -right-1 rounded-full animate-pulse" /> : null}
    //       <FaBell />
    //     </Link>
    //   )}
    //   <UserDropdown employee={employee} />
    // </div>
    <nav className="px-[10px] flex justify-between items-center h-[70px] rounded-b-xl shadow-sm">
      <UserDropdown employee={employee} />
      {/* <button onClick={() => navigate(-1)} className=" border h-10 w-10 rounded-full flex justify-center items-center">
        <ChevronLeftIcon className="h-7 w-7" />
      </button> */}
      <NotificationButton />
    </nav>
  )
}

export function NotificationButton() {
  const location = useLocation()
  const { pathname } = location
  const active = pathname.includes('notifications')
  return (
    <Link to="notifications" className="h-[40px] w-[40px] flex justify-center items-center bg-dashb-bg rounded-md">
      <div className="relative">
        {true ? <div className="h-2 w-2 bg-warning absolute -top-1 -right-1 rounded-full animate-pulse" /> : null}
        {active ? <IoNotifications className="h-5 w-5" /> : <IoNotificationsOutline className="h-5 w-5" />}
      </div>
    </Link>
  )
}

export function TabBar({ active }: { active: string }) {
  return (
    <div className="flex flex-row justify-between w-full items-center">
      <Link
        to="/dashboard"
        className={clsx(
          'flex space-x-1 items-center justify-center w-1/4 p-2 rounded-lg',
          !active ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        {/* <FaHome className="h-5 w-5 " /> */}
        <span className="text-[15px]">Home</span>
      </Link>
      <Link
        to="orders?active=true"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'orders' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        {/* <OrderIcon className="h-5 w-5 " /> */}
        <span className="text-[15px]">Ordenes</span>
      </Link>
      <Link
        to="payments?status=pending"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'payments' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        {/* <CashIcon className="h-5 w-5 " /> */}
        <span className="text-[15px]">Pagos</span>
      </Link>
      <Link
        to="tables"
        className={clsx(
          'flex items-center justify-center w-1/4 p-2 rounded-lg space-x-1',
          active === 'tables' ? 'bg-dashb-bg text-dashb-text font-bold' : '',
        )}
      >
        {/* <FaTablets className="h-5 w-5 " /> */}
        <span className="text-[15px]">Mesas</span>
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
            className="h-8 w-8 rounded-full object-cover"
            alt={data.user.name ?? data.user.username}
            // src={getUserImgSrc(data.user.imageId)}
            src={data.user.image}
          /> */}
          <IoPerson />
          <span className="text-body-sm  ">{employee.name}</span>
        </div>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="start" className="flex flex-col rounded-3xl border bg-white ">
          {/* bg-[#323232] */}
          <DropdownMenu.Item asChild>
            <Link
              prefetch="intent"
              to={`/users/${employee.id}`}
              className="rounded-t-3xl px-7 py-5 outline-none hover:bg-day-300 radix-highlighted:bg-night-500"
            >
              👤 Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link prefetch="intent" to="notifications" className="px-7 py-5 outline-none hover:bg-night-500 radix-highlighted:bg-night-500">
              🔔 Notificaciones
            </Link>
            {/* </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link prefetch="intent" to="/bookings" className="px-7 py-5 outline-none hover:bg-night-500 radix-highlighted:bg-night-500">
              🚀 Bookings
            </Link>*/}
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild className="">
            <Form
              action="/logout"
              method="POST"
              className="rounded-b-3xl px-7 py-5 outline-none radix-highlighted:bg-night-500 hover:bg-day-300"
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
