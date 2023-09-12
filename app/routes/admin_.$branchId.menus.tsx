import { conform, useForm } from '@conform-to/react'
import * as Dialog from '@radix-ui/react-dialog'
import { Outlet, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, XIcon } from '~/components'
import { HeaderWithButton } from '~/components/admin/headers'
import { MenuForm } from '~/components/admin/menus/menu-form'
import { ScrollableQueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'

const menuSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20).optional(),
  type: z.string().min(1).max(20).optional(),
  currency: z.string().min(3).max(3).optional(),
  image: z.string().trim().url().optional(),
  selectItems: z.array(z.string()).optional(),
})

export const handle = { active: 'Menus' }

export async function loader({ request, params }: LoaderArgs) {
  const { branchId } = params
  const menus = await prisma.menu.findMany({
    where: {
      branchId,
    },
    include: {
      availabilities: true,
      categories: {
        include: {
          menuItems: true,
        },
      },
    },
  })

  const availabilities = await prisma.availabilities.findMany({
    where: {
      branchId,
    },
    orderBy: {
      dayOfWeek: 'asc',
    },
  })

  return json({ menus, availabilities })
}

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
      // for (const item of submission.value.selectItems) {
      await prisma.menu.create({
        data: {
          name: submission.value.name,
          type: submission.value.type,
          currency: submission.value.currency,
          image: submission.value.image,
          branch: {
            connect: { id: branchId },
          },
          availabilities: {
            connect: submission.value.selectItems ? submission.value.selectItems.map(id => ({ id })) : [],
          },
        },
      })
      // }
      return redirect('')
    },
    async update() {
      await prisma.menu.update({
        where: { id: submission.value.id },
        data: {
          availabilities: {
            set: [],
          },
        },
      })

      await prisma.menu.update({
        where: { id: submission.value.id },
        data: {
          name: submission.value.name,
          type: submission.value.type,
          currency: submission.value.currency,
          image: submission.value.image,
          availabilities: {
            connect: submission.value.selectItems ? submission.value.selectItems.map(id => ({ id })) : [],
          },
          branch: {
            connect: { id: branchId },
          },
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
  const data = useLoaderData()

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
        {data.menus.map(menu => (
          <Square itemId={menu.id} name={menu.name} to={menu.id} key={menu.id} />
        ))}
      </div>
      {/* ANCHOR ADD */}

      <ScrollableQueryDialog title="Add Menu" description="Add to the fields you want to add" query={'addItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <MenuForm
            intent="add"
            menus={data.menus}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: data.availabilities, keys: ['dayOfWeek'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </ScrollableQueryDialog>
      {/* ANCHOR EDIT */}
      <ScrollableQueryDialog
        title="Edit Menu"
        description="Enter into the fields below the information about the menu you want to edit."
        query={'editItem'}
      >
        <fetcher.Form method="POST" {...form.props} action="?/update" className="">
          <MenuForm
            intent="edit"
            menus={data.menus}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: data.availabilities, keys: ['dayOfWeek'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </ScrollableQueryDialog>

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
