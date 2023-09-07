import {
  cleanDatabase,
  createAdminRole,
  createAvailabilities,
  createBranch,
  createCategories, // createModifiers,
  createChain,
  createChainAndBranches,
  createDeliverect,
  createEmployees,
  createMenu,
  createModeratorRole,
  createProductsAndModifiers,
  createTables,
  createUsers,
} from './seed-utils'

async function seed() {
  console.log('🌱 Seeding...')
  console.time(`🌱 Database has been seeded`)

  await cleanDatabase()
  await createAdminRole()
  await createModeratorRole()
  await createDeliverect()
  await createUsers(1)

  await createChainAndBranches() // New function to wrap all the creations

  console.timeEnd(`🌱 Database has been seeded`)
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
