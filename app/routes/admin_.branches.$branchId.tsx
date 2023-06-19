import type {Employee, Menu, Order, Table, User} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {
  Form,
  Link,
  Outlet,
  useLoaderData,
  useMatches,
  useSearchParams,
} from '@remix-run/react'
import React from 'react'
import {AiFillDelete, AiFillEdit} from 'react-icons/ai'
import {IoChevronBack, IoChevronDown, IoChevronUp} from 'react-icons/io5'
import {Button, FlexRow, H1, LinkButton, Modal, Spacer} from '~/components'
import {prisma} from '~/db.server'

export async function loader({request, params}: LoaderArgs) {
  const {branchId} = params
  const branch = await prisma.branch.findUniqueOrThrow({
    where: {id: branchId},
    include: {
      menus: true,
      table: true,
      orders: {where: {active: true}},
      users: true,
      feedbacks: true,
      restaurant: true,
      employees: true,
    },
  })
  const menus = await prisma.menu.findMany({where: {branchId}})
  return json({branch, menus})
}

export async function action({request, params}: ActionArgs) {
  const {branchId} = params
  const formData = await request.formData()
  const url = new URL(request.url)
  await prisma.branch.update({
    where: {id: branchId},
    data: {
      ppt_image:
        'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKuikku%20General.JPG?alt=media&token=e585a90e-59dd-499d-97b6-b059a031ff8b',
    },
  })

  return json({success: true})
}

export default function AdminBranch() {
  const data = useLoaderData()
  const [show, setShow] = React.useState({
    table: false,
    user: false,
    feedback: false,
    menu: false,
    order: false,
    employee: false,
  })
  const matches = useMatches()
  const [searchParams] = useSearchParams()
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
        <Link to="?editBranch=true">
          <AiFillEdit />
        </Link>

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
              onClick={() => setShow({...show, table: !show.table})}
              className="flex flex-row items-center text-base"
            >
              {show.table ? <IoChevronUp /> : <IoChevronDown />}
              Tables
            </button>
            <Link className="rounded-full border px-2" to="add?type=table">
              Add
            </Link>
          </FlexRow>
          {show.table && (
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
                onClick={() => setShow({...show, menu: !show.menu})}
                className="flex flex-row items-center text-base"
              >
                {show.menu ? <IoChevronUp /> : <IoChevronDown />}
                Menus
              </button>
              <Link className="rounded-full border px-2" to="add?type=menu">
                Add
              </Link>
            </FlexRow>
            {show.menu && (
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
            <FlexRow className="">
              <button
                onClick={() => setShow({...show, order: !show.order})}
                className="flex flex-row items-center text-base"
              >
                {show.order ? <IoChevronUp /> : <IoChevronDown />}
                Ordenes Activas
              </button>
              {/* <Link className="rounded-full border px-2" to="add?type=table">
                Add
              </Link> */}
            </FlexRow>
            {show.order && (
              <div className="flex flex-col items-center divide-y ">
                {data.branch.orders.map((order: Order) => (
                  <FlexRow key={order.id} className="w-full justify-between">
                    <Link
                      to={`orders/${order.id}`}
                      className="truncate text-base"
                    >
                      {order.id}
                    </Link>
                    <FlexRow>
                      <button>
                        <AiFillDelete />
                      </button>
                      <button>
                        <AiFillEdit />
                      </button>
                    </FlexRow>
                  </FlexRow>
                ))}
              </div>
            )}
            <FlexRow className="">
              <button
                onClick={() => setShow({...show, user: !show.user})}
                className="flex flex-row items-center text-base"
              >
                {show.user ? <IoChevronUp /> : <IoChevronDown />}
                Usuarios
              </button>

              {/* <Link className="rounded-full border px-2" to="add?type=table">
                Add
              </Link> */}
            </FlexRow>
            {show.user && (
              <div className="flex flex-col items-center divide-y ">
                {data.branch.users.map((user: User) => (
                  <FlexRow key={user.id} className="w-full justify-between">
                    <Link
                      to={`users/${user.id}`}
                      className="truncate text-base"
                    >
                      {user.name}
                    </Link>
                    <FlexRow>
                      <button>
                        <AiFillDelete />
                      </button>
                      <button>
                        <AiFillEdit />
                      </button>
                    </FlexRow>
                  </FlexRow>
                ))}
              </div>
            )}
            <FlexRow className="">
              <button
                onClick={() => setShow({...show, employee: !show.employee})}
                className="flex flex-row items-center text-base"
              >
                {show.employee ? <IoChevronUp /> : <IoChevronDown />}
                Empleados
              </button>

              {/* <Link className="rounded-full border px-2" to="add?type=table">
                Add
              </Link> */}
            </FlexRow>
            {show.employee && (
              <div className="flex flex-col items-center divide-y ">
                {data.branch.employees.map((employee: Employee) => (
                  <FlexRow key={employee.id} className="w-full justify-between">
                    <Link
                      to={`employees/${employee.id}`}
                      className="truncate text-base"
                    >
                      {employee.name}
                    </Link>
                    <FlexRow>
                      <button>
                        <AiFillDelete />
                      </button>
                      <button>
                        <AiFillEdit />
                      </button>
                    </FlexRow>
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
      {searchParams.get('editBranch') && (
        <Modal>
          <Form method="post">
            <Button>asign image</Button>
          </Form>
        </Modal>
      )}
    </div>
  )
}
