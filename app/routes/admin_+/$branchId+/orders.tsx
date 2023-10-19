import { useForm } from '@conform-to/react'
import { useActionData, useLoaderData, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import type { Order } from '@prisma/client'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { getOrder } from '~/models/admin/order/order.server'

import { getSearchParams } from '~/utils'
import { checkboxSchema } from '~/utils/zod-extensions'

import { H1, H2, H4, Spacer } from '~/components'
import { HeaderSection } from '~/components/admin/headers'
import { EditOrderDialog } from '~/components/admin/orders/dialogs/edit'
import { Container } from '~/components/admin/ui/container'
import ItemInfo from '~/components/admin/ui/selected-item-info'

export const handle = { active: 'Orders' }

const ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'del',
}

const orderFormSchema = z.object({
  paid: checkboxSchema(),
  active: checkboxSchema(),
  tip: z.number().optional(),
  total: z.number().optional(),
  paidDate: z.string().optional(),
})

export async function loader({ request, params }: LoaderArgs) {
  const searchParams = getSearchParams({ request })
  const searchParamsData = Object.fromEntries(searchParams)

  const orderId = searchParamsData.itemId ?? searchParamsData.editItem

  if (orderId) {
    const order = await getOrder(orderId, {
      table: true,
      users: true,
      cartItems: { include: { product: true, productModifiers: true } },
      payments: { include: { user: true } },
    })

    return json({ order })
  }
  return json({ order: null })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const formValues = Object.fromEntries(formData.entries())
  console.log('formValues', formValues)

  const searchParams = getSearchParams({ request })
  const searchParamsValues = Object.fromEntries(searchParams)

  const orderId = searchParamsValues.itemId ?? searchParamsValues.editItem
  const redirectTo = safeRedirect(formData.get('redirectTo'), '')

  switch (formValues._action) {
    case ACTIONS.ADD:
    // return handleAddAction(formValues, branchId, redirectTo)
    case ACTIONS.EDIT:
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paid: formValues.paid === 'on',
          active: formValues.active === 'on',
          tip: Number(formValues.tip),
          total: Number(formValues.total),
          paidDate: formValues.paidDate && new Date(formValues.paidDate as string),
        },
      })
      return redirect(redirectTo)

    case 'delete':
      await prisma.order.delete({
        where: { id: orderId },
      })
      return redirect(redirectTo)

    default:
      return redirect(redirectTo)
  }
}

type RouteLoaderData = {
  branch: any
}

export default function Orders() {
  const data = useLoaderData()
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'orders',
    constraint: getFieldsetConstraint(orderFormSchema),
    lastSubmission: actionData?.submission ?? data.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: orderFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const { branch } = useRouteLoaderData('routes/admin_+/$branchId') as RouteLoaderData

  const [searchParams] = useSearchParams()

  const itemId = searchParams.get('itemId')

  if (itemId) {
    return (
      <div>
        <HeaderSection backPath="" title="Orders" breadcrumb={itemId} showAdd={false} />

        <div className="border p-2">
          <H1>Order</H1>
          <p> Mesa: {data.order.tableNumber}</p>
          <p>Fecha: {data.order.createdAt}</p>
          <div>Monto: ${data.order.total - data.order.tip}</div>
          <div>Tip: ${data.order.tip ? data.order.tip : 0}</div>
          <div>Total:$ {data.order.total}</div>
          <p>{data.order.active ? 'Activa' : 'No activa'}</p>
          <Spacer size="sm" />

          <div className="space-y-2 border-2 border-green-200">
            <H2>Productos</H2>
            {data.order.cartItems.map(cartItem => {
              return (
                <div key={cartItem.id} className="border-2 border-day-500">
                  <p>Producto: {cartItem.name}</p>
                  <div className="border border-blue-200">
                    <H4>Modificadores</H4>
                    {cartItem.productModifiers.map(pm => {
                      return (
                        <div key={pm.id} className="flex space-x-2">
                          <p>{pm.name}</p>
                          <p>${pm.extraPrice}</p>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
          <Spacer size="sm" />
          {data.order.payments.length > 0 && (
            <div className="space-y-2 border-2 border-purple-200">
              <H2>Pagos</H2>
              {data.order.payments.map(payment => {
                return (
                  <div key={payment.id} className="">
                    <p>{payment.method}</p>
                    <p>monto: ${payment.amount}</p>
                    <p>tip: ${payment.tip}</p>
                    <p>total:{payment.total}</p>
                    <p>Pagado por: {payment.user.name}</p>
                    <p>{payment.createdAt}</p>
                  </div>
                )
              })}
            </div>
          )}
          <Spacer size="sm" />
          {data.order.users.length > 0 && (
            <div className="space-y-2 border-2 border-slate-300">
              <H2>Usuarios</H2>
              {data.order.users.map(user => {
                return (
                  <div key={user.id} className="">
                    <p>{user.name}</p>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div>
      <EditOrderDialog form={form} fields={fields} order={data.order} />

      <HeaderSection addQuery="?addItem=true" backPath=".." title="Orders" showAdd={false} />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.orders.map((order: Order) => (
          <Container
            editQuery={`?editItem=${order.id}`}
            name={`Mesa: ${order.tableNumber} total: ${order.total}, ${order.createdAt}`}
            itemIdQuery={`?itemId=${order.id}`}
            key={order.id}
          />
        ))}
      </div>
    </div>
  )
}
