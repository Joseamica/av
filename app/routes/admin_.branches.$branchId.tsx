import type {Menu, Table} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {
  Link,
  Outlet,
  useLoaderData,
  useMatches,
  useSearchParams,
} from '@remix-run/react'
import React from 'react'
import {AiFillDelete, AiFillEdit} from 'react-icons/ai'
import {IoChevronBack, IoChevronDown, IoChevronUp} from 'react-icons/io5'
import {FlexRow, H1, LinkButton, Spacer} from '~/components'
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
  const menus = await prisma.menu.findMany({where: {branchId}})
  return json({branch, menus})
}

export async function action({request, params}: ActionArgs) {
  const {branchId} = params
  const formData = await request.formData()
  const url = new URL(request.url)
  return json({success: true})
}

export default function AdminBranch() {
  const data = useLoaderData()
  const [showTable, setShow] = React.useState({
    table: false,
    user: false,
    feedback: false,
    menu: false,
  })
  const matches = useMatches()
  return (
    <div>
      <Spacer spaceY="2" />
      {/* {matches
        // skip routes that don't have a breadcrumb
        .filter(match => match.handle && match.handle.breadcrumb)
        // render breadcrumbs!
        .map((match, index) => (
          <li key={index}>{match.handle?.breadcrumb()}</li>
        ))} */}
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
      <div className="grid h-screen grid-cols-5 gap-4 divide-x">
        <div className="col-span-2 flex flex-col space-y-2">
          <FlexRow className="">
            <button
              onClick={() => setShow({...showTable, table: !showTable.table})}
              className="flex flex-row items-center text-xl"
            >
              {showTable.table ? <IoChevronUp /> : <IoChevronDown />}
              Tables
            </button>
            <Link className="rounded-full border px-2" to="add?type=table">
              Add
            </Link>
          </FlexRow>
          {showTable.table && (
            <div className="flex flex-col items-center justify-center divide-y">
              {data.branch.table.map((table: Table) => (
                <FlexRow key={table.id}>
                  <Link to={`tables/${table.id}`} className="text-lg">
                    {table.table_number}
                  </Link>
                  <button>
                    <AiFillDelete />
                  </button>
                  <button>
                    <AiFillEdit />
                  </button>
                </FlexRow>
              ))}
            </div>
          )}
          {/* <Link to="users" className="flex justify-center border">
            Users
          </Link> */}

          <div className="col-span-2 flex flex-col space-y-2">
            <FlexRow className="">
              <button
                onClick={() => setShow({...showTable, menu: !showTable.menu})}
                className="flex flex-row items-center text-xl"
              >
                {showTable.menu ? <IoChevronUp /> : <IoChevronDown />}
                Menus
              </button>
              <Link className="rounded-full border px-2" to="add?type=menu">
                Add
              </Link>
            </FlexRow>
            {showTable.menu && (
              <div className="flex flex-col items-center divide-y">
                {data.menus.map((menu: Menu) => (
                  <FlexRow key={menu.id} className="w-full justify-between">
                    <Link to={`menus/${menu.id}`} className="text-base">
                      {menu.name}
                    </Link>
                    <div>
                      <button>
                        <AiFillDelete />
                      </button>
                      <button>
                        <AiFillEdit />
                      </button>
                    </div>
                  </FlexRow>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
