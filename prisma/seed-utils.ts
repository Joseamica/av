import { faker } from '@faker-js/faker'
import type { EmployeeRoles, Role } from '@prisma/client'
import { prisma } from '~/db.server'

import { createPassword, getPasswordHash } from '~/utils'

// const {faker} = require('@faker-js/faker')
const AVOQADO_LOGO =
  'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKUIKKU%20(2)%20(1)%20copy.png?alt=media&token=158e8d1b-d24b-406b-85e7-a507b29d84fc'

export function createAdminRole() {
  return prisma.role.create({
    data: {
      name: 'admin',
      permissions: {
        create: { name: 'admin' },
      },
    },
  })
}

export function createModeratorRole() {
  return prisma.role.create({
    data: {
      name: 'moderator',
      permissions: {
        create: { name: 'moderator' },
      },
    },
  })
}

export async function createUsers(totalUsers) {
  console.time(`👤 Created ${totalUsers} users...`)
  for (let i = 0; i < totalUsers; i++) {
    await prisma.user.create({
      data: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        color: faker.internet.color(),
      },
    })
  }
  const adminData = { name: 'Admin', email: 'admin@gmail.com', color: '#1AA7EC' }
  const adminRole = await prisma.role.findFirst({ where: { name: 'admin' } })
  await prisma.user.create({
    data: {
      ...adminData,
      roles: { connect: { id: adminRole.id } },

      password: {
        create: {
          hash: await getPasswordHash('administrator'),
        },
      },
    },
  })

  const moderatorRole = await prisma.role.findFirst({ where: { name: 'moderator' } })
  for (let i = 0; i < 3; i++) {
    await prisma.user.create({
      data: {
        name: `moderator${i}`,
        email: `${i}mod@gmail.com`,
        color: '#1AA74C',
        roles: { connect: { id: moderatorRole.id } },

        password: {
          create: {
            hash: await getPasswordHash('moderator'),
          },
        },
      },
    })
  }
  console.timeEnd(`👤 Created ${totalUsers} users...`)
}

export async function createChainAndBranches() {
  const chainIds = []
  const moderatorRole = await prisma.role.findFirst({ where: { name: 'moderator' } })
  const moderators = await prisma.user.findMany({
    where: {
      roles: {
        some: {
          id: moderatorRole.id,
        },
      },
    },
  })
  const moderatorIds = moderators.map(mod => mod.id)

  // Create 2 chains
  for (let i = 0; i < 2; i++) {
    const chain = await createChain(1, moderatorIds) // Passing moderator IDs
    chainIds.push(chain.id)

    // Create 2 branches for each chain
    for (let j = 0; j < 2; j++) {
      const branch = await createBranch(chain.id, 1) // Your existing createBranch function

      // Create 4 tables for each branch
      const tableIds = await createTables(branch.id, 4) // Your existing createTables function

      // Create 3 employees for each branch (1 manager and 2 waiters)
      await createEmployees(branch.id, tableIds, 1, 2) // Modified createEmployees function

      // Create menu, availabilities, categories, products, and modifiers for each branch
      const menu = await createMenu(branch.id) // Your existing createMenu function
      await createAvailabilities(menu.id) // Your existing createAvailabilities function
      const categories = await createCategories(menu.id, branch.id) // Your existing createCategories function
      await createProductsAndModifiers(categories, branch.id) // Your existing createProductsAndModifiers function
    }
  }
}

// Modify createEmployees function to take the number of managers and waiters as arguments
export async function createEmployees(branchId: string, tableIds: string[], numManagers: number, numWaiters: number) {
  for (let i = 0; i < numManagers; i++) {
    await createEmployee('manager', branchId, tableIds)
  }

  for (let i = 0; i < numWaiters; i++) {
    await createEmployee('waiter', branchId, tableIds)
  }

  console.log('🧑🏼‍🍳 Created the employees...')
}

async function createEmployee(role: EmployeeRoles, branchId: string, tableIds: string[]) {
  await prisma.employee.create({
    data: {
      role,
      name: faker.name.firstName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      branchId,
      image: faker.image.avatar(),
      tables: { connect: tableIds.map(id => ({ id })) },
    },
  })
}

export function createChain(totalRest, moderatorIds) {
  console.log('🏢 Created the chain...')
  for (let i = 0; i < totalRest; i++) {
    return prisma.chain.create({
      data: {
        name: faker.company.name(),
        moderatorIds: moderatorIds, // Adding moderator IDs
      },
    })
  }
}

export function createBranch(chainId: string, totalBranches: number) {
  console.log('🏢 Created the branch...')
  for (let i = 0; i < totalBranches; i++) {
    return prisma.branch.create({
      data: {
        name: faker.company.name(),
        image:
          'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/i-need-a-high-quality-principal-image-for-the-hero-section-of-my-landing-page-this-image-will-r-.png?alt=media&token=298dadb1-9034-4b6e-ac10-34ec0f78d98a',
        email: faker.internet.email(),
        phone: faker.phone.number(),
        wifiName: faker.random.alphaNumeric(8),
        wifiPwd: faker.random.alphaNumeric(8),
        city: faker.address.city(),

        address: faker.address.streetAddress(),
        extraAddress: faker.address.street(),
        country: faker.address.country(),
        // rating: 4.8,
        // rating_quantity: 400,
        cuisine: 'Mexicana',
        // open: 7,
        // close: 24,
        chain: { connect: { id: chainId } },
      },
    })
  }
}

export async function createTables(branchId: string, numberOfTables: number) {
  const tableIds = []
  for (let i = 1; i <= numberOfTables; i++) {
    const table = await prisma.table.create({
      data: {
        number: i,
        order_in_progress: false,
        branch: { connect: { id: branchId } },
      },
    })
    tableIds.push(table.id)
  }
  console.log('🪑 Created the tables...')
  return tableIds
}

export function createMenu(branchId: string) {
  console.log('🍔 Created the menu...')
  return prisma.menu.create({
    data: {
      name: 'Breakfast',
      type: 'first',
      branchId: branchId,
      image:
        'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/i-need-a-high-quality-principal-image-for-the-hero-section-of-my-landing-page-this-image-will-r-.png?alt=media&token=298dadb1-9034-4b6e-ac10-34ec0f78d98a',
      currency: 'mxn',
    },
  })
}

export async function createCategories(menuId: string, branchId: string) {
  console.log("🍔 Created the menu's categories...")
  return Promise.all(
    [
      { name: 'Entradas', en: 'Appetizers' },
      { name: 'Sopas', en: 'Soups' },
      { name: 'Ensaladas', en: 'Salads' },
      { name: 'Platillos', en: 'Dishes' },
      { name: 'Tacos', en: 'Tacos' },
      { name: 'Quesos Fundidos', en: 'Melted Cheeses' },
      { name: 'Pastas' },
      { name: 'Grill' },
      { name: 'Guarniciones', en: 'Side Dishes' },
      { name: 'Pescados & Mariscos', en: 'Fish & Seafood' },
      { name: 'Extras' },
      { name: 'Postres', en: 'Desserts' },
    ].map(({ name, en }, index) =>
      prisma.menuCategory.create({
        data: {
          name,
          menu: { connect: { id: menuId } },
          pdf: index === 0, // This will be true for the first category and false for the rest
          // nameTranslations: {en},
          image: AVOQADO_LOGO,
          branch: { connect: { id: branchId } },
        },
      }),
    ),
  )
}

export async function createProductsAndModifiers(categories: any, branchId: string) {
  const modifierGroup = await prisma.modifierGroup.create({
    data: {
      max: 3,
      min: 1,
      multiply: 1,
      name: 'Salsas',
      plu: `PLU${getRandom(1000, 9999)}`,
    },
  })
  console.log("🍔 Created the menu's modifier group...")
  await Promise.all(
    [
      { name: 'Salsa Verde', extraPrice: 4, modifierGroupId: modifierGroup.id },
      { name: 'Salsa Roja', extraPrice: 7, modifierGroupId: modifierGroup.id },
      {
        name: 'Salsa Habanero',
        extraPrice: 20,
        modifierGroupId: modifierGroup.id,
      },
    ].map(({ name, extraPrice }) =>
      prisma.modifiers.create({
        data: {
          name,
          extraPrice,
          modifierGroupId: modifierGroup.id,
        },
      }),
    ),
  )
  console.log("🍔 Created the menu's modifiers...")
  console.log("🍔 Created the menu's products...")
  return Promise.all(
    categories.flatMap((category, i) =>
      range(1, 2).map(j =>
        prisma.menuItem.create({
          data: {
            name: `${category.name}${j}`,
            plu: `PLU-${category.name}-${j}`,
            image: `${faker.image.food()}?random=${Date.now()}${i}${j}`,
            description: faker.commerce.productDescription(),
            price: faker.commerce.price(100, 500),
            available: true,
            menuCategory: { connect: { id: category.id } },
            modifierGroups: { connect: { id: modifierGroup.id } },
            branch: { connect: { id: branchId } },
          },
        }),
      ),
    ),
  )
}

export async function createAvailabilities(menuId: string) {
  for (let i = 1; i <= 7; i++) {
    await prisma.availabilities.create({
      data: {
        dayOfWeek: i,
        startTime: '00:00',
        endTime: '23:59',
        menu: { connect: { id: menuId } },
      },
    })
  }
}

export function createDeliverect() {
  console.log('🚚 Created the deliverect...')
  return prisma.deliverect.create({
    data: { deliverectExpiration: null, deliverectToken: null },
  })
}

export async function cleanDatabase() {
  console.time('🧹 Cleaned up the database...')
  const tablesToClean = [
    'chain',
    'branch',
    'table',
    'employee',
    'menu',
    'menuCategory',
    'menuItem',
    'modifierGroup',
    'modifiers',
    'cartItem',
    'session',
    'password',
    'user',
    'order',
    'feedback',
    'employee',
    'deliverect',
    'availabilities',
    'role',
    'permission',
  ]
  for (const table of tablesToClean) {
    await prisma[table].deleteMany()
  }
  console.timeEnd('🧹 Cleaned up the database...')
}

function range(start: number, end: number, step = 1) {
  return Array.from({ length: (end - start + 1) / step }, (_, i) => start + i * step)
}

function getRandom(start: number, end: number) {
  return Math.floor(Math.random() * (end - start)) + start
}
