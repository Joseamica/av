import { Link, Outlet, useMatches } from '@remix-run/react'
import { useState } from 'react'

import { type LoaderArgs, json, redirect } from '@remix-run/node'

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

  const admin = await prisma.admin.findFirst({
    where: {
      access: { gte: 2 },
      branches: {
        some: {
          id: branchId,
        },
      },
    },
    include: {
      availabilities: { orderBy: { dayOfWeek: 'asc' } },
      menuCategories: {
        orderBy: { name: 'asc' },
        include: {
          menu: true,
        },
      },
      menuItems: true,
      menus: {
        orderBy: { name: 'desc' },
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
      feedbacks: true,
      tables: true,
      employees: true,
      branches: true,
      user: true,
    },
  })

  const branch = admin

  return json({ branch })
}

export default function AdminBranch() {
  const matches = useMatches()
  // console.log('useMatches', matches)
  const active = matches.find(match => match.handle)?.handle?.active
  const [activeSubmenu, setActiveSubmenu] = useState(null)

  const handleMenuClick = (menuName, subLinks) => {
    if (subLinks) {
      setActiveSubmenu(activeSubmenu === menuName ? null : menuName)
    }
  }

  return (
    <MainAdminContainer>
      <div className="col-start-1 col-end-3 bg-white flex flex-col p-2 space-y-4 border-r">
        <h1 className="text-4xl">
          <Link to="">Avoqado</Link>
        </h1>
        {MENU_LINKS.map(link => (
          <div key={link.name}>
            <Link
              to={link.link}
              className={clsx(
                'p-2 rounded-xl hover:bg-button-primary ',
                active === link.name ? 'underline underline-offset-8 font-bold hover:bg-transparent hover:text-black' : 'hover:text-white',
              )}
              onClick={() => handleMenuClick(link.name, link.subLinks)}
            >
              {link.name}
            </Link>
            {/* {activeSubmenu === link.name && link.subLinks && (
              <div className="pl-4 pt-2 flex flex-col space-y-2">
                {link.subLinks.map(subLink => (
                  <Link to={'menus/' + subLink} key={subLink} className="capitalize">
                    {subLink}
                  </Link>
                ))}
              </div>
            )} */}
          </div>
        ))}
        <Link to="/logout" className="bottom-5 absolute self-center icon-button w-24 text-center">
          Logout
        </Link>
      </div>
      <div className="col-start-3 col-end-10 bg-white">
        <Outlet />
      </div>
    </MainAdminContainer>
  )
}
const MENU_LINKS = [
  // { name: 'Restaurants', link: 'restaurants' },

  { name: 'Menus', link: 'menus', subLinks: ['availabilities', 'categories'] },
  { name: 'Tables', link: 'tables' },
  { name: 'Orders', link: 'orders' },
  { name: 'Users', link: 'users' },
  { name: 'Employees', link: 'employees' },
  { name: 'Categories', link: 'categories' },
  { name: 'Products', link: 'products' },
  { name: 'Payments', link: 'payments' },
  { name: 'Notifications', link: 'notifications' },
  { name: 'Feedbacks', link: 'feedbacks' },
  { name: 'Availabilities', link: 'availabilities' },
]
