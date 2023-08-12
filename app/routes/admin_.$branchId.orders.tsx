import { conform, useForm } from '@conform-to/react'
import { useActionData, useFetcher, useLoaderData, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import type { Order } from '@prisma/client'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { getOrder } from '~/models/admin/order/order.server'

import { getSearchParams } from '~/utils'
import { checkboxSchema } from '~/utils/zod-extensions'

import { Button, Spacer } from '~/components'
import Container from '~/components/admin/ui/container'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { CheckboxField, Field } from '~/components/admin/ui/forms'
import HeaderSection from '~/components/admin/ui/header-section'
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
  creationDate: z.string().optional(),
})

export async function loader({ request, params }: LoaderArgs) {
  const searchParams = getSearchParams({ request })
  const searchParamsData = Object.fromEntries(searchParams)

  const orderId = searchParamsData.itemId ?? searchParamsData.editItem

  if (orderId) {
    const order = await getOrder(orderId, {
      table: true,
      users: true,
      cartItems: { include: { menuItem: true } },
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
  console.log('data', formValues)

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
          creationDate: new Date(formValues.creationDate as string),
        },
      })
    case ACTIONS.DELETE:
      await prisma.order.delete({
        where: { id: orderId },
      })
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
  const fetcher = useFetcher()

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
  // console.log('branch', branch)
  const [searchParams] = useSearchParams()
  const errors = fetcher.data
  const isSubmitting = fetcher.state !== 'idle'
  const itemId = searchParams.get('itemId')
  console.log('data.order', data.order)

  if (itemId) {
    return (
      <div>
        <HeaderSection backPath="" title="Orders" breadcrumb={itemId} />

        <ItemInfo title="Users" orderObject={data.order} />
      </div>
    )
  }

  return (
    <div>
      <QueryDialog title="Edit Order" description="Edit the following fields" query="editItem">
        <fetcher.Form method="POST" {...form.props}>
          {/* TODO contenido add table */}
          <Field
            labelProps={{ htmlFor: fields.tip.id, children: 'Tip' }}
            inputProps={{
              ...conform.input(fields.tip, { type: 'number' }),
              autoComplete: data.order?.tip ?? 0,
              defaultValue: data.order?.tip ?? 0,
            }}
            errors={[fields?.tip.errors]}
          />
          <CheckboxField
            labelProps={{ htmlFor: 'paid', children: 'Order is paid?' }}
            buttonProps={{
              ...conform.input(fields.paid, { type: 'checkbox' }),
              defaultChecked: data.order?.paid ?? false,
            }}
            errors={fields.paid.errors}
          />
          <Field
            labelProps={{ htmlFor: fields.total.id, children: 'Total amount' }}
            inputProps={{
              ...conform.input(fields.total, { type: 'number' }),
              autoComplete: data.order?.total ?? 0,
              defaultValue: data.order?.total ?? 0,
            }}
            errors={[fields?.total.errors]}
          />
          <Field
            labelProps={{ htmlFor: 'creationDate', children: 'creationDate' }}
            inputProps={{
              ...conform.input(fields.creationDate, { type: 'date' }),
              defaultValue: data.order?.creationDate ? new Date(data.order.creationDate).toISOString().split('T')[0] : '',
            }}
            errors={[errors?.paid]}
          />
          {data.order?.paid && (
            <Field
              labelProps={{ htmlFor: 'paidDate', children: 'paidDate' }}
              inputProps={{
                ...conform.input(fields.paidDate, { type: 'date' }),
                defaultValue: data.order?.paidDate ? new Date(data.order.paidDate).toISOString().split('T')[0] : '',
              }}
              errors={[errors?.paid]}
            />
          )}
          <CheckboxField
            labelProps={{ htmlFor: 'active', children: 'Order is active?' }}
            buttonProps={{
              ...conform.input(fields.active, { type: 'checkbox' }),
              defaultChecked: data.order?.active ?? false,
            }}
            errors={fields.active.errors}
          />
          <Button size="medium" type="submit" variant="secondary" name="_action" value="edit">
            {isSubmitting ? 'Edit order...' : 'Edit order'}
          </Button>
        </fetcher.Form>
      </QueryDialog>

      <QueryDialog title="Add Order" description="Add the following fields" query="addOrder">
        <fetcher.Form method="POST">
          {/* TODO contenido add order */}
          <Button size="medium" type="submit" variant="secondary" name="_action" value="add">
            {isSubmitting ? 'Adding tables...' : 'Add table'}
          </Button>
        </fetcher.Form>
      </QueryDialog>

      <HeaderSection addQuery="?addTable=true" backPath=".." title="Orders" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.orders.map((order: Order) => (
          <Container editQuery={`?editItem=${order.id}`} name={order.id} itemIdQuery={`?itemId=${order.id}`} key={order.id} />
        ))}
      </div>
    </div>
  )
}
