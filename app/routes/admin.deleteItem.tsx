import { type ActionArgs, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData.entries())
  const id = data.id as string
  const model = data.model as string
  const redirectTo = data.redirect as string

  switch (model) {
    case 'availabilities':
      await prisma.availabilities.delete({
        where: {
          id: id,
        },
      })

      return redirect(redirectTo)
    case 'menus':
      await prisma.menu.delete({
        where: {
          id: id,
        },
      })
      break
    case 'branches':
      await prisma.branch.delete({
        where: {
          id: id,
        },
      })
      break
    case 'products':
      await prisma.menuItem.delete({
        where: {
          id: id,
        },
      })
      break
    case 'categories':
      await prisma.category.delete({
        where: {
          id: id,
        },
      })
      break
    case 'payments':
      await prisma.payments.delete({
        where: {
          id: id,
        },
      })
      break
    case 'users':
      await prisma.user.delete({
        where: {
          id: id,
        },
      })
      break
    case 'employees':
      await prisma.employee.delete({
        where: {
          id: id,
        },
      })
      break
    case 'notifications':
      await prisma.notification.delete({
        where: {
          id: id,
        },
      })
      break
  }

  return redirect(redirectTo)
}
