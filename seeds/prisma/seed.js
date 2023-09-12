"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const seed_utils_1 = require("./seed-utils");
async function seed() {
    console.log('🌱 Seeding...');
    console.time(`🌱 Database has been seeded`);
    await (0, seed_utils_1.cleanDatabase)();
    await (0, seed_utils_1.createAdminRole)();
    await (0, seed_utils_1.createModeratorRole)();
    await (0, seed_utils_1.createDeliverect)();
    await (0, seed_utils_1.createUsers)(1);
    await (0, seed_utils_1.createChainAndBranches)(); // New function to wrap all the creations
    console.timeEnd(`🌱 Database has been seeded`);
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
