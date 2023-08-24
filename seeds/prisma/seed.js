"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seed_utils_1 = require("./seed-utils");
async function seed() {
    console.log('🌱 Seeding...');
    console.time(`🌱 Database has been seeded`);
    await (0, seed_utils_1.cleanDatabase)();
    await (0, seed_utils_1.createAdmin)();
    await (0, seed_utils_1.createDeliverect)();
    await (0, seed_utils_1.createUsers)(1);
    const restaurant = await (0, seed_utils_1.createRestaurant)();
    const branch = await (0, seed_utils_1.createBranch)(restaurant.id);
    const tableIds = (await (0, seed_utils_1.createTables)(branch.id, 7));
    await (0, seed_utils_1.createEmployees)(branch.id, tableIds);
    const menu = await (0, seed_utils_1.createMenu)(branch.id);
    await (0, seed_utils_1.createAvailabilities)(menu.id);
    const categories = await (0, seed_utils_1.createCategories)(menu.id, branch.id);
    await (0, seed_utils_1.createProductsAndModifiers)(categories, branch.id);
    // await createModifiers(menu.id)
}
seed()
    .catch(e => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    // await prisma.$disconnect()
    console.timeEnd(`🌱 Database has been seeded`);
});
