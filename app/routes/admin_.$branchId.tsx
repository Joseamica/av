import { Link, Outlet, useMatches } from '@remix-run/react'
import { useState } from 'react'

import { type LoaderArgs, json, redirect } from '@remix-run/node'

import clsx from 'clsx'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { requireAdmin } from '~/utils/permissions.server'

import MainAdminContainer from '~/components/admin/main-container'

export async function loader({ request, params }: LoaderArgs) {
  const { branchId } = params

  const session = await getSession(request)
  const userId = session.get('userId')
  if (!userId) {
    return redirect('/login')
  }

  const userRoles = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  })

  const roles = userRoles?.roles.map(role => role.name)

  if (roles.includes('admin') || roles.includes('moderator')) {
    const data = await prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      include: {
        feedbacks: true,
        tables: true,
        orders: {
          include: {
            cartItems: true,
          },
        },

        menus: {
          include: {
            availabilities: true,
            categories: {
              orderBy: {
                name: 'asc',
              },
              include: {
                products: {
                  orderBy: {
                    name: 'asc',
                  },
                },
              },
            },
          },
        },
        notifications: true,
        payments: true,
        employees: true,
        users: true,
      },
    })

    const branch = {
      ...data,
      availabilities: data.menus.flatMap(menu => menu.availabilities),
      categories: await prisma.category.findMany({
        where: {
          menu: {
            some: {
              branchId: branchId,
            },
          },
        },
        include: {
          products: true,
          menu: true,
        },
      }),
      products: data.menus.flatMap(menu => menu.categories.flatMap(category => category.products)),
    }

    return json({ branch })
  }

  throw json({ error: 'Unauthorized', requiredRole: 'admin' }, { status: 403 })
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
      <div className="flex flex-col col-start-1 col-end-3 p-2 space-y-4 bg-white border-r">
        <h1 className="text-4xl">
          <Link to="">Avoqado</Link>
        </h1>
        {MENU_LINKS.map(link => (
          <div key={link.name}>
            <Link
              to={link.link}
              className={clsx(
                'p-2 rounded-xl hover:bg-button-primary text-black',
                active === link.name ? 'underline underline-offset-8 font-bold hover:bg-transparent hover:text-black' : 'hover:text-white',
              )}
              onClick={() => handleMenuClick(link.name, link.subLinks)}
            >
              {link.name}
            </Link>
            {/* {activeSubmenu === link.name && link.subLinks && (
              <div className="flex flex-col pt-2 pl-4 space-y-2">
                {link.subLinks.map(subLink => (
                  <Link to={'menus/' + subLink} key={subLink} className="capitalize">
                    {subLink}
                  </Link>
                ))}
              </div>
            )} */}
          </div>
        ))}
        <Link to="/admin">Select other branch</Link>
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
