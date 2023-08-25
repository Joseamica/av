import { conform, useForm } from '@conform-to/react'
import { useFetcher, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { dayOfWeek } from '~/utils'

import { Button, H5, H6 } from '~/components'
import { AvailabilityForm } from '~/components/admin/availabilities/availability-form'
import { HeaderWithButton } from '~/components/admin/headers'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'

export const handle = { active: 'Availabilities' }

const availabilitySchema = z.object({
  id: z.string(),
  dayOfWeek: z.number().min(1).max(7),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  selectItems: z.string().nonempty('You must select at least one category'),
})

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  const submission = parse(formData, {
    schema: availabilitySchema,
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
      await prisma.availabilities.create({
        data: {
          dayOfWeek: submission.value.dayOfWeek,
          startTime: submission.value.startTime,
          endTime: submission.value.endTime,
          menu: {
            connect: {
              id: submission.value.selectItems,
            },
          },
        },
      })
      return redirect('')
    },
    async update() {
      await prisma.availabilities.update({
        where: { id: submission.value.id },
        data: {
          dayOfWeek: submission.value.dayOfWeek,
          startTime: submission.value.startTime,
          endTime: submission.value.endTime,
          menu: {
            connect: {
              id: submission.value.selectItems,
            },
          },
        },
      })

      return redirect('')
    },
  })
}

export default function Availabilities() {
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const { branchId } = useParams()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'availabilities',
    constraint: getFieldsetConstraint(availabilitySchema),
    lastSubmission: fetcher.data?.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: availabilitySchema })
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
        {branch.availabilities.map(availability => (
          <Square
            itemId={availability.id}
            name={
              <>
                <H5 boldVariant="bold">{dayOfWeek(availability.dayOfWeek)}</H5>
                <H6>
                  {availability.startTime} - {availability.endTime}
                </H6>
              </>
            }
            to={availability.id}
            key={availability.id}
          />
        ))}
      </div>
      <QueryDialog title="Add Availability" description="Add to the fields you want to add" query={'addItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <AvailabilityForm
            intent="add"
            availabilities={branch.availabilities}
            editSubItemId={addItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.menus, keys: ['name'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>
      <QueryDialog title="Edit Availability" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <AvailabilityForm
            intent="edit"
            availabilities={branch.availabilities}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.menus, keys: ['name'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>

      <QueryDialog title="Delete Availability" description="Are you sure that you want to delete this item?" query={'deleteItem'}>
        <fetcher.Form method="POST" action="/admin/deleteItem" name="DELETE">
          <Button type="submit" disabled={isSubmitting} size="small" variant="danger">
            Delete
          </Button>
          <input type="hidden" name="id" value={deleteItem ? deleteItem : ''} />
          <input type="hidden" name="model" value="availabilities" />
          <input type="hidden" name="redirect" value={`/admin/${branchId}/availabilities`} />

          <ErrorList errors={[...form.errors]} id={form.errorId} />
        </fetcher.Form>
      </QueryDialog>
    </main>
  )
}
