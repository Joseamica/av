import { conform, useForm } from '@conform-to/react'
import * as Separator from '@radix-ui/react-separator'
import { Link, Outlet, useFetcher, useLoaderData, useParams, useRouteLoaderData, useSearchParams } from '@remix-run/react'
import React from 'react'
import { FaPause, FaPlay } from 'react-icons/fa'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { namedAction } from 'remix-utils'
import invariant from 'tiny-invariant'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { getSearchParams } from '~/utils'

import { Button, FlexRow, H2, H5 } from '~/components'
import { HeaderWithButton } from '~/components/admin/headers'
import { ProductForm } from '~/components/admin/products/product-form'
import { QueryDialog, ScrollableQueryDialog } from '~/components/admin/ui/dialogs/dialog'
import { ErrorList } from '~/components/admin/ui/forms'
import { Square } from '~/components/admin/ui/square'
import { ButtonLink } from '~/components/ui/buttons/button'

const productSchema = z.object({
  id: z.string(),

  plu: z
    .string()
    .min(5)
    .refine(value => value.startsWith('PLU-'), { message: 'PLU must start with "PLU-"' }),
  image: z.string().url(),
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200).optional(),
  price: z.number(),
  selectItems: z.string().nonempty('You must select at least one category'),
})

export const handle = { active: 'Products' }

export async function loader({ request, params }: LoaderArgs) {
  const products = await prisma.product.findMany({
    where: {
      branchId: params.branchId,
    },
    orderBy: [
      {
        available: 'asc', // Sort by createdAt field in the parent model
      },
      {
        category: {
          name: 'asc', // Sort by name field in the related model
        },
      },
    ],

    include: {
      category: true,
    },
  })

  const modifierGroups = await prisma.modifierGroup.findMany({
    where: {
      branchId: params.branchId,
    },
    orderBy: [
      {
        available: 'asc', // Sort by createdAt field in the parent model
      },
      {
        products: {
          _count: 'desc', // Sort by name field in the related model
        },
      },
    ],
    include: {
      modifiers: true,
    },
  })

  const modifiers = await prisma.modifiers.findMany({
    where: {
      branchId: params.branchId,
    },
    orderBy: [
      {
        available: 'asc', // Sort by createdAt field in the parent model
      },
      {
        modifierGroups: {
          available: 'asc', // Sort by createdAt field in the parent model
        },
      },
    ],
  })
  invariant(products, 'categories must be defined')
  const searchParams = getSearchParams({ request })

  switch (searchParams.get('filter')) {
    case 'products':
      return json({ products, modifierGroups })
    case 'modifierG':
      return json({ products: [], modifierGroups })
    case 'modifiers':
      return json({ products: [], modifierGroups: [], modifiers })
    default:
      return json({ products, modifierGroups, modifiers })
  }
}
export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const searchParams = getSearchParams({ request })
  const { branchId } = params
  const available = formData.get('available') as string
  const modifierGAvailable = formData.get('modifierGAvailable') as string
  const modifierAvailable = formData.get('modifierAvailable') as string
  const id = formData.get('id') as string

  if (available === 'true') {
    await prisma.product.update({
      where: { id, branchId },
      data: {
        available: false,
      },
    })
  } else if (available === 'false') {
    await prisma.product.update({
      where: { id, branchId },
      data: {
        available: true,
      },
    })
  }
  if (modifierGAvailable === 'true') {
    await prisma.modifierGroup.update({
      where: { id, branchId },
      data: {
        available: false,
      },
    })
  } else if (modifierGAvailable === 'false') {
    await prisma.modifierGroup.update({
      where: { id, branchId },
      data: {
        available: true,
      },
    })
  }

  if (modifierAvailable === 'true') {
    await prisma.modifiers.update({
      where: { id, branchId },
      data: {
        available: false,
      },
    })
  } else if (modifierAvailable === 'false') {
    await prisma.modifiers.update({
      where: { id, branchId },
      data: {
        available: true,
      },
    })
  }

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
      await prisma.product.create({
        data: {
          plu: submission.value.plu,
          image: submission.value.image,
          name: submission.value.name,
          description: submission.value.description ?? '',
          price: submission.value.price,
          branch: {
            connect: {
              id: params.branchId,
            },
          },
          category: {
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
      await prisma.product.update({
        where: { id: submission.value.id },
        data: {
          plu: submission.value.plu,
          image: submission.value.image,
          name: submission.value.name,
          description: submission.value.description ?? '',
          price: submission.value.price,
          category: {
            connect: {
              id: submission.value.selectItems,
            },
          },
          branch: {
            connect: {
              id: params.branchId,
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
  const data = useLoaderData()
  const { branch } = useRouteLoaderData('routes/admin_+/$branchId') as any
  const { branchId } = useParams()

  const fetcher = useFetcher()
  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams, setSearchParams] = useSearchParams()

  const [form, fields] = useForm({
    id: 'products',
    constraint: getFieldsetConstraint(productSchema),
    lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: productSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const editItem = searchParams.get('editItem')
  const deleteItem = searchParams.get('deleteItem')
  const addProduct = searchParams.get('addProduct')

  return (
    <main>
      <HeaderWithButton queryKey="addItem" queryValue="true" buttonLabel="Add" />
      <FlexRow className="p-4 space-x-4">
        <button
          onClick={() => {
            searchParams.set('filter', 'all')
            setSearchParams(searchParams)
          }}
          className={searchParams.get('filter') === 'all' ? 'underline underline-offset-4' : ''}
        >
          All
        </button>
        <button
          onClick={() => {
            searchParams.set('filter', 'products')
            setSearchParams(searchParams)
          }}
          className={searchParams.get('filter') === 'products' ? 'underline underline-offset-4' : ''}
        >
          Products
        </button>
        <button
          onClick={() => {
            searchParams.set('filter', 'modifierG')
            setSearchParams(searchParams)
          }}
          className={searchParams.get('filter') === 'modifierG' ? 'underline underline-offset-4' : ''}
        >
          Modifier Groups
        </button>
        <button
          onClick={() => {
            searchParams.set('filter', 'modifiers')
            setSearchParams(searchParams)
          }}
          className={searchParams.get('filter') === 'modifiers' ? 'underline underline-offset-4' : ''}
        >
          Modifiers
        </button>
      </FlexRow>
      <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px " />
      {/* FIXME */}
      <ButtonLink variant="secondary" size="small" download="products" href={`/admin/${branchId}/export?dataType=products`}>
        Download Your Data
      </ButtonLink>

      <H2>Number of products: {data.products.length}</H2>
      <H2 className="p-4">Products</H2>

      <div className="flex flex-wrap gap-2 p-4">
        {data.products.map(product => {
          return (
            <div className="flex flex-col" key={product.id}>
              <H5 boldVariant="semibold">{product.category.name}</H5>
              <Square itemId={product.id} name={product.name} to={product.id} key={product.id} />
              <fetcher.Form method="POST">
                <button
                  className="icon-button w-10 flex items-center justify-center "
                  // onClick={() => {
                  //   searchParams.set('available', product.available)
                  //   setSearchParams(searchParams)
                  // }}
                >
                  {product.available ? <FaPause /> : <FaPlay className="fill-green-300" />}
                </button>
                <input type="hidden" name="id" value={product.id} />
                <input type="hidden" name="available" value={product.available} />
              </fetcher.Form>
            </div>
          )
        })}
      </div>
      {/* <Spacer size="md" /> */}
      {data.modifierGroups?.length > 0 && (
        <>
          <H2 className="p-4">Modifier Groups</H2>
          <div className="flex flex-wrap gap-2 p-4">
            {data.modifierGroups?.map(modifierG => {
              return (
                <div className="flex flex-col" key={modifierG.id}>
                  <Square itemId={modifierG.id} name={modifierG.name} to={`modifierGroup/${modifierG.id}`} key={modifierG.id} />
                  <fetcher.Form method="POST">
                    <button
                      className="icon-button w-10 flex items-center justify-center "
                      // onClick={() => {
                      //   searchParams.set('modifierGAvailable', modifierG.available)
                      //   setSearchParams(searchParams)
                      // }}
                    >
                      {modifierG.available ? <FaPause /> : <FaPlay className="fill-green-300" />}
                    </button>
                    <input type="hidden" name="id" value={modifierG.id} />
                    <input type="hidden" name="modifierGAvailable" value={modifierG.available} />
                  </fetcher.Form>
                </div>
              )
            })}
          </div>
        </>
      )}
      {/* <Spacer size="md" /> */}

      {data.modifiers?.length > 0 && (
        <div>
          <H2 className="p-4">Modifiers</H2>
          <div className="flex flex-wrap gap-2 p-4">
            {data.modifiers?.map(modifier => {
              return (
                <div className="flex flex-col" key={modifier.id}>
                  <H5 boldVariant="semibold">{modifier.name}</H5>
                  <Square itemId={modifier.id} name={modifier.name} to={`modifier/${modifier.id}`} key={modifier.id} />
                  <fetcher.Form method="POST">
                    <button
                      className="icon-button w-10 flex items-center justify-center "
                      // onClick={() => {
                      //   searchParams.set('modifierAvailable', modifier.available)
                      //   setSearchParams(searchParams)
                      // }}
                    >
                      {modifier.available ? <FaPause /> : <FaPlay className="fill-green-300" />}
                    </button>
                    <input type="hidden" name="id" value={modifier.id} />
                    <input type="hidden" name="modifierAvailable" value={modifier.available} />
                  </fetcher.Form>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {/* ANCHOR ADD */}
      <QueryDialog title="Add Product" description="Modify the fields you want to add" query={'addItem'}>
        <FlexRow justify="between">
          <Link to="?addProduct=true" className="flex items-center justify-center w-32 h-32 border " preventScrollReset>
            Product
          </Link>
          <Link to="create/modifierG" className="flex items-center justify-center w-32 h-32 border " preventScrollReset>
            Modifier group
          </Link>
          <Link to="create/modifier" className="flex items-center justify-center w-32 h-32 border " preventScrollReset>
            Modifier
          </Link>
        </FlexRow>
      </QueryDialog>

      <ScrollableQueryDialog title="Add Product" description="Modify the fields you want to add" query={'addProduct'}>
        <fetcher.Form method="POST" {...form.props} action="?/create">
          <ProductForm
            intent="add"
            products={data.products}
            editSubItemId={addProduct}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.categories, keys: ['name'] }}
          />
          <input type="hidden" value={addProduct ? addProduct : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </ScrollableQueryDialog>

      {/* ANCHOR EDIT */}
      <ScrollableQueryDialog title="Edit Product" description="Modify the fields you want to edit" query={'editItem'}>
        <fetcher.Form method="POST" {...form.props} action="?/update">
          <ProductForm
            intent="edit"
            products={data.products}
            editSubItemId={editItem}
            isSubmitting={isSubmitting}
            fields={fields}
            addingData={{ data: branch.categories, keys: ['name'] }}
          />
          <input type="hidden" value={editItem ? editItem : ''} {...conform.input(fields.id)} />
        </fetcher.Form>
      </ScrollableQueryDialog>

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
