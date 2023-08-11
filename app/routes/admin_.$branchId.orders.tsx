import { useRouteLoaderData } from '@remix-run/react'

import { type ActionArgs, json } from '@remix-run/node'

import type { Order } from '@prisma/client'

import { Spacer } from '~/components'
import Container from '~/components/admin/ui/container'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { Field } from '~/components/admin/ui/forms'
import HeaderSection from '~/components/admin/ui/header-section'
import { Input } from '~/components/admin/ui/input'
import { Label } from '~/components/admin/ui/label'

export const handle = { active: 'Orders' }
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

type RouteLoaderData = {
  branch: any // Replace with the correct type for 'admin'
}

export default function Name() {
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as RouteLoaderData

  return (
    <div className="p-4">
      <QueryDialog title="Edit Order" description="Edit the following fields" query="editOrder">
        {/* TODO contenido edit order */}
        <Field
          labelProps={{
            htmlFor: 'a',
            children: 'Username or Email',
          }}
          inputProps={{
            id: 'a',
            type: 'text',
            name: 'usernameOrEmail',
            defaultValue: 'admin',
          }}
          errors={''}
        />
        <Label>Order ID</Label>
        <Input type="text" />
      </QueryDialog>

      <QueryDialog title="Add Order" description="Add the following fields" query="addOrder">
        {/* TODO contenido add order */}
      </QueryDialog>

      <HeaderSection addQuery="?addOrder=true" backPath=".." title="Orders" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.orders.map((order: Order) => (
          <Container editQuery="?editOrder=true" name={order.id.slice(-4)} accessQuery={`?orderId=${order.id}`} key={order.id} />
        ))}
      </div>
    </div>
  )
}
