import { useForm } from '@conform-to/react'
import { Form, useActionData, useLoaderData, useLocation, useRouteLoaderData, useSearchParams } from '@remix-run/react'
import QRCode from 'qrcode.react'
import { useState } from 'react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import type { Table } from '@prisma/client'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'
import { useLiveLoader } from '~/use-live-loader'

import { getTable, handleAddAction, handleDeleteAction, handleEditAction } from '~/models/admin/table/table.server'

import { getSearchParams } from '~/utils'

import { Button, FlexRow, H1, H2, H3, H4, Spacer } from '~/components'
import { HeaderSection, HeaderWithButton } from '~/components/admin/headers'
import { AddTableDialog } from '~/components/admin/tables/dialogs/add'
import { EditTableDialog } from '~/components/admin/tables/dialogs/edit'
import { Container } from '~/components/admin/ui/container'
import Item from '~/components/admin/ui/item'

export const handle = { active: 'Tables' }

const ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'del',
}

const categoriesFormSchema = z.object({
  number: z.number().min(1).max(1000),
  seats: z.number().min(1).max(100),
})

export async function loader({ request, params }: LoaderArgs) {
  const searchParams = getSearchParams({ request })
  const searchParamsData = Object.fromEntries(searchParams)

  const tableId = searchParamsData.itemId ?? searchParamsData.editItem
  // await prisma.table.findFirst({
  //   include:{
  //     order:{
  //       include:{
  //         cartItems:{
  //           include:{
  //             productModifiers
  //           }
  //         }
  //       }
  //     }
  //   }
  // })

  if (tableId) {
    const table = await prisma.table.findFirst({
      where: { id: tableId },
      include: {
        users: true,
        order: {
          include: { users: true, payments: true, cartItems: { include: { productModifiers: true } } },
        },
        employees: true,
        feedbacks: true,
      },
    })

    return json({ table })
  }

  return json({ table: null })
}

export async function action({ request, params }: ActionArgs) {
  const { branchId } = params
  const formData = await request.formData()
  const formValues = Object.fromEntries(formData.entries())
  const _action = formValues._action

  const searchParams = getSearchParams({ request })
  const searchParamsValues = Object.fromEntries(searchParams)

  const tableId = searchParamsValues.itemId ?? searchParamsValues.editItem
  const redirectTo = safeRedirect(formData.get('redirectTo'), '')
  //clean all tables from branchId
  // if(_action === 'clean') {

  // }

  switch (formValues._action) {
    case ACTIONS.ADD:
      return handleAddAction(formValues, branchId, redirectTo)
    case ACTIONS.EDIT:
      return handleEditAction(tableId, formValues, redirectTo)
    case ACTIONS.DELETE:
      return handleDeleteAction(tableId, redirectTo)
    default:
      return redirect(redirectTo)
  }
}

type RouteLoaderData = {
  branch: any
}

export default function Tables() {
  const data = useLiveLoader()
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'tables',
    constraint: getFieldsetConstraint(categoriesFormSchema),
    lastSubmission: actionData?.submission ?? data.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: categoriesFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const { branch } = useRouteLoaderData('routes/admin_+/$branchId') as RouteLoaderData
  const [searchParams] = useSearchParams()

  const itemId = searchParams.get('itemId')
  const tableIdUrl = `https://av.fly.dev/table/${data.table?.id}`

  const [domain, setDomain] = useState(tableIdUrl)
  const location = useLocation()

  // const handleClick = () => {
  //   let url = tableIdUrl
  //   saveAs(url, 'qr')
  // }
  // console.log('data.table.cartItems', data.table?.order)
  if (itemId) {
    return (
      <div>
        <HeaderSection backPath="" title="Tables" breadcrumb={itemId} />
        {/* <input
          id="id"
          type="text"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          placeholder="https://www.example.com"
          onFocus={e => setDomain(`https://av.fly.dev/table/${data.table.id}`)}
          className="w-1/2 px-3 py-2 text-black border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        /> */}
        <Form method="post" action={`/table/${itemId}/processes/endOrder?from=admin`}>
          <Spacer spaceY="2">
            <Button name="_action" value="clean" variant="danger" size="small" disabled={data.table.users?.length <= 0}>
              Clean table
            </Button>
          </Spacer>
          <input type="hidden" name="redirectTo" value={location.pathname + location.search} />
        </Form>
        <QRCode value={tableIdUrl} size={256} />
        <Spacer size="sm" />
        {/* <button onClick={handleClick} className="p-2 rounded-full bg-DARK_PRIMARY_1">
          download
        </button> */}
        <Item title="Users" itemToMap={data.table.users} params={['name', 'tip', 'paid', 'total']} />
        <Item title="Employees" itemToMap={data.table.employees} params={['name', 'role']} />
        <Item title="Feedbacks" itemToMap={data.table.feedbacks} params={['name', 'role']} />
        {/* <Item title="Order" itemToMap={data.table.order} params={['id', 'paid', 'paidDate', 'active']} /> */}
        <H1>Order</H1>
        <div className="p-2 border">
          <FlexRow>
            <H4> Active:</H4>
            <H4> {data.table?.order?.active ? 'Active' : 'Unactive'}</H4>
          </FlexRow>
          <FlexRow>
            <H4> Paid:</H4>
            <H4> {data.table?.order?.paid ? 'Paid' : 'Not Paid'}</H4>
          </FlexRow>
          {data.table?.order?.tip && (
            <FlexRow>
              <H4> tip:</H4>
              <H4> {data.table?.order?.tip}</H4>
            </FlexRow>
          )}
          {data.table?.order?.total && (
            <FlexRow>
              <H4> Total:</H4>
              <H4> {data.table?.order?.total}</H4>
            </FlexRow>
          )}
        </div>
        {data.table?.order?.cartItems.length > 0 && (
          <>
            <H2>Products</H2>
            <div className="p-2 border divide-y">
              {data.table?.order?.cartItems.map((cartItem: any) => {
                return (
                  <FlexRow key={cartItem.id} justify="between" className="p-1">
                    <FlexRow>
                      <p> {cartItem.quantity}</p>
                      <p> {cartItem.name}</p>
                      <p>${cartItem.price}</p>
                    </FlexRow>
                    <p> {cartItem.comments}</p>
                    <div>
                      {cartItem.productModifiers?.length > 0 && <H3>Modificadores</H3>}
                      <div className="divide-y">
                        {cartItem.productModifiers?.map((productModifier: any) => {
                          return (
                            <FlexRow key={productModifier.id} justify="between" className="border">
                              <FlexRow>
                                <p> {productModifier.quantity}</p>
                                <p className="font-bold"> {productModifier.name}</p>
                              </FlexRow>
                              <p> ${productModifier.total}</p>
                            </FlexRow>
                          )
                        })}
                      </div>
                    </div>
                  </FlexRow>
                )
              })}
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div>
      <EditTableDialog form={form} fields={fields} table={data.table} />

      <AddTableDialog form={form} fields={fields} table={data.table} />

      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />

      {/* <Form method="post" action={`/table/${itemId}/processes/endOrder?from=admin`}>
        <Spacer spaceY="2">
          <Button name="_action" value="clean" variant="danger" size="small">
            Clean all tables
          </Button>
        </Spacer>
        <input type="hidden" name="redirectTo" value={location.pathname + location.search} />
      </Form> */}
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.tables?.map((table: Table) => (
          <div key={table.id} className={table.order ? 'border-4 border-green-400 rounded-xl' : ''}>
            <Container editQuery={`?editItem=${table.id}`} name={table.number} itemIdQuery={`?itemId=${table.id}`} />
            <div className="flex flex-col">
              {table.users?.length > 0 && <span className="text-blue-400">user on table</span>}
              {table.order && <span className="text-green-400">an order is active</span>}
            </div>
            {/* todo */}
            {/* <span>clean</span> */}
          </div>
        ))}
      </div>
    </div>
  )
}
