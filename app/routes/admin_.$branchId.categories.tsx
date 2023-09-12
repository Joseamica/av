import { conform, useForm } from '@conform-to/react'
import { useFetcher, useLoaderData, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { capitalizeFirstLetter } from '~/utils'
import { checkboxSchema } from '~/utils/zod-extensions'

import { Button } from '~/components'
import { CategoryForm } from '~/components/admin/categories/category-form'
import { HeaderWithButton } from '~/components/admin/headers'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'
import { ButtonLink } from '~/components/ui/buttons/button'

export const handle = { active: 'Categories' }

const categoriesFormSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(20),
  image: z.string().trim().url().optional(),
  pdf: checkboxSchema(),
  description: z.string().min(1).max(100).optional(),
  selectItems: z.string().nonempty('You must select at least one category'),
})
export async function loader({ request, params }: LoaderArgs) {
  const categories = await prisma.menuCategory.findMany({
    where: {
      branchId: params.branchId,
    },
  })
  invariant(categories, 'categories must be defined')
  return json({ categories })
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  const submission = parse(formData, {
    schema: categoriesFormSchema,
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
        await prisma.menuCategory.create({
          data: {
            name: capitalizeFirstLetter(submission.value.name),
            image: submission.value.image,
            pdf: submission.value.pdf,
            menu: {
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
      const newMenuIds = submission.value.selectItems
      await prisma.menuCategory.update({
        where: { id: submission.value.id },
        data: {
          menu: { set: [] },
        },
      })
      for (const item of newMenuIds) {
        await prisma.menuCategory.update({
          where: { id: submission.value.id },
          data: {
            name: capitalizeFirstLetter(submission.value.name),
            image: submission.value.image,
            pdf: submission.value.pdf,
            menu: {
              connect: {
                id: item,
              },
            },
          },
        })
      }

      return redirect('')
    },
  })
}

export default function Name() {
  const data = useLoaderData()
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const { branchId } = useParams()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'categories',
    constraint: getFieldsetConstraint(categoriesFormSchema),
    lastSubmission: fetcher.data?.submission,

    onValidate({ formData }) {
      return parse(formData, { schema: categoriesFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const addItem = searchParams.get('addItem')
  const editItem = searchParams.get('editItem')
  const deleteItem = searchParams.get('deleteItem')

  return (
    <main>
      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />
      <ButtonLink variant="secondary" size="small" download="categories" href={`/admin/${branchId}/export?dataType=categories`}>
        Download Your Data
      </ButtonLink>
      <div className="flex flex-wrap gap-2 p-4">
        {data.categories.map(category => (
          <Square itemId={category.id} name={category.name} to={category.id} key={category.id} />
        ))}
      </div>
      <QueryDialog query="addItem" title="Add Category" description="Add to the fields you want to add">
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <CategoryForm
            intent="add"
            categories={data.categories}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.menus, keys: ['name'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>
      <QueryDialog title="Edit Category" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <CategoryForm
            intent="edit"
            categories={data.categories}
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
          <input type="hidden" name="model" value="categories" />
          <input type="hidden" name="redirect" value={`/admin/${branchId}/categories`} />

          <ErrorList errors={[...form.errors]} id={form.errorId} />
        </fetcher.Form>
      </QueryDialog>
    </main>
  )
}
