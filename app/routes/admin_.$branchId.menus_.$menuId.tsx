import { conform, useForm } from '@conform-to/react'
import * as Dialog from '@radix-ui/react-dialog'
import * as Separator from '@radix-ui/react-separator'
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { checkboxSchema } from '~/utils/zod-extensions'

import { Button, ChevronLeftIcon, FlexRow, H1, H2, H3, Spacer, XIcon } from '~/components'
import { AvailabilityForm } from '~/components/admin/availabilities/availability-form'
import { DataTable } from '~/components/admin/table'
import { CheckboxField, ErrorList, Field } from '~/components/admin/ui/forms'

const menuIdSchema = z.object({
  id: z.string(),
  type: z.enum(['availability', 'category']),
  name: z.string().optional(),
  pdf: checkboxSchema().optional(),
  dayOfWeek: z.number().min(1).max(7).optional(),
  startTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
  endTime: z
    .string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .optional(),
})

export async function loader({ request, params }: LoaderArgs) {
  const { menuId } = params
  invariant(menuId, 'menuId is required')
  const menu = await prisma.menu.findFirst({
    where: { id: menuId },
    include: { availabilities: true, categories: true },
  })
  return json({ menu })
}
export async function action({ request, params }: ActionArgs) {
  const { menuId } = params
  const formData = await request.formData()

  const submission = await parse(formData, {
    schema: () => {
      return menuIdSchema.superRefine(async (data, ctx) => {
        const actionType = formData.get('actionType')
        if (data.type !== 'availability' || actionType === 'delete') return
        const existingAvailabilities = await prisma.availabilities.findFirst({
          where: {
            menuId: menuId,
            dayOfWeek: data.dayOfWeek,
            startTime: data.startTime,
            endTime: data.endTime,
          },
        })
        if (existingAvailabilities) {
          ctx.addIssue({
            path: ['dayOfWeek'],
            code: z.ZodIssueCode.custom,
            message: 'Combination of Day of the week, startTime, endTime, and menuId already exists',
          })
          return
        }
      })
    },
    async: true,
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

  const type = submission.value.type

  return namedAction(request, {
    async update() {
      switch (type) {
        case 'availability':
          await prisma.availabilities.update({
            where: { id: submission.value.id },
            data: {
              dayOfWeek: submission.value.dayOfWeek,
              startTime: submission.value.startTime,
              endTime: submission.value.endTime,
            },
          })
          return redirect('')
        case 'category':
          await prisma.category.update({
            where: { id: submission.value.id },
            data: {
              name: submission.value.name,
              pdf: submission.value.pdf,
            },
          })
          return redirect('')
        default:
          return redirect('')
      }
    },
    async delete() {
      switch (type) {
        case 'availability':
          console.log('hola')
          await prisma.availabilities.delete({ where: { id: submission.value.id } })
          return redirect('')
        case 'category':
          await prisma.category.delete({ where: { id: submission.value.id } })
          return redirect('')
        default:
          return redirect('')
      }
    },
  })
}

export default function MenuId() {
  const data = useLoaderData()

  const fetcher = useFetcher()

  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams, setSearchParams] = useSearchParams()

  const availabilitiesKeysToShow = ['dayOfWeek', 'startTime', 'endTime']
  const categoriesKeysToShow = ['name', 'pdf']

  return (
    <div>
      <div className="flex flex-row items-center justify-between h-20 p-4 bg-white border-b-2">
        <FlexRow>
          <Link to={`/admin/${data.menu.branchId}/menus`}>
            <ChevronLeftIcon className="w-8 h-8 border rounded-full" />
          </Link>
          <div>
            <H1>{data.menu?.name.toUpperCase()}</H1>
          </div>
        </FlexRow>
      </div>
      <div className="p-4 space-y-4">
        <FlexRow>
          <img src={data.menu.image} alt="" className="object-cover w-20 h-20" />
          <div>
            <H3>Name: {data.menu.name}</H3>
            <H3>Type: {data.menu.type}</H3>
            <H3>Currency: {data.menu.currency}</H3>
          </div>
        </FlexRow>
        <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />

        <DataTable
          items={data.menu.availabilities}
          keysToShow={availabilitiesKeysToShow}
          title="Availabilities"
          editType="availability"
          deleteType="availability"
          setSearchParams={setSearchParams}
          addPath={`/admin/${data.menu.branchId}/availabilities`}
        />

        <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />

        <DataTable
          items={data.menu.categories}
          keysToShow={categoriesKeysToShow}
          title="Categories"
          editType="category"
          deleteType="category"
          setSearchParams={setSearchParams}
          addPath={`/admin/${data.menu.branchId}/categories`}
        />
      </div>

      <EditDialog
        searchParams={searchParams}
        setSearchParams={setSearchParams}
        isSubmitting={isSubmitting}
        fetcher={fetcher}
        data={data.menu}
      />
      <DeleteDialog searchParams={searchParams} setSearchParams={setSearchParams} isSubmitting={isSubmitting} fetcher={fetcher} />
    </div>
  )
}

const EditDialog = ({ searchParams, setSearchParams, isSubmitting, fetcher, data }) => {
  const editSubItem = searchParams.get('editSubItem')
  const editType = searchParams.get('editType')

  const [editForm, editFields] = useForm({
    id: 'editForm',
    constraint: getFieldsetConstraint(menuIdSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: menuIdSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  return (
    <Dialog.Root
      open={editSubItem ? true : false}
      onOpenChange={() => {
        searchParams.delete('editSubItem')
        searchParams.delete('editType')
        setSearchParams(searchParams)
      }}
    >
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
      <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <Dialog.Close className="absolute top-0 right-0 m-3">
          <XIcon />
        </Dialog.Close>
        <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Edit</Dialog.Title>
        <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
          Edit the fields you want to change
        </Dialog.Description>
        <fetcher.Form method="POST" {...editForm.props} action="?/update">
          {editType === 'availability' && (
            <>
              <AvailabilityForm
                intent="edit"
                availabilities={data.availabilities}
                isSubmitting={isSubmitting}
                editSubItemId={editSubItem}
                fields={editFields}
              />
            </>
          )}
          {editType === 'category' && (
            <>
              <Field
                labelProps={{ children: 'Name' }}
                inputProps={{
                  ...conform.input(editFields.name),
                  defaultValue: data.categories.find(category => category.id === editSubItem)?.name,
                }}
                errors={editFields.name.errors}
              />
              <CheckboxField
                labelProps={{ children: 'PDF' }}
                buttonProps={{
                  ...conform.input(editFields.pdf),
                  defaultChecked: data.categories.find(category => category.id === editSubItem)?.pdf,
                }}
                errors={editFields.pdf.errors}
              />

              <Button size="medium" type="submit" variant="secondary">
                {isSubmitting ? 'Editing category...' : 'Edit category'}
              </Button>
            </>
          )}
          <input type="hidden" value={editSubItem ?? ''} {...conform.input(editFields.id)} />
          <input type="hidden" value={editType ?? ''} {...conform.input(editFields.type)} />
        </fetcher.Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

const DeleteDialog = ({ searchParams, setSearchParams, isSubmitting, fetcher }) => {
  const deleteSubItem = searchParams.get('deleteSubItem')
  const deleteType = searchParams.get('deleteType')
  const [delForm, delFields] = useForm({
    id: 'deleteForm',
    //  onSubmit(event, { submission }) {
    //       event.preventDefault();

    //       // This will log `{ productId: 'rf23g43', intent: 'add-to-cart' }`
    //       // or `{ productId: 'rf23g43', intent: 'buy-now' }`
    //       console.log(submission.payload);
    //     },
    constraint: getFieldsetConstraint(menuIdSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: menuIdSchema })
    },
    shouldRevalidate: 'onBlur',
  })
  return (
    <Dialog.Root
      open={deleteSubItem ? true : false}
      onOpenChange={() => {
        searchParams.delete('deleteSubItem')
        searchParams.delete('deleteType')
        setSearchParams(searchParams)
      }}
    >
      <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
      <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
        <fetcher.Form method="POST" action={`?/delete`} name="DELETE" {...delForm.props}>
          <Dialog.Close className="absolute top-0 right-0 m-3">
            <XIcon />
          </Dialog.Close>
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Delete</Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            Are you sure that you want to delete this item?
          </Dialog.Description>
          <Button className="w-full" type="submit" disabled={isSubmitting} name="intent" value="deleteSubItem">
            Delete
          </Button>
          <input type="hidden" value={deleteSubItem ?? ''} {...conform.input(delFields.id)} />
          <input type="hidden" value={deleteType ?? ''} {...conform.input(delFields.type)} />
          <input type="hidden" name="actionType" value="delete" />

          <ErrorList errors={[...delForm.errors]} id={delForm.errorId} />
        </fetcher.Form>
      </Dialog.Content>
    </Dialog.Root>
  )
}
