import { faker } from '@faker-js/faker'
import type { Role } from '@prisma/client'
import { prisma } from '~/db.server'

import { createPassword, getPasswordHash } from '~/utils'

// const {faker} = require('@faker-js/faker')

export function createAdmin() {
  console.log('👤 Created the admin...')
  return prisma.admin.create({
    data: {
      id: 'cllb3d9b90003cedclcthud41',
      access: 3,
    },
  })
}

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

export async function createUsers(totalUsers, adminId) {
  console.time(`👤 Created ${totalUsers} users...`)
  for (let i = 0; i < totalUsers; i++) {
    await prisma.user.create({
      data: {
        name: faker.name.firstName(),
        email: faker.internet.email(),
        color: faker.internet.color(),
        adminId: adminId,
      },
    })
  }
  const userData = { name: 'Joseamica', email: 'joseamica@gmail.com', color: '#1AA7EC' }
  const adminRole = await prisma.role.findFirst({ where: { name: 'admin' } })
  await prisma.user.create({
    data: {
      ...userData,
      roles: { connect: { id: adminRole.id } },
      adminId: adminId,
      password: {
        create: {
          hash: await getPasswordHash('joseamica'),
        },
      },
    },
  })
  console.timeEnd(`👤 Created ${totalUsers} users...`)
}

const AVOQADO_LOGO =
  'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKUIKKU%20(2)%20(1)%20copy.png?alt=media&token=158e8d1b-d24b-406b-85e7-a507b29d84fc'

export function createChain(totalRest, adminId) {
  console.log('🏢 Created the chain...')
  for (let i = 0; i < totalRest; i++) {
    return prisma.chain.create({
      data: {
        name: faker.company.name(),
        adminId: adminId,
        // logo: faker.image.food(),
        // email: faker.internet.email(),
        // phone: faker.phone.number(),
        // adminEmail: faker.internet.email(),
      },
    })
  }
}

export function createBranch(chainId: string, totalBranches: number, adminId: string) {
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
        admin: {
          connect: { id: adminId },
        },
        address: faker.address.streetAddress(),
        extraAddress: faker.address.streetName(),
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
      plu: 'SALSA-01',
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
            name: `${category.name} Item #${j}`,
            plu: `PLU-${category.name}-${j}`,
            image:
              'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/1.%20Madre%20Cafecito%2FDSC_3020.jpg?alt=media&token=b263b604-1691-45e7-9f4f-d6598056e45d',
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

export async function createEmployees(branchId: string, tableIds: [string]) {
  for (const i of tableIds) {
    await prisma.employee.create({
      data: {
        role: 'waiter',
        name: faker.name.firstName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        branchId: branchId,
        image: faker.image.avatar(),
        tables: { connect: tableIds.map(id => ({ id })) },
      },
    })
  }
  await prisma.employee.create({
    data: {
      role: 'manager',
      name: faker.name.firstName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      branchId: branchId,
      image: faker.image.avatar(),
      tables: { connect: tableIds.map(id => ({ id })) },
    },
  })
  console.log('🧑🏼‍🍳 Created the employees...')
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
    'admin',
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
