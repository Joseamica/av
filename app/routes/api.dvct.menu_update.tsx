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

// function adjustMenuItem(menuItem) {
//   return {
//     // id: menuItem._id,
//     plu: menuItem.plu,
//     image: menuItem.imageUrl,
//     name: menuItem.name,
//     description: menuItem.description,
//     price: menuItem.price,
//     available: true,
//     menuCategoryId: menuItem.menuCategoryId,
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
//     await prisma.menuItem.upsert({
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

//     // Connect each product/menuItem to the upsertedCategory
//     for (const product of category.products) {
//       await prisma.menuItem.update({
//         where: {id: product},
//         data: {
//           menuCategoryId: categoryUpserted.id,
//         },
//       })
//     }
//   }

// }

import {json, type ActionArgs} from '@remix-run/node'
import cuid from 'cuid'
import {prisma} from '~/db.server'
import {getBranchId} from '~/models/branch.server'
import {getSession} from '~/session.server'

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

const adjustMenuItem = (menuItem: any) => ({
  plu: menuItem.plu,
  image: menuItem.imageUrl,
  name: menuItem.name,
  description: menuItem.description,
  price: menuItem.price / 100,
  available: true,
  menuCategoryId: menuItem.menuCategoryId,
})

// Helper function to upsert a menu item
const upsertMenuItem = async product => {
  const adjustedMenuItem = adjustMenuItem(product)
  await prisma.menuItem.upsert({
    where: {id: product._id},
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

  const categoryUpserted = await prisma.menuCategory.upsert({
    where: {id: category._id},
    update: adjustedCategory,
    create: {
      ...adjustedCategory,
      id: category._id,
      menu: {connect: {id: menu.id}},
    },
  })

  for (const product of category.products) {
    await prisma.menuItem.update({
      where: {id: product},
      data: {
        menuCategoryId: categoryUpserted.id,
      },
    })
  }
}

export const action = async ({request}: ActionArgs) => {
  const session = await getSession(request)
  const tableId = session.get('tableId')
  const branchId = await getBranchId(tableId)
  const rawData = await request.text()
  const [menuData] = JSON.parse(rawData)
  console.log('menuData', menuData)

  const menu = await prisma.menu.upsert({
    where: {id: menuData.menuId},
    update: {
      name: menuData.menu,
      currency: String(menuData.currency),
      branchId: branchId,
    },
    create: {
      id: menuData.menuId,
      name: menuData.menu,
      currency: String(menuData.currency),
      branchId: branchId,
    },
  })
  //NOTE - delete all availabilities and then upsert them to prevent duplicates
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

  for (const category of menuData.categories) {
    await upsertCategory(category, menu)
  }

  return json({success: 'true'})
}
