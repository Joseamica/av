import { useForm } from '@conform-to/react'
import { useActionData, useLoaderData, useRouteLoaderData, useSearchParams } from '@remix-run/react'

import { type ActionArgs, type LoaderArgs, json, redirect } from '@remix-run/node'

import { getFieldsetConstraint, parse } from '@conform-to/zod'
import { safeRedirect } from 'remix-utils'
import { z } from 'zod'
import { prisma } from '~/db.server'

import { getSearchParams } from '~/utils'
import { checkboxSchema } from '~/utils/zod-extensions'

import { Spacer } from '~/components'
import { AddCategoryDialog } from '~/components/admin/categories/dialogs/add'
import { EditCategoryDialog } from '~/components/admin/categories/dialogs/edit'
import Container from '~/components/admin/ui/container'
import HeaderSection from '~/components/admin/ui/header-section'
import ItemInfo from '~/components/admin/ui/selected-item-info'

type FormValues = {
  _action: 'add' | 'edit' | 'del' | string // other possible values
  name: string
  image: string
  pdf: string
  description: string
  selectedItems: FormDataEntryValue[]
  menu: string
  // other properties as needed...
}
export const handle = { active: 'Categories' }

const ACTIONS = {
  ADD: 'add',
  EDIT: 'edit',
  DELETE: 'del',
}

const categoriesFormSchema = z.object({
  name: z.string().min(1).max(20),
  image: z.string().trim().url().optional(),
  pdf: checkboxSchema(),
  description: z.string().min(1).max(100).optional(),
})

export async function loader({ request, params }: LoaderArgs) {
  const searchParams = getSearchParams({ request })
  const searchParamsData = Object.fromEntries(searchParams)

  const categoryId = searchParamsData.itemId ?? searchParamsData.editItem

  if (categoryId) {
    const category = await prisma.menuCategory.findFirst({
      where: { id: categoryId },
      include: { menuItems: { include: { cartItems: true } } },
    })

    return json({ category })
  }
  return json({ category: null })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  const formValues = { ...Object.fromEntries(formData.entries()), selectedItems: formData.getAll('selectedItems') } as FormValues

  console.log('formValues', formValues)

  const searchParams = getSearchParams({ request })
  const searchParamsValues = Object.fromEntries(searchParams)
  console.log('searchParamsData', searchParamsValues)
  const categoryId = searchParamsValues.itemId ?? searchParamsValues.editItem
  const redirectTo = safeRedirect(formData.get('redirectTo'), '')

  switch (formValues._action) {
    case ACTIONS.ADD:
      const selectedItemsAsString = formValues.selectedItems.map(id => String(id))

      await prisma.menuCategory.create({
        data: {
          name: formValues.name,
          imageUrl: formValues.image,
          pdf: formValues.pdf === 'on',
          description: formValues.description,
          menuItems: {
            connect: formValues.selectedItems.map(id => ({ id: String(id) })),
          },
          menu: {
            connect: { id: formValues.menu },
          },
        },
      })
      return redirect(redirectTo)
    case ACTIONS.EDIT:
      // Fetch the current category to get the existing selected items
      const currentCategory = await prisma.menuCategory.findUnique({
        where: { id: categoryId },
        include: { menuItems: true },
      })

      // Extract the existing selected item IDs
      const prevSelectedItems = currentCategory?.menuItems.map(item => item.id) || []

      // Determine the items to connect and disconnect
      const connectIds = formValues.selectedItems.filter(id => !prevSelectedItems.includes(String(id))).map(id => String(id))
      const disconnectIds = prevSelectedItems.filter(id => !formValues.selectedItems.includes(id)).map(id => String(id))

      // Update the category with the new selected and unselected items
      await prisma.menuCategory.update({
        where: { id: categoryId },
        data: {
          name: formValues.name,
          imageUrl: formValues.image && formValues.image,
          pdf: formValues.pdf === 'on',
          description: formValues.description && formValues.description,
          menuItems: {
            connect: connectIds.map(id => ({ id })),
            disconnect: disconnectIds.map(id => ({ id })),
          },
        },
      })
      return redirect(redirectTo)

    case ACTIONS.DELETE:
      await prisma.menuCategory.delete({
        where: { id: categoryId },
      })
      return redirect(redirectTo)
    default:
      return redirect(redirectTo)
  }
}

type RouteLoaderData = {
  branch: any
}

export default function Categories() {
  const data = useLoaderData()
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'categories',
    constraint: getFieldsetConstraint(categoriesFormSchema),
    lastSubmission: actionData?.submission ?? data.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: categoriesFormSchema })
    },
    shouldRevalidate: 'onBlur',
  })

  const { branch } = useRouteLoaderData('routes/admin_.$branchId') as RouteLoaderData

  const [searchParams] = useSearchParams()

  const itemId = searchParams.get('itemId')

  if (itemId) {
    return (
      <div>
        <HeaderSection backPath="" title="Categories" breadcrumb={itemId} />

        <ItemInfo title="Users" itemObject={data.category} />
      </div>
    )
  }

  return (
    <div>
      <EditCategoryDialog form={form} fields={fields} branchChild={branch.menuItems} dataChild={data.category} />
      <AddCategoryDialog form={form} fields={fields} branchChild={branch.menuItems} dataChild={data.category} menus={branch.menus} />

      <HeaderSection addQuery="?addItem=true" backPath=".." title="Categories" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.menuCategories.map((category: any) => {
          return (
            <Container
              editQuery={`?editItem=${category.id}`}
              name={category.name}
              itemIdQuery={`?itemId=${category.id}`}
              key={category.id}
            />
          )
        })}
      </div>
    </div>
  )
}
