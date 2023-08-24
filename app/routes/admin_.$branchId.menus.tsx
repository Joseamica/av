import { conform, useForm } from '@conform-to/react'
import * as Dialog from '@radix-ui/react-dialog'
import { Link, Outlet, useFetcher, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, FlexRow, XIcon } from '~/components'
import { HeaderWithButton } from '~/components/admin/headers'
import { ErrorList, Field } from '~/components/admin/ui/forms'
import { DeleteIcon, EditIcon } from '~/components/icons'

const menuSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20).optional(),
  type: z.string().min(1).max(20).optional(),
  currency: z.string().min(3).max(3).optional(),
  image: z.string().trim().url().optional(),
})

export const handle = { active: 'Menus' }

export async function action({ request, params }: ActionArgs) {
  const { branchId } = params
  const formData = await request.formData()

  const submission = parse(formData, {
    schema: menuSchema,
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
      await prisma.menu.create({
        data: {
          name: submission.value.name,
          type: submission.value.type,
          currency: submission.value.currency,
          image: submission.value.image,
          branch: {
            connect: { id: branchId },
          },
        },
      })
      return redirect('')
    },
    async update() {
      await prisma.menu.update({
        where: { id: submission.value.id },
        data: {
          name: submission.value.name,
          type: submission.value.type,
          currency: submission.value.currency,
          image: submission.value.image,
        },
      })
      return redirect('')
    },
    async delete() {
      await prisma.menu.delete({ where: { id: submission.value.id } })
      return redirect('')
    },
  })
}

export default function Menus() {
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams, setSearchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'menus',
    constraint: getFieldsetConstraint(menuSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: menuSchema })
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
        {branch.menus.map(menu => (
          <FlexRow key={menu.id}>
            <Link to={menu.id} className="w-24 h-24 flex justify-center items-center bg-white break-all rounded-xl shadow text-sm p-1">
              {menu.name}
            </Link>
            <div className="basic-flex-col">
              <button
                className="icon-button edit-button"
                onClick={() => {
                  searchParams.set('editItem', menu.id)
                  setSearchParams(searchParams)
                }}
              >
                <EditIcon />
              </button>
              <button
                className="icon-button del-button"
                onClick={() => {
                  searchParams.set('deleteItem', menu.id)
                  setSearchParams(searchParams)
                }}
              >
                <DeleteIcon />
              </button>
            </div>
          </FlexRow>
        ))}
      </div>
      {/* ANCHOR ADD */}
      <Dialog.Root
        open={addItem ? true : false}
        onOpenChange={() => {
          searchParams.delete('addItem')
          setSearchParams(searchParams)
        }}
      >
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Close className="absolute top-0 right-0 m-3">
            <XIcon />
          </Dialog.Close>
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Add Menu</Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            Enter into the fields below the information about the menu you want to add.
          </Dialog.Description>
          <fetcher.Form method="POST" {...form.props} action="?/create">
            <Field
              labelProps={{ children: 'Name' }}
              inputProps={{
                ...conform.input(fields.name, { type: 'text' }),
                required: true,
              }}
              errors={[fields?.name.errors]}
            />
            <Field
              labelProps={{ children: 'Type' }}
              inputProps={{
                ...conform.input(fields.type, { type: 'text' }),
                required: true,
              }}
              errors={[fields?.type.errors]}
            />
            <Field
              labelProps={{ children: 'Currency' }}
              inputProps={{
                ...conform.input(fields.currency, { type: 'text' }),
                required: true,
              }}
              errors={[fields?.currency.errors]}
            />
            <Field
              labelProps={{ children: 'Image' }}
              inputProps={{
                ...conform.input(fields.image, { type: 'url' }),
                required: true,
              }}
              errors={[fields?.image.errors]}
            />
            <Button size="medium" type="submit" variant="secondary">
              {isSubmitting ? 'Adding menu...' : 'Add menu'}
            </Button>
            <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Root>
      {/* ANCHOR EDIT */}
      <Dialog.Root
        open={editItem ? true : false}
        onOpenChange={() => {
          searchParams.delete('editItem')
          setSearchParams(searchParams)
        }}
      >
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <Dialog.Close className="absolute top-0 right-0 m-3">
            <XIcon />
          </Dialog.Close>
          <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Edit Menu</Dialog.Title>
          <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
            Enter into the fields below the information about the menu you want to edit.
          </Dialog.Description>
          <fetcher.Form method="POST" {...form.props} action="?/update" name="EDIT">
            <Field
              labelProps={{ htmlFor: fields.name.id, children: 'Name' }}
              inputProps={{
                ...conform.input(fields.name, { type: 'text' }),
                defaultValue: branch.menus.find(menu => menu.id === editItem)?.name,
              }}
              errors={[fields?.name.errors]}
            />
            <Field
              labelProps={{ htmlFor: fields.type.id, children: 'Type' }}
              inputProps={{
                ...conform.input(fields.type, { type: 'text' }),
                // autoComplete: data.menu?.type,
                defaultValue: branch.menus.find(menu => menu.id === editItem)?.type,
              }}
              errors={[fields?.type.errors]}
            />
            <Field
              labelProps={{ htmlFor: fields.currency.id, children: 'Currency' }}
              inputProps={{
                ...conform.input(fields.currency, { type: 'text' }),

                defaultValue: branch.menus.find(menu => menu.id === editItem)?.currency,
              }}
              errors={[fields?.currency.errors]}
            />
            <Field
              labelProps={{ htmlFor: fields.image.id, children: 'Image' }}
              inputProps={{
                ...conform.input(fields.image, { type: 'url' }),
                defaultValue: branch.menus.find(menu => menu.id === editItem)?.image,
              }}
              errors={[fields?.image.errors]}
            />
            <Button size="medium" type="submit" variant="secondary">
              {isSubmitting ? 'Editing menu...' : 'Edit menu'}
            </Button>
            <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Root>
      {/* ANCHOR DELETE */}
      <Dialog.Root
        open={deleteItem ? true : false}
        onOpenChange={() => {
          searchParams.delete('deleteItem')
          setSearchParams(searchParams)
        }}
      >
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-80" />
        <Dialog.Content className="data-[state=open]:animate-contentShow fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none">
          <fetcher.Form method="POST" action="?/delete" name="DELETE" {...form.props}>
            <Dialog.Close className="absolute top-0 right-0 m-3">
              <XIcon />
            </Dialog.Close>
            <Dialog.Title className="text-mauve12 m-0 text-[17px] font-medium">Delete</Dialog.Title>
            <Dialog.Description className="text-mauve11 mt-[10px] mb-5 text-[15px] leading-normal">
              Are you sure that you want to delete this item?
            </Dialog.Description>
            <Button type="submit" disabled={isSubmitting} size="small" variant="danger">
              Delete
            </Button>
            <input type="hidden" value={deleteItem ? deleteItem : ''} {...conform.input(fields.id)} />
            <ErrorList errors={[...form.errors]} id={form.errorId} />
          </fetcher.Form>
        </Dialog.Content>
      </Dialog.Root>

      <Outlet />
    </main>
  )
}
