import * as Dialog from '@radix-ui/react-dialog'
import * as Separator from '@radix-ui/react-separator'
import { Link, useFetcher, useLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionFunctionArgs, type LoaderFunctionArgs, json, redirect } from '@remix-run/node'

import invariant from 'tiny-invariant'
import { prisma } from '~/db.server'

import { ChevronLeftIcon, FlexRow, H1, H3 } from '~/components'
import { DataTable } from '~/components/admin/table'

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { categoryId } = params
  invariant(categoryId, 'categoryId is required')
  const category = await prisma.category.findFirst({
    where: { id: categoryId },
    include: { availabilities: true, products: true },
  })
  return json({ category })
}
export async function action({ request, params }: ActionFunctionArgs) {
  const formData = await request.formData()
  return json({ success: true })
}

export default function CategoriesId() {
  const data = useLoaderData()
  const fetcher = useFetcher()

  const isSubmitting = fetcher.state !== 'idle'
  const [searchParams, setSearchParams] = useSearchParams()

  const availabilitiesKeysToShow = ['name', 'price']
  const categoriesKeysToShow = ['name', 'pdf']
  return (
    <div>
      <div className="flex flex-row items-center justify-between h-20 p-4 bg-white border-b-2">
        <FlexRow>
          <Link to={`/admin/${data.category.branchId}/menus`}>
            <ChevronLeftIcon className="w-8 h-8 border rounded-full" />
          </Link>
          <div>
            <H1>{data.category?.name.toUpperCase()}</H1>
          </div>
        </FlexRow>
      </div>
      <div className="p-4 space-y-4">
        <FlexRow>
          <img src={data.category.image} alt="" className="object-cover w-20 h-20" />
          <div>
            <H3>Name: {data.category.name}</H3>
            <H3>Type: {data.category.type}</H3>
            <H3>PDF: {data.category.pdf ? 'True' : 'False'}</H3>
          </div>
        </FlexRow>
        <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />

        <DataTable
          items={data.category.products}
          keysToShow={availabilitiesKeysToShow}
          title="Products"
          editType="product"
          deleteType="product"
          setSearchParams={setSearchParams}
          addPath={`/admin/${data.category.branchId}/products`}
        />

        <Separator.Root className="bg-zinc-200 data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-full data-[orientation=vertical]:w-px my-[15px]" />

        {/* <DataTable
          items={data.menu.categories}
          keysToShow={categoriesKeysToShow}
          title="Categories"
          editType="category"
          deleteType="category"
          setSearchParams={setSearchParams}
          addPath={`/admin/${data.menu.branchId}/categories`}
        /> */}
      </div>
    </div>
  )
}
