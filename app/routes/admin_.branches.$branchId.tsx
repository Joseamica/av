import type {Employee, Menu, Order, Table, User} from '@prisma/client'
import type {ActionArgs, LoaderArgs} from '@remix-run/node'
import {json, redirect} from '@remix-run/node'
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
      // FIXME: quitar el method, ya que por ahora estoy viendo solo si sirve stripe
      // payments: {where: {method: 'card'}},
      payments: true,
    },
  })
  const menus = await prisma.menu.findMany({where: {branchId}})
  return json({branch, menus})
}

export async function action({request, params}: ActionArgs) {
  const {branchId} = params
  const formData = await request.formData()
  let data = Object.fromEntries(formData.entries())

  const url = new URL(request.url)

  Object.keys(data).forEach(field => {
    if (field !== 'phone') {
      const value = data[field]
      if (value === '') {
        data[field] = null // Convert empty strings to null
      } else if (!isNaN(value)) {
        data[field] = Number(value) // Convert non-empty numeric strings to numbers
      }
    }
  })

  if (data._action === 'editBranch') {
    const branchData = Object.fromEntries(
      Object.entries(data).filter(([key, value]) => {
        return (
          ((typeof value === 'string' &&
            value !== '' &&
            !value.includes('[object')) ||
            typeof value === 'number') &&
          key !== '_action'
        )
      }),
    )

    await prisma.branch.update({
      where: {id: branchId},
      data: {...branchData},
    })
  }

  await prisma.branch.update({
    where: {id: branchId},
    data: {
      ppt_image:
        'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKuikku%20General.JPG?alt=media&token=e585a90e-59dd-499d-97b6-b059a031ff8b',
    },
  })

  return redirect(url.pathname)
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
    payment: false,
  })
  const matches = useMatches()
  const [searchParams, setSearchParams] = useSearchParams()

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
                      <Link to={`menus/${menu.id}?delMenu=true`}>
                        <AiFillDelete />
                      </Link>
                      <Link to={`menus/${menu.id}?editMenu=true`}>
                        <AiFillEdit />
                      </Link>
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
                      <Link to={`orders/${order.id}?delUser=true`}>
                        <AiFillDelete />
                      </Link>
                      <Link to={`orders/${order.id}?editUser=true`}>
                        <AiFillEdit />
                      </Link>
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
                      <Link to={`users/${user.id}?delUser=true`}>
                        <AiFillDelete />
                      </Link>
                      <Link to={`users/${user.id}?editUser=true`}>
                        <AiFillEdit />
                      </Link>
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
                      <Link to={`employees/${employee.id}?delEmployee=true`}>
                        <AiFillDelete />
                      </Link>
                      <Link to={`employees/${employee.id}?editEmployee=true`}>
                        <AiFillEdit />
                      </Link>
                    </FlexRow>
                  </FlexRow>
                ))}
              </div>
            )}
            <FlexRow className="">
              <button
                onClick={() => setShow({...show, payment: !show.payment})}
                className="flex flex-row items-center text-base"
              >
                {show.payment ? <IoChevronUp /> : <IoChevronDown />}
                Pagos
              </button>

              {/* <Link className="rounded-full border px-2" to="add?type=table">
                Add
              </Link> */}
            </FlexRow>
            {show.payment && (
              <div className="flex flex-col items-center divide-y ">
                {data.branch.payments.map((payment: any) => (
                  <FlexRow key={payment.id} className="w-full justify-between">
                    <Link
                      to={`payments/${payment.id}`}
                      className="truncate text-base"
                    >
                      {payment.total}
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
        {searchParams.get('editBranch') && (
          <Modal
            onClose={() => {
              searchParams.delete('editBranch')
              setSearchParams(searchParams)
            }}
            title="Editar Sucursal"
          >
            <Form method="POST">
              <div className="space-y-2 p-2">
                {Object.entries(data.branch)
                  .filter(
                    ([key, value]) =>
                      key !== 'id' && !String(value).includes('[object'),
                  )

                  .map(([key, value]) => {
                    if (typeof value === 'boolean') {
                      return (
                        <FlexRow key={key}>
                          <label>{key}</label>
                          <input
                            type="checkbox"
                            name={key}
                            defaultChecked={value}
                            className="h-5 w-5"
                          />
                        </FlexRow>
                      )
                    } else if (typeof value === 'number') {
                      return (
                        <FlexRow key={key}>
                          <label className="capitalize">{key}</label>
                          <input
                            type="number"
                            name={key}
                            defaultValue={Number(value)}
                            className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full p-2 dark:ring-1"
                          />
                        </FlexRow>
                      )
                    } else {
                      return (
                        <FlexRow key={key}>
                          <label className="capitalize">{key}</label>
                          <input
                            type="text"
                            name={key}
                            defaultValue={value}
                            className="dark:bg-DARK_2 dark:ring-DARK_4 w-full rounded-full p-2 dark:ring-1"
                          />
                        </FlexRow>
                      )
                    }
                  })}
                <Button name="_action" value="editBranch" fullWith={true}>
                  Edit branch
                </Button>
              </div>
            </Form>
          </Modal>
        )}
        <div className="col-span-3">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
