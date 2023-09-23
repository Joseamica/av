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

import { Spacer } from '~/components'
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
      cartItems: { include: { product: true } },
      payments: true,
    })
    console.log('order', order)

    return json({ order })
  }
  return json({ order: null })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const formValues = Object.fromEntries(formData.entries())

  const searchParams = getSearchParams({ request })
  const searchParamsValues = Object.fromEntries(searchParams)
  console.log('searchParamsData', searchParamsValues)
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

    case ACTIONS.DELETE:
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

  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as RouteLoaderData

  const [searchParams] = useSearchParams()

  const itemId = searchParams.get('itemId')

  if (itemId) {
    return (
      <div>
        <HeaderSection backPath="" title="Orders" breadcrumb={itemId} showAdd={false} />

        <ItemInfo title="Users" itemObject={data.order} />
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
          <Container editQuery={`?editItem=${order.id}`} name={order.id} itemIdQuery={`?itemId=${order.id}`} key={order.id} />
        ))}
      </div>
    </div>
  )
}
