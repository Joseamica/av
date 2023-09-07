import { Form, Link, useLoaderData } from '@remix-run/react'
import React from 'react'
import { FaEdit } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { Chain } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { Button, H2 } from '~/components'
import { EditRestDialog } from '~/components/admin/ui/dialogs/edit-rest-dialog'
import SelectBranchDialog from '~/components/admin/ui/dialogs/select-branch-dialog'

/**
 * Fetches data from the server and returns it to the component.
 * It retrieves the user's session, checks their roles, and fetches chains and selected chain data based on the user's roles and query parameters.
 *
 * @param {object} request - The request object containing information about the HTTP request.
 * @returns {object} - JSON object containing the fetched chains and selected chain data.
 */
export const loader = async ({ request }: LoaderArgs) => {
  const session = await getSession(request)
  const userId = session.get('userId')

  const user = await prisma.user.findFirst({
    where: { id: userId },
    include: {
      roles: {
        include: {
          permissions: true,
        },
      },
    },
  })
  if (!user || user.roles.length === 0) {
    return json({ error: 'User does not have any roles assigned' }, { status: 403 })
  }
  const roles = user.roles.map(role => role.name)

  let chains = null
  let whereClause = {}
  if (roles.includes('moderator')) {
    whereClause = {
      moderatorIds: {
        has: userId,
      },
    }
  }

  chains = await prisma.chain.findMany({
    where: whereClause,
    include: {
      branches: true,
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
  invariant(branchId, 'branchId is required')

  const redirectUrl = branchId ? `${branchId}` : ''
  return redirect(redirectUrl)
}

/**
 * Renders the admin dashboard component.
 * It displays a list of chains and allows the user to edit and select branches within each chain.
 *
 * @returns The rendered admin dashboard component.
 */
export default function Admin() {
  const data = useLoaderData()
  // TODO - on loader, it will get user role and depending on the user role, we will return specific component
  // For example: admin, all admin dashboard (avoqado devs), moderator (owner of the restaurant) all the branches assigned.
  const isBranches = Array.isArray(data.selectedChain?.branches) && data.selectedChain?.branches.length > 0
  const MemoizedEditRestDialog = React.memo(EditRestDialog)
  const MemoizedSelectBranchDialog = React.memo(SelectBranchDialog)

  return (
    <main className="m-auto min-h-screen flex flex-col">
      <MemoizedEditRestDialog />
      <MemoizedSelectBranchDialog selectedChain={data.selectedChain} isBranches={isBranches} />

      <div className="fixed top-20 w-full flex justify-between">
        <H2 className="">Avoqado</H2>
        <H2>Chains</H2>

        <p>userComp</p>
      </div>

      <div className="flex flex-grow justify-center items-center gap-2">
        {Array.isArray(data.chains) &&
          data.chains.map((chain: Chain) => (
            <div className="flex flex-col space-y-4 items-center" key={chain.id}>
              <Link
                to={`?chainId=${chain.id}`}
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
      <Form method="POST" action="/logout">
        <Button type="submit">Logout</Button>
      </Form>
    </main>
  )
}
