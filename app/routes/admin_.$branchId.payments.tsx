import { conform, useForm } from '@conform-to/react'
import { useFetcher, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, DeleteIcon, FlexRow, H6 } from '~/components'
import { HeaderWithButton } from '~/components/admin/headers'
import { PaymentForm } from '~/components/admin/payments/payment-form'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'
import { EditIcon } from '~/components/icons'

export const handle = { active: 'Payments' }

const paymentsFormSchema = z.object({
  id: z.string(),
  method: z.union([z.literal('cash'), z.literal('card')]),
  amount: z.number().min(0),
  tip: z.number().min(0),
  total: z.number().min(0),
  selectItems: z.string().nonempty('You must select at least one order'),
})
export async function loader({ request, params }: LoaderArgs) {
  return json({ success: true })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  const submission = parse(formData, {
    schema: paymentsFormSchema,
  })
  console.log('submission', submission)
  if (submission.intent !== 'submit') {
    return json({ status: 'idle', submission } as const)
  }
  if (!submission.value) {
    return json(
      {
        status: 'error',
        submission,
      } as const,
      { status: 400 },
    )
  }

  return namedAction(request, {
    async create() {
      for (const item of submission.value.selectItems) {
        console.log('item', item)
        await prisma.payments.create({
          data: {
            method: submission.value.method,
            amount: submission.value.amount,
            tip: submission.value.tip,
            total: submission.value.total,
            order: {
              connect: {
                id: item,
              },
            },
          },
        })
      }
      return redirect('')
    },
    async update() {
      const newOrderIds = submission.value.selectItems
      await prisma.payments.update({
        where: { id: submission.value.id },
        data: {
          method: submission.value.method,
          amount: submission.value.amount,
          tip: submission.value.tip,
          total: submission.value.total,
          orderId: newOrderIds,
        },
      })

      return redirect('')
    },
  })
}

export default function Payments() {
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const { branchId } = useParams()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'payments',
    constraint: getFieldsetConstraint(paymentsFormSchema),
    lastSubmission: fetcher.data?.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: paymentsFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const addItem = searchParams.get('addItem')
  const editItem = searchParams.get('editItem')
  const deleteItem = searchParams.get('deleteItem')

  return (
    <main>
      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />
      <div className="flex flex-wrap gap-2 p-4">
        {branch.payments.map(payment => (
          <Square
            itemId={payment.id}
            name={
              <>
                <H6 boldVariant="bold">{payment.id}</H6>
                <H6>{parseFloat(payment.amount).toFixed(2)}</H6>
              </>
            }
            to={payment.id}
            key={payment.id}
          />
        ))}
      </div>
      <QueryDialog query="addItem" title="Add Payment" description="Add to the fields you want to add">
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <PaymentForm
            intent="add"
            payments={branch.payments}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.orders, keys: ['total'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>
      <QueryDialog title="Edit Payment" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <PaymentForm
            intent="edit"
            payments={branch.payments}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.orders, keys: ['id'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>
      <QueryDialog title="Delete Payment" description="Are you sure that you want to delete this item?" query={'deleteItem'}>
        <fetcher.Form method="POST" action="/admin/deleteItem" name="DELETE">
          <Button type="submit" disabled={isSubmitting} size="small" variant="danger">
            Delete
          </Button>
          <input type="hidden" name="id" value={deleteItem ? deleteItem : ''} />
          <input type="hidden" name="model" value="payments" />
          <input type="hidden" name="redirect" value={`/admin/${branchId}/payments`} />

          <ErrorList errors={[...form.errors]} id={form.errorId} />
        </fetcher.Form>
      </QueryDialog>
    </main>
  )
}
