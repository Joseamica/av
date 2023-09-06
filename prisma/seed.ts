import {
  cleanDatabase,
  createAdmin,
  createAvailabilities,
  createBranch,
  createCategories, // createModifiers,
  createChain,
  createDeliverect,
  createEmployees,
  createMenu,
  createProductsAndModifiers,
  createTables,
  createUsers,
} from './seed-utils'

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  await cleanDatabase()
  await createAdmin()
  await createDeliverect()
  await createUsers(1)
  const chain = await createChain(2)
  const branch = await createBranch(chain.id, 2)
  const tableIds = (await createTables(branch.id, 7)) as any
  await createEmployees(branch.id, tableIds)
  const menu = await createMenu(branch.id)
  await createAvailabilities(menu.id)
  const categories = await createCategories(menu.id, branch.id)
  await createProductsAndModifiers(categories, branch.id)

  // await createModifiers(menu.id)
}

seed()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    // await prisma.$disconnect()
    console.timeEnd(`🌱 Database has been seeded`)
  })
