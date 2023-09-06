import { Link, useLoaderData } from '@remix-run/react'
import { FaEdit } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { Chain } from '@prisma/client'
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

  const chains = await prisma.chain.findMany({
    where: {
      adminId: isAdmin.id,
    },
  })

  const searchParams = new URL(request.url).searchParams
  const chainId = searchParams.get('chainId') || null
  let selectedChain = null
  if (chainId) {
    selectedChain = await prisma.chain.findFirst({
      where: {
        id: chainId,
      },
      include: {
        branches: true,
      },
    })
  }

  return json({ chains, selectedChain })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const branchId = formData.get('branchId')

  return redirect(`${branchId}`)
}

export default function Admin() {
  const data = useLoaderData()

  const isBranches = data.selectedChain?.branches.length >= 1

  return (
    <main className="m-auto min-h-screen flex flex-col">
      <EditRestDialog />
      <SelectBranchDialog selectedChain={data.selectedChain} isBranches={isBranches} />

      <div className="fixed top-20 w-full flex justify-between">
        <div />
        <H2 className="">Avoqado</H2>
        <p>userComp</p>
      </div>
      <div className="flex flex-grow justify-center items-center gap-2">
        {data.chains.map((chain: Chain) => (
          <div className="flex flex-col space-y-4 items-center" key={chain.id}>
            <Link
              to={`?chainId=${chain.id}`}
              // onClick={() => setShowModal({ editRest: false, selectBranch: !showModal.selectBranch })}
              className="w-52 h-52 flex-shrink flex justify-center items-center bg-white shadow-lg rounded-xl"
            >
              {chain.name}
            </Link>

            <Link
              to={`?editChain=${chain.id}`}
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
