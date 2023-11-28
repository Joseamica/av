import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Form, Link, useLoaderData, useSubmit } from '@remix-run/react'
import { FaEdit } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import type { Chain } from '@prisma/client'
import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'

import { requireAdmin } from '~/utils/permissions.server'

import { Button, H2 } from '~/components'
import { EditRestDialog } from '~/components/admin/ui/dialogs/edit-rest-dialog'
import SelectBranchDialog from '~/components/admin/ui/dialogs/select-branch-dialog'

export const meta = () => {
  return [
    { title: 'Very cool app | Remix' },
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
export const loader = async ({ request }: LoaderArgs) => {
  // const admin = await requireAdmin(request)
  const user = await requireAdmin(request)

  if (!user || user.roles.length === 0) {
    return json({ error: 'User does not have any roles assigned' }, { status: 403 })
  }
  const roles = user.roles?.map(role => role.name)

  let chains = null
  let whereClause = {}
  if (roles.includes('moderator')) {
    whereClause = {
      moderatorIds: {
        has: user.id,
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

  return json({ chains, selectedChain, user })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const branchId = formData.get('branchId')
  invariant(branchId, 'branchId is required')

  const redirectUrl = branchId ? `${branchId}` : ''
  return redirect(redirectUrl)
}

export default function Admin() {
  const data = useLoaderData()
  // TODO - on loader, it will get user role and depending on the user role, we will return specific component
  // For example: admin, all admin dashboard (avoqado devs), moderator (owner of the restaurant) all the branches assigned.
  const isBranches = data.selectedChain?.branches.length >= 1

  return (
    <main className="m-auto min-h-screen flex flex-col">
      <EditRestDialog />
      <SelectBranchDialog selectedChain={data.selectedChain} isBranches={isBranches} />

      <div className="fixed top-0 w-full flex justify-between p-4 border items-center">
        <H2 className="">Avoqado</H2>
        <H2>Chains</H2>

        <UserDropdown />
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

function UserDropdown() {
  // const user = useUser()
  const data = useLoaderData()

  const submit = useSubmit()
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <Link
          to={`/users/${data.user.username}`}
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
          <span className="text-body-sm font-bold">{data.user.name ?? data.user.username}</span>
        </Link>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content sideOffset={8} align="start" className="flex flex-col rounded-3xl border bg-white ">
          {/* bg-[#323232] */}
          {/* <DropdownMenu.Item asChild>
            <Link
              prefetch="intent"
              to={`/users/${data.user.username}`}
              className="rounded-t-3xl px-7 py-5 outline-none hover:bg-night-500 radix-highlighted:bg-night-500"
            >
              👤 Profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link prefetch="intent" to="/favorites" className="px-7 py-5 outline-none hover:bg-night-500 radix-highlighted:bg-night-500">
              🔖 Favorites
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link prefetch="intent" to="/bookings" className="px-7 py-5 outline-none hover:bg-night-500 radix-highlighted:bg-night-500">
              🚀 Bookings
            </Link>
          </DropdownMenu.Item> */}
          <DropdownMenu.Item asChild>
            <Form
              action="/logout"
              method="POST"
              className="rounded-b-3xl px-7 py-5 outline-none radix-highlighted:bg-night-500"
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
