"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDatabase = exports.createDeliverect = exports.createAvailabilities = exports.createProductsAndModifiers = exports.createCategories = exports.createMenu = exports.createTables = exports.createEmployees = exports.createChainAndBranches = exports.createBranch = exports.createChain = exports.createUsers = exports.createModeratorRole = exports.createAdminRole = void 0;
const faker_1 = require("@faker-js/faker");
const db_server_1 = require("../app/db.server");
const utils_1 = require("../app/utils");
// const {faker} = require('@faker-js/faker')
const AVOQADO_LOGO = 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKUIKKU%20(2)%20(1)%20copy.png?alt=media&token=158e8d1b-d24b-406b-85e7-a507b29d84fc';
function createAdminRole() {
    return db_server_1.prisma.role.create({
        data: {
            name: 'admin',
            permissions: {
                create: { name: 'admin' },
            },
        },
    });
}
exports.createAdminRole = createAdminRole;
function createModeratorRole() {
    return db_server_1.prisma.role.create({
        data: {
            name: 'moderator',
            permissions: {
                create: { name: 'moderator' },
            },
        },
    });
}
exports.createModeratorRole = createModeratorRole;
async function createUsers(totalUsers) {
    console.time(`👤 Created ${totalUsers} users...`);
    for (let i = 0; i < totalUsers; i++) {
        await db_server_1.prisma.user.create({
            data: {
                name: faker_1.faker.name.firstName(),
                email: faker_1.faker.internet.email(),
                color: faker_1.faker.internet.color(),
            },
        });
    }
    const adminData = { name: 'Admin', email: 'admin@gmail.com', color: '#1AA7EC' };
    const adminRole = await db_server_1.prisma.role.findFirst({ where: { name: 'admin' } });
    await db_server_1.prisma.user.create({
        data: {
            ...adminData,
            roles: { connect: { id: adminRole.id } },
            password: {
                create: {
                    hash: await (0, utils_1.getPasswordHash)('administrator'),
                },
            },
        },
    });
    console.timeEnd(`👤 Created ${totalUsers} users...`);
}
exports.createUsers = createUsers;
async function createChain(totalChains, moderatorIds) {
    console.log('🏢 Created the chain...');
    console.log(moderatorIds);
    return await db_server_1.prisma.chain.create({
        data: {
            name: faker_1.faker.company.name(),
            moderatorIds: [moderatorIds.pop()],
        },
    });
}
exports.createChain = createChain;
function createBranch(chainId, totalBranches) {
    console.log('🏢 Created the branch...');
    for (let i = 0; i < totalBranches; i++) {
        return db_server_1.prisma.branch.create({
            data: {
                name: faker_1.faker.company.name(),
                image: 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/i-need-a-high-quality-principal-image-for-the-hero-section-of-my-landing-page-this-image-will-r-.png?alt=media&token=298dadb1-9034-4b6e-ac10-34ec0f78d98a',
                email: faker_1.faker.internet.email(),
                phone: faker_1.faker.phone.number(),
                wifiName: faker_1.faker.random.alphaNumeric(8),
                wifiPwd: faker_1.faker.random.alphaNumeric(8),
                city: faker_1.faker.address.city(),
                address: faker_1.faker.address.streetAddress(),
                extraAddress: faker_1.faker.address.street(),
                country: faker_1.faker.address.country(),
                // rating: 4.8,
                // rating_quantity: 400,
                cuisine: 'Mexicana',
                // open: 7,
                // close: 24,
                chain: { connect: { id: chainId } },
            },
        });
    }
}
exports.createBranch = createBranch;
async function createChainAndBranches() {
    const chainIds = [];
    const moderatorRole = await db_server_1.prisma.role.findFirst({ where: { name: 'moderator' } });
    const mod1 = await db_server_1.prisma.user.create({
        data: {
            name: `moderator1`,
            email: `mod1@gmail.com`,
            color: '#1AA74C',
            roles: { connect: { id: moderatorRole.id } },
            password: {
                create: {
                    hash: await (0, utils_1.getPasswordHash)('moderator'),
                },
            },
        },
    });
    const mod2 = await db_server_1.prisma.user.create({
        data: {
            name: `moderator2`,
            email: `mod2@mod.com`,
            color: '#1A474C',
            roles: { connect: { id: moderatorRole.id } },
            password: {
                create: {
                    hash: await (0, utils_1.getPasswordHash)('moderator'),
                },
            },
        },
    });
    const moderatorIds = [mod1.id, mod2.id];
    // Create 2 chains
    for (let i = 0; i < 2; i++) {
        const chain = await createChain(1, moderatorIds); // Passing moderator IDs
        chainIds.push(chain.id);
        // Create 2 branches for each chain
        for (let j = 0; j < 2; j++) {
            const branch = await createBranch(chain.id, 1); // Your existing createBranch function
            // Create 4 tables for each branch
            const tableIds = await createTables(branch.id, 4); // Your existing createTables function
            // Create 3 employees for each branch (1 manager and 2 waiters)
            await createEmployees(branch.id, tableIds, 1, 2); // Modified createEmployees function
            // Create menu, availabilities, categories, products, and modifiers for each branch
            const menu = await createMenu(branch.id); // Your existing createMenu function
            await createAvailabilities(branch.id, menu.id); // Your existing createAvailabilities function
            const categories = await createCategories(menu.id, branch.id); // Your existing createCategories function
            await createProductsAndModifiers(categories, branch.id); // Your existing createProductsAndModifiers function
        }
    }
}
exports.createChainAndBranches = createChainAndBranches;
// Modify createEmployees function to take the number of managers and waiters as arguments
async function createEmployees(branchId, tableIds, numManagers, numWaiters) {
    for (let i = 0; i < numManagers; i++) {
        await createEmployee('manager', branchId, tableIds);
    }
    for (let i = 0; i < numWaiters; i++) {
        await createEmployee('waiter', branchId, tableIds);
    }
    console.log('🧑🏼‍🍳 Created the employees...');
}
exports.createEmployees = createEmployees;
async function createEmployee(role, branchId, tableIds) {
    await db_server_1.prisma.employee.create({
        data: {
            role,
            name: faker_1.faker.name.firstName(),
            email: faker_1.faker.internet.email(),
            phone: faker_1.faker.phone.number(),
            branchId,
            image: faker_1.faker.image.avatar(),
            tables: { connect: tableIds.map(id => ({ id })) },
        },
    });
}
async function createTables(branchId, numberOfTables) {
    const tableIds = [];
    for (let i = 1; i <= numberOfTables; i++) {
        const table = await db_server_1.prisma.table.create({
            data: {
                number: i,
                order_in_progress: false,
                branch: { connect: { id: branchId } },
            },
        });
        tableIds.push(table.id);
    }
    console.log('🪑 Created the tables...');
    return tableIds;
}
exports.createTables = createTables;
function createMenu(branchId) {
    console.log('🍔 Created the menu...');
    return db_server_1.prisma.menu.create({
        data: {
            name: 'Breakfast',
            type: 'first',
            branchId: branchId,
            image: 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/i-need-a-high-quality-principal-image-for-the-hero-section-of-my-landing-page-this-image-will-r-.png?alt=media&token=298dadb1-9034-4b6e-ac10-34ec0f78d98a',
            currency: 'mxn',
        },
    });
}
exports.createMenu = createMenu;
async function createCategories(menuId, branchId) {
    console.log("🍔 Created the menu's categories...");
    return Promise.all([
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
    ].map(({ name, en }, index) => db_server_1.prisma.category.create({
        data: {
            name,
            menu: { connect: { id: menuId } },
            pdf: index === 0,
            // nameTranslations: {en},
            image: AVOQADO_LOGO,
        },
    })));
}
exports.createCategories = createCategories;
async function createProductsAndModifiers(categories, branchId) {
    const modifierGroup = await db_server_1.prisma.modifierGroup.create({
        data: {
            max: 3,
            min: 1,
            multiply: 1,
            name: 'Salsas',
            plu: `PLU${getRandom(1000, 9999)}`,
        },
    });
    console.log("🍔 Created the menu's modifier group...");
    await Promise.all([
        { name: 'Salsa Verde', extraPrice: 4, modifierGroupId: modifierGroup.id },
        { name: 'Salsa Roja', extraPrice: 7, modifierGroupId: modifierGroup.id },
        {
            name: 'Salsa Habanero',
            extraPrice: 20,
            modifierGroupId: modifierGroup.id,
        },
    ].map(({ name, extraPrice }) => db_server_1.prisma.modifiers.create({
        data: {
            name,
            extraPrice,
            modifierGroupId: modifierGroup.id,
        },
    })));
    console.log("🍔 Created the menu's modifiers...");
    console.log("🍔 Created the menu's products...");
    return Promise.all(categories.flatMap((category, i) => range(1, 2).map(j => db_server_1.prisma.menuItem.create({
        data: {
            name: `${category.name}${j}`,
            plu: `PLU-${category.name}-${j}`,
            image: `${faker_1.faker.image.food()}?random=${Date.now()}${i}${j}`,
            description: faker_1.faker.commerce.productDescription(),
            price: faker_1.faker.commerce.price(100, 500),
            available: true,
            category: { connect: { id: category.id } },
            modifierGroups: { connect: { id: modifierGroup.id } },
        },
    }))));
}
exports.createProductsAndModifiers = createProductsAndModifiers;
async function createAvailabilities(branchId, menuId) {
    for (let i = 1; i <= 7; i++) {
        await db_server_1.prisma.availabilities.create({
            data: {
                dayOfWeek: i,
                startTime: '00:00',
                endTime: '23:59',
                menu: { connect: { id: menuId } },
                branch: { connect: { id: branchId } },
            },
        });
    }
}
exports.createAvailabilities = createAvailabilities;
function createDeliverect() {
    console.log('🚚 Created the deliverect...');
    return db_server_1.prisma.deliverect.create({
        data: { deliverectExpiration: null, deliverectToken: null },
    });
}
exports.createDeliverect = createDeliverect;
async function cleanDatabase() {
    console.time('🧹 Cleaned up the database...');
    const tablesToClean = [
        'chain',
        'branch',
        'table',
        'employee',
        'menu',
        'user',
        'category',
        'menuItem',
        'modifierGroup',
        'modifiers',
        'cartItem',
        'session',
        'password',
        'order',
        'feedback',
        'employee',
        'deliverect',
        'availabilities',
        'role',
        'permission',
    ];
    for (const table of tablesToClean) {
        await db_server_1.prisma[table].deleteMany();
    }
    console.timeEnd('🧹 Cleaned up the database...');
}
exports.cleanDatabase = cleanDatabase;
function range(start, end, step = 1) {
    return Array.from({ length: (end - start + 1) / step }, (_, i) => start + i * step);
}
function getRandom(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
}
