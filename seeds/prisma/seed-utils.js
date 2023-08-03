"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDatabase = exports.createDeliverect = exports.createAvailabilities = exports.createEmployees = exports.createProductsAndModifiers = exports.createCategories = exports.createMenu = exports.createTables = exports.createBranch = exports.createRestaurant = exports.createUsers = void 0;
const faker_1 = require("@faker-js/faker");
const db_server_1 = require("../app/db.server");
// const {faker} = require('@faker-js/faker')
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
function createRestaurant() {
    console.log('🏢 Created the restaurant...');
    return db_server_1.prisma.restaurant.create({
        data: {
            name: faker_1.faker.company.name(),
            logo: faker_1.faker.image.food(),
            email: 'info@madrecafe.com',
            phone: faker_1.faker.phone.number(),
            adminEmail: 'joseamica@gmail.com',
        },
    });
}
exports.createRestaurant = createRestaurant;
function createBranch(restaurantId) {
    console.log('🏢 Created the branch...');
    return db_server_1.prisma.branch.create({
        data: {
            name: faker_1.faker.company.name(),
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            ppt_image: 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKUIKKU%20(2)%20(1)%20copy.png?alt=media&token=158e8d1b-d24b-406b-85e7-a507b29d84fc',
            email: faker_1.faker.internet.email(),
            phone: '8885551212',
            wifiName: faker_1.faker.random.alphaNumeric(8),
            wifipwd: faker_1.faker.random.alphaNumeric(8),
            city: 'Cuernavaca',
            address: 'Mexico-Acapulco KM. 87.5, Villas del Lago, 62370 Cuernavaca, Mor.',
            extraAddress: 'Averanda',
            rating: 4.8,
            rating_quantity: 400,
            cuisine: 'Mexicana',
            open: 7,
            close: 24,
            restaurant: { connect: { id: restaurantId } },
        },
    });
}
exports.createBranch = createBranch;
async function createTables(branchId, numberOfTables) {
    const tableIds = [];
    for (let i = 1; i <= numberOfTables; i++) {
        const table = await db_server_1.prisma.table.create({
            data: {
                table_number: i,
                order_in_progress: false,
                branch: { connect: { id: branchId } },
                // employees: {
                //   create: {
                //     name: 'Victor',
                //     rol: 'waiter',
                //     email: 'bnlabla@gmaillcom',
                //     image:
                //       'https://images.unsplash.com/photo-1544723795-3fb6469f5b39?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=778&q=80',
                //   },
                // },
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
            name: 'DESAYUNO',
            type: 'breakfast',
            branchId: branchId,
            image: 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2FKuikku%20General.JPG?alt=media&token=e585a90e-59dd-499d-97b6-b059a031ff8b',
            // allday: true,
            currency: 'eur',
        },
    });
}
exports.createMenu = createMenu;
async function createCategories(menuId) {
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
            imageUrl: AVOQADO_LOGO,
        },
    })));
}
exports.createCategories = createCategories;
async function createProductsAndModifiers(categories) {
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
            image: 'https://firebasestorage.googleapis.com/v0/b/avoqado-d0a24.appspot.com/o/kuikku%2F3.%20TEMAKI%20(HANDROLL)%2FTEMAKI%20NEGITORO.jpg?alt=media&token=08782db0-22ef-49f6-8ac0-4c9c92e59645',
            description: faker_1.faker.commerce.productDescription(),
            price: faker_1.faker.commerce.price(100, 500),
            available: true,
            menuCategory: { connect: { id: category.id } },
            modifierGroups: { connect: { id: modifierGroup.id } },
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
    for (let i = 0; i <= 7; i++) {
        await db_server_1.prisma.availabilities.create({
            data: {
                dayOfWeek: i,
                startTime: '05:00',
                endTime: '23:00',
                menuId: menuId,
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
        'restaurant',
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
