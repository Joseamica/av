// import type {ActionArgs} from '@remix-run/node'
// import {prisma} from '~/db.server'
// import {getBranchId} from '~/models/branch.server'
// import {getSession} from '~/session.server'
// function adjustCategory(category, menuId) {
//   return {
//     // id: category._id,
//     accountId: category.account,
//     name: category.name,
//     // nameTranslations: category.nameTranslations,
//     description: category.description,
//     // descriptionTranslations: category.descriptionTranslations,
//     // availabilities: category.availabilities,
//     // menuId: category.menu,
//   }
// }
// function adjustMenuItem(product) {
//   return {
//     // id: product._id,
//     plu: product.plu,
//     image: product.imageUrl,
//     name: product.name,
//     description: product.description,
//     price: product.price,
//     available: true,
//     categoryId: product.categoryId,
//   }
// }
// export const action = async ({request}: ActionArgs) => {
//   const session = await getSession(request)
//   const tableId = session.get('tableId')
//   const branchId = await getBranchId(tableId)
//   const rawData = await request.text()
//   const [menuData] = JSON.parse(rawData)
//   const products = Object.values(menuData.products)
//   const menu = await prisma.menu.upsert({
//     where: {id: menuData.menuId},
//     update: {
//       name: menuData.menu,
//       // FIX to eur o mxn
//       currency: String(menuData.currency),
//       branchId: branchId,
//     },
//     create: {
//       id: menuData.menuId,
//       name: menuData.menu,
//       // FIX to eur o mxn
//       currency: String(menuData.currency),
//       branchId: branchId,
//     },
//   })
//   for (const product of products) {
//     const adjustedMenuItem = adjustMenuItem(product)
//     await prisma.product.upsert({
//       where: {id: product._id},
//       update: adjustedMenuItem,
//       create: {
//         ...adjustedMenuItem,
//         id: product._id, // include the id in the create block
//       },
//     })
//   }
//   for (const category of menuData.categories) {
//     const adjustedCategory = adjustCategory(category, menuData.menuId)
//     // Upsert the category
//     const categoryUpserted = await prisma.menuCategory.upsert({
//       where: {id: category._id},
//       update: {
//         accountId: category.account,
//         name: category.name,
//         // nameTranslations: category.nameTranslations,
//         description: category.description,
//       },
//       create: {
//         id: category._id, // include the id in the create block
//         accountId: category.account,
//         name: category.name,
//         // nameTranslations: category.nameTranslations,
//         description: category.description,
//         menu: {connect: {id: menu.id}},
//       },
//     })
//     // Connect each product/product to the upsertedCategory
//     for (const product of category.products) {
//       await prisma.product.update({
//         where: {id: product},
//         data: {
//           menuCategoryId: categoryUpserted.id,
//         },
//       })
//     }
//   }
// }
import { type ActionArgs, json } from '@remix-run/node'

import cuid from 'cuid'
import { prisma } from '~/db.server'
import { getSession } from '~/session.server'
import type { DvctModifierGroup } from '~/types/modifiers'

import { getBranchId } from '~/models/branch.server'

//TODO MAKE MODIFIERS WORK
//TODO MAKE TRANSLATIONS
//TODO MAKE AVAILABILITIESWORK

type DVCT_CATEGORY = {
  _id: string
  account: string
  name: string
  nameTranslations: string[]
  description: string
  descriptionTranslations: string[]
  availabilities: string[]
  menu: string
}

const adjustCategory = (category: DVCT_CATEGORY) => ({
  accountId: category.account,
  name: category.name,
  description: category.description,
})

const adjustMenuItem = (product: any) => ({
  plu: product.plu,
  image: product.imageUrl
    ? product.imageUrl
    : 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2F3.%20TEMAKI%20(HANDROLL)%2FTEMAKI%20NEGITORO.jpg?alt=media&token=08782db0-22ef-49f6-8ac0-4c9c92e59645',
  name: product.name,
  description: product.description,
  price: product.price / 100,
  available: true,
  categoryId: product.categoryId,
})

// Helper function to upsert a menu item
const upsertMenuItem = async product => {
  const adjustedMenuItem = adjustMenuItem(product)
  console.log('adjustedMenuItem', adjustedMenuItem)
  await prisma.product.upsert({
    where: { id: product._id },
    update: adjustedMenuItem,
    create: {
      ...adjustedMenuItem,
      id: product._id,
    },
  })
}

// Helper function to upsert a category and link it with menu items
const upsertCategory = async (category, menu) => {
  const adjustedCategory = adjustCategory(category)

  const categoryUpserted = await prisma.categoryId.upsert({
    where: { id: category._id },
    update: adjustedCategory,
    create: {
      ...adjustedCategory,
      id: category._id,
      menu: { connect: { id: menu.id } },
    },
  })

  for (const product of category.products) {
    await prisma.product.update({
      where: { id: product },
      data: {
        categoryId: categoryUpserted.id,
      },
    })
  }
}

export const action = async ({ request }: ActionArgs) => {
  const session = await getSession(request)
  const tableId = session.get('tableId')
  const branchId = await getBranchId(tableId)
  const rawData = await request.text()
  const [menuData] = JSON.parse(rawData)
  console.log('\x1b[41m%s\x1b[0m', 'api.dvct.menu_update.tsx line:184 menuData', menuData)
  console.log('ModifierGroups -> ', menuData.modifierGroups)

  await prisma.menu.deleteMany({
    where: {
      branchId,
    },
  })

  const menu = await prisma.menu.upsert({
    where: { id: menuData.menuId },
    update: {
      name: menuData.menu,
      currency: String(menuData.currency),
      branchId: branchId,
      image: menuData.menuImageURL,
    },
    create: {
      id: menuData.menuId,
      name: menuData.menu,
      currency: String(menuData.currency),
      image: menuData.menuImageURL,
      branchId: branchId,
    },
  })
  //NOTE - delete all availabilities and then upsert them to prevent duplicatesa
  await prisma.availabilities.deleteMany({
    where: {
      menuId: menu.id,
    },
  })
  for (const availability of menuData.availabilities) {
    await prisma.availabilities.upsert({
      where: {
        dayOfWeek_startTime_endTime_menuId: {
          dayOfWeek: Number(availability.dayOfWeek),
          startTime: availability.startTime,
          endTime: availability.endTime,
          menuId: menu.id,
        },
      },
      update: {
        dayOfWeek: Number(availability.dayOfWeek),
        startTime: availability.startTime,
        endTime: availability.endTime,
      },
      create: {
        id: cuid(),
        dayOfWeek: Number(availability.dayOfWeek),
        startTime: availability.startTime,
        endTime: availability.endTime,
        menuId: menu.id,
      },
    })
  }
  for (const product of Object.values(menuData.products)) {
    await upsertMenuItem(product)
  }

  for (const modifierGroup of Object.values(menuData.modifierGroups) as DvctModifierGroup[]) {
    await prisma.modifierGroup.upsert({
      where: {
        id: modifierGroup._id,
      },
      update: {
        name: modifierGroup.name,
        max: modifierGroup.max,
        min: modifierGroup.min,
        multiMax: modifierGroup.multiMax,
        multiply: modifierGroup.multiply,
        plu: modifierGroup.plu,
        nameTranslations: modifierGroup.nameTranslations,
      },
      create: {
        id: modifierGroup._id,
        name: modifierGroup.name,
        max: modifierGroup.max,
        min: modifierGroup.min,
        multiMax: modifierGroup.multiMax,
        multiply: modifierGroup.multiply,
        plu: modifierGroup.plu,
        nameTranslations: modifierGroup.nameTranslations,
      },
    })
    // for (const modifierItem of Object.values(modifier.modifiers)) {
    //   await prisma.modifier.upsert({
    //     where: {
    //       id: modifierItem._id,
    //     },
    //     update: {
    //       name: modifierItem.name,
    //       price: modifierItem.price,
    //       modifierGroupId: modifier._id,
    //     },
    //     create: {
    //       id: modifierItem._id,
    //       name: modifierItem.name,
    //       price: modifierItem.price,
    //       modifierGroupId: modifier._id,
    //     },
    //   })
    // }
  }

  for (const category of menuData.categories) {
    await upsertCategory(category, menu)
  }

  return json({ success: 'true' })
}
