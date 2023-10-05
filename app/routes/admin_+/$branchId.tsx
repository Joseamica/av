import { Link, Outlet, useMatches } from '@remix-run/react'
import { useState } from 'react'

import { type LoaderArgs, type V2_MetaFunction, json } from '@remix-run/node'

import clsx from 'clsx'
import { prisma } from '~/db.server'

import { requireAdmin } from '~/utils/permissions.server'

import MainAdminContainer from '~/components/admin/main-container'

export async function loader({ request, params }: LoaderArgs) {
  const { branchId } = params
  const user = await requireAdmin(request)

  const roles = user?.roles.map(role => role.name)

  if (roles.includes('admin') || roles.includes('moderator')) {
    const data = await prisma.branch.findUnique({
      where: {
        id: branchId,
      },
      include: {
        feedbacks: true,
        tables: { include: { order: true, users: true } },
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

export const meta: V2_MetaFunction = () => {
  return [
    { title: 'Admin' },
    {
      property: 'og:title',
      content: 'Very cool app',
    },
    {
      name: 'description',
      content: 'This app is the best',
    },
  ]
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
      <div className="flex flex-col col-start-1 col-end-3 p-2 space-y-4 bg-white border-r flex-grow">
        <div className="flex flex-col flex-grow space-y-5">
          <h1 className="text-4xl">
            <Link to="">Avoqado</Link>
          </h1>
          {MENU_LINKS.map(link => (
            <div key={link.name}>
              <Link
                to={link.link}
                className={clsx(
                  'p-2 rounded-xl hover:bg-button-primary text-black',
                  active === link.name
                    ? 'underline underline-offset-8 font-bold hover:bg-transparent hover:text-black'
                    : 'hover:text-white',
                )}
                onClick={() => handleMenuClick(link.name, link.subLinks)}
              >
                {link.name}
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-auto">
          <Link
            to={`/users`}
            // this is for progressive enhancement
            onClick={e => e.preventDefault()}
            className="flex items-center gap-2 rounded-full border py-2 pl-2 pr-4 outline-none bg-night-400 hover:bg-night-400 focus:bg-night-400 radix-state-open:bg-night-400 text-white"
          >
            {/* <img
            className="h-8 w-8 rounded-full object-cover"
            alt={data.user.name ?? data.user.username}
            // src={getUserImgSrc(data.user.imageId)}
            src={data.user.image}
          /> */}
            <span className="text-body-sm font-bold">alo</span>
          </Link>
          <Link to="/admin" className="border rounded-full px-2 py-1 bg-button-primary text-white ">
            Select other branch
          </Link>
        </div>
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
