import {
  cleanDatabase,
  createAvailabilities,
  createBranch,
  createCategories,
  createDeliverect,
  createEmployees,
  createMenu,
  createProductsAndModifiers,
  // createModifiers,
  createRestaurant,
  createTables,
  createUsers,
} from './seed-utils'
import {prisma} from '~/db.server'

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  await cleanDatabase()
  await createDeliverect()
  await createUsers(1)
  const restaurant = await createRestaurant()
  const branch = await createBranch(restaurant.id)
  const tableIds = (await createTables(branch.id, 7)) as any
  await createEmployees(branch.id, tableIds)
  const menu = await createMenu(branch.id)
  await createAvailabilities(menu.id)
  const categories = await createCategories(menu.id)
  await createProductsAndModifiers(categories)

  // await createModifiers(menu.id)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    console.timeEnd(`🌱 Database has been seeded`)
  })
