import { Link, useLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json } from '@remix-run/node'

import type { Branch } from '@prisma/client'
import { prisma } from '~/db.server'

import { H1, LinkButton } from '~/components'

export async function loader({ request, params }: LoaderArgs) {
  const { restId } = params
  const branches = await prisma.branch.findMany({
    where: { restaurantId: restId },
  })

  const searchParams = new URL(request.url).searchParams
  const branchId = searchParams.get('branchId')

  let selectedBranch = null
  if (branchId) {
    // Find the branch by ID
    selectedBranch = await prisma.branch.findFirst({
      where: {
        id: branchId,
      },
    })
  }

  return json({ branches, selectedBranch })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function RestBranches() {
  const data = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const branchId = searchParams.get('branchId')

  if (branchId) {
    // Find the branch by ID
    const selectedBranch = data.branches.find((branch: Branch) => branch.id === branchId)
    let branchName = selectedBranch ? selectedBranch.name : 'Branch'
    if (branchName.length > 15) {
      branchName = branchName.substring(0, 15) + '...'
    }

    return (
      <div>
        {/* NOTE Breadcrumb */}
        <div className="flex space-x-2 text-gray-500">
          <Link to={`?branchId=`} className="text-blue-500 hover:underline text-ellipsis overflow-hidden">
            {branchName}
          </Link>
          {/* <span>&gt;</span>
          <span>{branchId}</span>
          <span>Information</span> */}
        </div>
        {data.selectedBranch && (
          <div>
            <div className="flex space-x-2">
              <H1>{data.selectedBranch.name}</H1>
            </div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div>
      <H1>Your branches</H1>

      {data.branches.map((branch: Branch) => (
        <LinkButton variant="payment" to={`?branchId=${branch.id}`} key={branch.id}>
          {branch.name}
        </LinkButton>
      ))}
    </div>
  )
}
