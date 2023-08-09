import { Link, useLoaderData, useSearchParams } from '@remix-run/react'

import { type LoaderArgs, json, redirect } from '@remix-run/node'

import { type Restaurant } from '@prisma/client'
import { prisma } from '~/db.server'
import { getSession, getUserId } from '~/session.server'

import MainAdminContainer from '~/components/admin/main-container'
import { RestLogo } from '~/components/admin/ui/rest-logo'

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request)
  const userId = await getUserId(session)
  const isAdmin = await prisma.admin.findFirst({
    where: {
      userId: userId,
      access: { gte: 2 },
    },
    include: {
      user: true,
      branches: true,
      orders: true,
      restaurants: true,
      tables: true,
    },
  })

  if (!isAdmin) {
    return redirect(`/unauthorized`)
  }

  // const url = new URL(request.url)
  // const searchParams = new URLSearchParams(url.search)
  // const restId = searchParams.get('restId')

  return json({ isAdmin })
}

export default function Admin() {
  const data = useLoaderData()

  const [searchParams] = useSearchParams()
  const restId = searchParams.get('restId')

  if (restId) {
    return <RestId />
  }

  return (
    <MainAdminContainer>
      {data.isAdmin.restaurants.map((restaurant: Restaurant) => {
        return (
          <Link to={`/admin?restId=${restaurant.id}`} key={restaurant.id}>
            <div className="flex flex-col items-center justify-center w-32 h-32 bg-white rounded-lg shadow-lg">
              <div className="text-2xl font-bold text-gray-800">{restaurant.name}</div>
            </div>
          </Link>
        )
      })}
    </MainAdminContainer>
  )
}

const REST_LINKS = ['Menu']

function RestId() {
  return (
    <MainAdminContainer>
      <div className="col-start-1 col-end-3 bg-blue-200">{/* <RestLogo imgSrc={restaurant.logo} /> */}</div>
      <div className="col-start-3 col-end-8 bg-green-200">b</div>
    </MainAdminContainer>
  )
}

// import { Link, Outlet, useLoaderData } from '@remix-run/react'

// import { type LoaderArgs, json, redirect } from '@remix-run/node'

// import { prisma } from '~/db.server'
// import { getSession, getUserId } from '~/session.server'

// import MainAdminContainer from '~/components/admin/main-container'

// export const loader = async ({ request }: LoaderArgs) => {
//   const session = await getSession(request)
//   const userId = await getUserId(session)
//   const isAdmin = await prisma.admin.findFirst({
//     where: {
//       userId: userId,
//       access: { gte: 2 },
//     },
//     include: {
//       user: true,
//       branches: true,
//       orders: true,
//       restaurants: true,
//       tables: true,
//     },
//   })

//   if (!isAdmin) {
//     return redirect(`/unauthorized`)
//   }

//   // const url = new URL(request.url)
//   // const searchParams = new URLSearchParams(url.search)
//   // const restId = searchParams.get('restId')

//   return json({ isAdmin })
// }

// const MENU_LINKS = [
//   { name: 'Restaurants', link: 'restaurants' },
//   { name: 'Orders', link: 'orders' },
//   { name: 'Branches', link: 'branches' },
//   { name: 'Tables', link: 'tables' },
//   { name: 'Users', link: 'users' },
//   { name: 'Admins', link: 'admins' },
// ]

// export default function Admin() {
//   const data = useLoaderData()

//   return (
//     <MainAdminContainer>
//       {/* <div className="flex flex-col">
//         {MENU_LINKS.map(link => (
//           <Link key={link.name} to={link.link}>
//             {link.name}
//           </Link>
//         ))}
//       </div> */}
//       {data.isAdmin.restaurants.map(restaurant => (
//         <div key={restaurant.id}>
//           <Link to={`/admin/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
//         </div>
//       ))}
//       <Outlet />
//     </MainAdminContainer>
//   )
// }
