import { Link, isRouteErrorResponse, useLoaderData, useRouteError } from '@remix-run/react'
import { FaEdit } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { Restaurant } from '@prisma/client'
import { prisma } from '~/db.server'
import { getSession, getUserId } from '~/session.server'

import { isUserAdmin } from '~/models/admin.server'

import { H2 } from '~/components'
import { EditRestDialog } from '~/components/admin/ui/dialogs/edit-rest-dialog'
import SelectBranchDialog from '~/components/admin/ui/dialogs/select-branch-dialog'

export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request)
  const userId = await getUserId(session)
  const isAdmin = await isUserAdmin(userId)
  if (!isAdmin) {
    return redirect(`/login`)
  }

  const restaurants = await prisma.restaurant.findMany({
    where: {
      adminId: isAdmin.id,
    },
  })

  const searchParams = new URL(request.url).searchParams
  const restId = searchParams.get('restId') || null
  let selectedRest = null
  if (restId) {
    selectedRest = await prisma.restaurant.findFirst({
      where: {
        id: restId,
      },
      include: {
        branches: true,
      },
    })
  }

  return json({ restaurants, selectedRest })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const branchId = formData.get('branchId')

  return redirect(`${branchId}`)
}

export default function Admin() {
  const data = useLoaderData()

  const isBranches = data.selectedRest?.branches.length >= 1

  return (
    <main className="m-auto min-h-screen flex flex-col">
      <EditRestDialog />
      <SelectBranchDialog selectedRest={data.selectedRest} isBranches={isBranches} />

      <div className="fixed top-20 w-full flex justify-between">
        <div />
        <H2 className="">Avoqado</H2>
        <p>userComp</p>
      </div>
      <div className="flex flex-grow justify-center items-center gap-2">
        {data.restaurants.map((rest: Restaurant) => (
          <div className="flex flex-col space-y-4 items-center" key={rest.id}>
            <Link
              to={`?restId=${rest.id}`}
              // onClick={() => setShowModal({ editRest: false, selectBranch: !showModal.selectBranch })}
              className="w-52 h-52 flex-shrink flex justify-center items-center bg-white shadow-lg rounded-xl"
            >
              {rest.name}
            </Link>

            <Link
              to={`?editRest=${rest.id}`}
              className=" flex-row space-x-2 text-violet11 shadow-blackA7 hover:bg-mauve3 flex h-[35px] items-center justify-center rounded-full bg-white px-[15px] font-medium leading-none shadow-[0_2px_10px] focus:shadow-[0_0_0_2px] focus:shadow-black focus:outline-none"
            >
              <FaEdit />
              <p>Edit</p>
            </Link>
          </div>
        ))}
      </div>
    </main>
  )
}

export const ErrorBoundary = () => {
  const error = useRouteError() as Error

  if (isRouteErrorResponse(error)) {
    return (
      <main className="bg-night-600">
        <p>No information</p>
        <p>Status: {error.status}</p>
        <p>{error?.data.message}</p>
      </main>
    )
  }

  return (
    <main className="text-white bg-night-500">
      <h1>Rayos y centellas!</h1>
      <p>{error?.message}</p>
      <button className="text-white bg-warning">
        Back to <Link to={'/table'}> safety! </Link>
      </button>
    </main>
  )
}
