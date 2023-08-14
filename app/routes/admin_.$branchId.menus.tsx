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
import { EditMenuDialog } from '~/components/admin/menus/dialogs/edit'
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
export const handle = { active: 'Menus' }

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

  const menuId = searchParamsData.itemId ?? searchParamsData.editItem

  if (menuId) {
    const menu = await prisma.menu.findFirst({
      where: { id: menuId },
      include: { availabilities: true, menuCategories: true },
    })

    return json({ menu })
  }
  return json({ menu: null })
}

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()

  const formValues = { ...Object.fromEntries(formData.entries()), selectedItems: formData.getAll('selectedItems') } as FormValues

  console.log('formValues', formValues)

  const searchParams = getSearchParams({ request })
  const searchParamsValues = Object.fromEntries(searchParams)
  console.log('searchParamsData', searchParamsValues)
  const menuId = searchParamsValues.itemId ?? searchParamsValues.editItem
  const redirectTo = safeRedirect(formData.get('redirectTo'), '')

  switch (formValues._action) {
    case ACTIONS.ADD:
      return redirect(redirectTo)
    case ACTIONS.EDIT:
      // Fetch the current category to get the existing selected items

      return redirect(redirectTo)

    case ACTIONS.DELETE:
      await prisma.menu.delete({
        where: { id: menuId },
      })
      return redirect(redirectTo)
    default:
      return redirect(redirectTo)
  }
}

type RouteLoaderData = {
  branch: any
}

export default function Menus() {
  const data = useLoaderData()
  const actionData = useActionData<typeof action>()

  const [form, fields] = useForm({
    id: 'menus',
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
        <HeaderSection backPath="" title="Menus" breadcrumb={itemId} />

        <ItemInfo title="Menu" itemObject={data.menu} />
      </div>
    )
  }

  return (
    <div>
      <EditMenuDialog form={form} fields={fields} branchChild={branch.availabilities} dataChild={data.menu} />
      <AddCategoryDialog form={form} fields={fields} branchChild={branch.menuItems} dataChild={data.category} menus={branch.menus} />

      <HeaderSection addQuery="?addItem=true" backPath=".." title="Menus" />
      <Spacer size="sm" />
      <div className="flex flex-wrap gap-2 ">
        {branch.menus.map(menu => (
          <Container editQuery={`?editItem=${menu.id}`} name={menu.name} itemIdQuery={`?itemId=${menu.id}`} key={menu.id} />
        ))}
      </div>
    </div>
  )
}
