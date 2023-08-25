import { conform, useForm } from '@conform-to/react'
import { Link, Outlet, useFetcher, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { Button, FlexRow } from '~/components'
import { HeaderWithButton } from '~/components/admin/headers'
import { ProductForm } from '~/components/admin/products/product-form'
import { QueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'
import { DeleteIcon, EditIcon } from '~/components/icons'
import { ButtonLink } from '~/components/ui/buttons/button'

const productSchema = z.object({
  id: z.string(),
  plu: z
    .string()
    .min(5)
    .refine(value => value.startsWith('PLU-'), { message: 'PLU must start with "PLU-"' }),
  image: z.string().url(),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  price: z.number(),
  selectItems: z.string().nonempty('You must select at least one category'),
})

export const handle = { active: 'Products' }

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  const submission = parse(formData, {
    schema: productSchema,
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
      await prisma.menuItem.create({
        data: {
          plu: submission.value.plu,
          image: submission.value.image,
          name: submission.value.name,
          description: submission.value.description,
          price: submission.value.price,
          menuCategory: {
            connect: {
              id: submission.value.selectItems,
            },
          },
          available: true,
        },
      })
      return redirect('')
    },
    async update() {
      await prisma.menuItem.update({
        where: { id: submission.value.id },
        data: {
          plu: submission.value.plu,
          image: submission.value.image,
          name: submission.value.name,
          description: submission.value.description,
          price: submission.value.price,
          menuCategory: {
            connect: {
              id: submission.value.selectItems,
            },
          },
          available: true,
        },
      })

      return redirect('')
    },
  })
}
export default function Products() {
  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as any
  const { branchId } = useParams()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'products',
    constraint: getFieldsetConstraint(productSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: productSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const addItem = searchParams.get('addItem')
  const editItem = searchParams.get('editItem')
  const deleteItem = searchParams.get('deleteItem')

  return (
    <main>
      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />
      <ButtonLink variant="secondary" size="small" download="products" href={`/admin/${branchId}/export`}>
        Download Your Data
      </ButtonLink>
      <div className="flex flex-wrap gap-2 p-4">
        {branch.menuItems.map(product => (
          <Square itemId={product.id} name={product.name} to={product.id} key={product.id} />
        ))}
      </div>
      {/* ANCHOR ADD */}
      <QueryDialog title="Add Product" description="Modify the fields you want to add" query={'addItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <ProductForm
            intent="add"
            products={branch.menuItems}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.menuCategories, keys: ['name'] }}
          />
          <input type="hidden" value={addItem ? addItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>
      {/* ANCHOR EDIT */}
      <QueryDialog title="Edit Product" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <ProductForm
            intent="edit"
            products={branch.menuItems}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.menuCategories, keys: ['name'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </QueryDialog>

      {/* ANCHOR DELETE */}
      <QueryDialog title="Delete Product" description="Are you sure that you want to delete this item?" query={'deleteItem'}>
        <fetcher.Form method="POST" action="/admin/deleteItem" name="DELETE">
          <Button type="submit" disabled={isSubmitting} size="small" variant="danger">
            Delete
          </Button>
          <input type="hidden" name="id" value={deleteItem ? deleteItem : ''} />
          <input type="hidden" name="model" value="products" />
          <input type="hidden" name="redirect" value={`/admin/${branchId}/products`} />

          <ErrorList errors={[...form.errors]} id={form.errorId} />
        </fetcher.Form>
      </QueryDialog>

      <Outlet />
    </main>
  )
}
