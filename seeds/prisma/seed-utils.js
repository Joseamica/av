"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDatabase = exports.createDeliverect = exports.createAvailabilities = exports.createEmployees = exports.createProductsAndModifiers = exports.createCategories = exports.createMenu = exports.createTables = exports.createBranch = exports.createChain = exports.createUsers = exports.createAdmin = void 0;
const faker_1 = require("@faker-js/faker");
const db_server_1 = require("../app/db.server");
// const {faker} = require('@faker-js/faker')
function createAdmin() {
    console.log('👤 Created the admin...');
    return db_server_1.prisma.admin.create({
        data: {
            id: 'cllb3d9b90003cedclcthud41',
            access: 3,
        },
    });
}
exports.createAdmin = createAdmin;
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
    console.timeEnd(`👤 Created ${totalUsers} users...`);
}
exports.createUsers = createUsers;
const AVOQADO_LOGO = 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKUIKKU%20(2)%20(1)%20copy.png?alt=media&token=158e8d1b-d24b-406b-85e7-a507b29d84fc';
function createChain(totalRest) {
    console.log('🏢 Created the chain...');
    for (let i = 0; i < totalRest; i++) {
        return db_server_1.prisma.chain.create({
            data: {
                name: faker_1.faker.company.name(),
                // logo: faker.image.food(),
                // email: faker.internet.email(),
                // phone: faker.phone.number(),
                // adminEmail: faker.internet.email(),
            },
        });
    }
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
                wifipwd: faker_1.faker.random.alphaNumeric(8),
                city: faker_1.faker.address.city(),
                address: faker_1.faker.address.streetAddress(),
                extraAddress: faker_1.faker.address.streetName(),
                rating: 4.8,
                rating_quantity: 400,
                cuisine: 'Mexicana',
                open: 7,
                close: 24,
                chain: { connect: { id: chainId } },
            },
        });
    }
}
exports.createBranch = createBranch;
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
    ].map(({ name, en }, index) => db_server_1.prisma.menuCategory.create({
        data: {
            name,
            menu: { connect: { id: menuId } },
            pdf: index === 0,
            // nameTranslations: {en},
            image: AVOQADO_LOGO,
            branch: { connect: { id: branchId } },
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
            plu: 'SALSA-01',
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
            name: `${category.name} Item #${j}`,
            plu: `PLU-${category.name}-${j}`,
            image: 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/1.%20Madre%20Cafecito%2FDSC_3020.jpg?alt=media&token=b263b604-1691-45e7-9f4f-d6598056e45d',
            description: faker_1.faker.commerce.productDescription(),
            price: faker_1.faker.commerce.price(100, 500),
            available: true,
            menuCategory: { connect: { id: category.id } },
            modifierGroups: { connect: { id: modifierGroup.id } },
            branch: { connect: { id: branchId } },
        },
    }))));
}
exports.createProductsAndModifiers = createProductsAndModifiers;
async function createEmployees(branchId, tableIds) {
    for (const i of tableIds) {
        await db_server_1.prisma.employee.create({
            data: {
                role: 'waiter',
                name: faker_1.faker.name.firstName(),
                email: faker_1.faker.internet.email(),
                phone: faker_1.faker.phone.number(),
                branchId: branchId,
                image: faker_1.faker.image.avatar(),
                tables: { connect: tableIds.map(id => ({ id })) },
            },
        });
    }
    await db_server_1.prisma.employee.create({
        data: {
            role: 'manager',
            name: faker_1.faker.name.firstName(),
            email: faker_1.faker.internet.email(),
            phone: faker_1.faker.phone.number(),
            branchId: branchId,
            image: faker_1.faker.image.avatar(),
            tables: { connect: tableIds.map(id => ({ id })) },
        },
    });
    console.log('🧑🏼‍🍳 Created the employees...');
}
exports.createEmployees = createEmployees;
async function createAvailabilities(menuId) {
    for (let i = 1; i <= 7; i++) {
        await db_server_1.prisma.availabilities.create({
            data: {
                dayOfWeek: i,
                startTime: '00:00',
                endTime: '23:59',
                menu: { connect: { id: menuId } },
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
