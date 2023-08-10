import { Link, Outlet, useMatches } from '@remix-run/react'

import { type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'
import { getSession, getUserId } from '~/session.server'

import { isUserAdmin } from '~/models/admin.server'

import MainAdminContainer from '~/components/admin/main-container'

export async function loader({ request, params }: LoaderArgs) {
  const session = await getSession(request)
  const userId = await getUserId(session)
  const isAdmin = await isUserAdmin(userId)
  if (!isAdmin) {
    return redirect(`/login`)
  }
  const admin = await prisma.admin.findFirst({
    where: {
      userId,
    },
    include: {
      branches: true,
      orders: true,
      tables: true,
      restaurants: true,
      user: true,
    },
  })

  return json({ admin })
}

export default function AdminBranch() {
  const matches = useMatches()

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
      <div className="col-start-3 col-end-10 ">
        <Outlet />
      </div>
    </MainAdminContainer>
  )
}
const MENU_LINKS = [
  // { name: 'Restaurants', link: 'restaurants' },
  { name: 'Tables', link: 'tables' },
  { name: 'Orders', link: 'orders' },
  { name: 'Users', link: 'users' },
  { name: 'Employees', link: 'employees' },
  { name: 'Categories', link: 'categories' },
  { name: 'Products', link: 'products' },
  { name: 'Payments', link: 'payments' },
  { name: 'Notifications', link: 'notifications' },
]
