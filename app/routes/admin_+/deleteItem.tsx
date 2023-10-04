import { type ActionArgs, redirect } from '@remix-run/node'

import { prisma } from '~/db.server'

import { getSearchParams } from '~/utils'

export async function action({ request, params }: ActionArgs) {
  const formData = await request.formData()
  const data = Object.fromEntries(formData.entries())
  const id = data.id as string
  const model = data.model as string
  const redirectTo = data.redirect as string
  const searchParams = getSearchParams({ request })
  const mode = searchParams.get('mode')

  const modelFunctions = {
    availabilities: async () => {
      await prisma.availabilities.delete({
        where: {
          id: id,
        },
      })
    },
    menus: async () => {
      await prisma.menu.delete({
        where: {
          id: id,
        },
      })
    },
    branches: async () => {
      await prisma.branch.delete({
        where: {
          id: id,
        },
      })
    },
    products: async () => {
      // FIXME This is bad practice, temporal solution
      try {
        await prisma.product.delete({
          where: {
            id: id,
          },
        })
      } catch (e) {
        console.log('Error deleting product:', e)
      }

      try {
        await prisma.modifierGroup.delete({
          where: {
            id: id,
          },
        })
      } catch (e) {
        console.log('Error deleting modifierGroup:', e)
      }

      try {
        await prisma.modifiers.delete({
          where: {
            id: id,
          },
        })
      } catch (e) {
        console.log('Error deleting modifiers:', e)
      }
    },
    categories: async () => {
      await prisma.category.delete({
        where: {
          id: id,
        },
      })
    },
    payments: async () => {
      if (mode === 'deleteAll') {
        await prisma.payments.deleteMany({
          where: {
            branchId: id,
          },
        })
      } else {
        await prisma.payments.delete({
          where: {
            id: id,
          },
        })
      }
    },
    users: async () => {
      await prisma.user.delete({
        where: {
          id: id,
        },
      })
    },
    employees: async () => {
      await prisma.employee.delete({
        where: {
          id: id,
        },
      })
    },
    notifications: async () => {
      await prisma.notification.delete({
        where: {
          id: id,
        },
      })
    },
    modifierGroups: async () => {
      await prisma.modifierGroup.delete({
        where: {
          id: id,
        },
      })
    },
  }

  await modelFunctions[model]()

  return redirect(redirectTo)
}
