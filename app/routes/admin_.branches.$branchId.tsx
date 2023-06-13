import type {Branch, Feedback, Table} from '@prisma/client'
import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {Link, Outlet, useLoaderData, useSearchParams} from '@remix-run/react'
import React from 'react'
import {IoChevronBack} from 'react-icons/io5'
import {FlexRow, H1, H3, LinkButton, Spacer} from '~/components'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const {branchId} = params
  const branch = await prisma.branch.findUniqueOrThrow({
    where: {id: branchId},
    include: {
      menus: true,
      table: true,
      orders: true,
      users: true,
      feedbacks: true,
      restaurant: true,
    },
  })
  return json({branch})
}

export default function AdminBranch() {
  const data = useLoaderData()
  const [searchParams, setSearchParams] = useSearchParams()
  const showTables = searchParams.get('tables') === 'show'
  const [showTable, setShow] = React.useState({
    table: false,
    user: false,
    feedback: false,
  })
  const handleToggle = () => {
    if (showTables) {
      setSearchParams({})
    } else {
      setSearchParams({tables: 'show'})
    }
  }
  return (
    <div>
      <Spacer spaceY="2" />
      <FlexRow>
        <Link to="/admin" className="text-lg">
          <IoChevronBack />
        </Link>
        <H1>{data.branch.name}</H1>
        {/* <LinkButton to="edit" className="ml-2">
          Edit
        </LinkButton> */}
      </FlexRow>
      <hr />
      <Spacer spaceY="2" />
      <div className="grid grid-cols-4 gap-4 ">
        <div className="flex flex-col space-y-2">
          <button
            onClick={() => setShow({...showTable, table: !showTable.table})}
            className="border-1 border"
          >
            Tables
          </button>
          {showTable.table && (
            <div className="flex flex-col items-center justify-center divide-y">
              {data.branch.table.map((table: Table) => (
                <Link
                  to={`tables/${table.id}`}
                  key={table.id}
                  className="text-lg"
                >
                  {table.table_number}
                </Link>
              ))}
            </div>
          )}
          <Link to="users" className="flex justify-center border">
            Users
          </Link>
          <Link to="menus" className="flex justify-center border">
            Menus
          </Link>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
