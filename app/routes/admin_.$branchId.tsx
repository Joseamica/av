import { Link, Outlet, useMatches } from '@remix-run/react'

import { type LoaderArgs, type V2_MetaFunction, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession, getUserId } from '~/session.server'

import { isUserAdmin } from '~/models/admin.server'

import MainAdminContainer from '~/components/admin/main-container'

export async function loader({ request, params }: LoaderArgs) {
  const { branchId } = params

  const session = await getSession(request)
  const userId = await getUserId(session)
  const isAdmin = await isUserAdmin(userId)

  if (!isAdmin) {
    return redirect(`/login`)
  }

  const branch = await prisma.branch.findFirst({
    where: {
      id: branchId,
    },
    include: {
      employees: true,
      feedbacks: true,
      tables: true,
      menuCategories: true,
      menuItems: true,
      menus: {
        include: {
          menuCategories: {
            include: {
              menuItems: true,
            },
          },
        },
      },
      orders: {
        include: {
          cartItems: true,
        },
      },
      payments: true,
      users: true,
    },
  })

  return json({ branch })
}

export default function AdminBranch() {
  const matches = useMatches()
  // console.log('useMatches', matches)
  const active = matches.find(match => match.handle)?.handle?.active

  // const showRestLogo = matches.find(match => match.handle)?.handle?.showRestLogo
  // const restIdData = matches.find(match => match.id === 'routes/admin.rest_.$restId')?.data
  // const branchIdData = matches.find(match => match.id === 'routes/admin.rest_.$restId.branches')?.data

  return (
    <MainAdminContainer>
      <div className="col-start-1 col-end-3 bg-white flex flex-col p-2 space-y-4">
        <h1 className="text-4xl">Avoqado</h1>
        {MENU_LINKS.map(link => (
          <Link key={link.name} to={link.link} className={clsx('p-2 rounded-xl', active === link.name && 'underline underline-offset-4')}>
            {link.name}
          </Link>
        ))}
      </div>
      <div className="col-start-3 col-end-10 p-4">
        <Outlet />
      </div>
    </MainAdminContainer>
  )
}
const MENU_LINKS = [
  // { name: 'Restaurants', link: 'restaurants' },
  { name: 'Menus', link: 'menus' },
  { name: 'Tables', link: 'tables' },
  { name: 'Orders', link: 'orders' },
  { name: 'Users', link: 'users' },
  { name: 'Employees', link: 'employees' },
  { name: 'Categories', link: 'categories' },
  { name: 'Products', link: 'products' },
  { name: 'Payments', link: 'payments' },
  { name: 'Notifications', link: 'notifications' },
]

export const meta: V2_MetaFunction<typeof loader> = ({ data, params }) => {
  return [
    { title: `${'a'} | Epic Notes` },
    {
      name: 'description',
      content: `Profile of ${'a'} on Epic Notes`,
    },
  ]
}
