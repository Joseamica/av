"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanUserData = exports.assignUserNewPayments = exports.getUsersOnTable = exports.getPaidUsers = exports.findOrCreateUser = exports.verifyLogin = exports.deleteUserByEmail = exports.createUser = exports.getUserByEmail = exports.getUserById = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_server_1 = require("../db.server");
async function getUserById(id) {
    return db_server_1.prisma.user.findUnique({ where: { id } });
}
exports.getUserById = getUserById;
async function getUserByEmail(email) {
    return db_server_1.prisma.user.findUnique({ where: { email } });
}
exports.getUserByEmail = getUserByEmail;
async function createUser(username, email, password, color) {
    const hashedPassword = await bcryptjs_1.default.hash(password, 10);
    return db_server_1.prisma.user.create({
        data: {
            email,
            name: username,
            color,
            // role: 'user',
            password: {
                create: {
                    hash: hashedPassword,
                },
            },
        },
    });
}
exports.createUser = createUser;
async function deleteUserByEmail(email) {
    return db_server_1.prisma.user.delete({ where: { email } });
}
exports.deleteUserByEmail = deleteUserByEmail;
async function verifyLogin(email, password) {
    const userWithPassword = await db_server_1.prisma.user.findUnique({
        where: { email },
        include: {
            password: true,
        },
    });
    if (!userWithPassword || !userWithPassword.password) {
        return null;
    }
    const isValid = await bcryptjs_1.default.compare(password, userWithPassword.password.hash);
    if (!isValid) {
        return null;
    }
    const { password: _password, ...userWithoutPassword } = userWithPassword;
    return userWithoutPassword;
}
exports.verifyLogin = verifyLogin;
async function findOrCreateUser(userId, username, user_color) {
    const user = await db_server_1.prisma.user.findFirst({
        where: {
            id: userId,
        },
    });
    if (!user && username) {
        console.log('✅ Creating from findOrCreateUser func -> user with name:', username);
        return db_server_1.prisma.user.create({
            data: {
                id: userId,
                name: username,
                color: user_color,
            },
        });
    }
    return user;
}
exports.findOrCreateUser = findOrCreateUser;
async function getPaidUsers(orderId) {
    const users = await db_server_1.prisma.user.findMany({
        where: {
            orderId,
            // tip: {
            //   not: null,
            //   gt: -1,
            // },
            paid: {
                not: null,
                //BEFORE gt: -1
                gt: 0,
            },
        },
        select: {
            id: true,
            name: true,
            color: true,
            paid: true,
            tip: true,
            total: true,
            payments: { where: { orderId } },
        },
    });
    return users.length > 0 ? users : null;
}
exports.getPaidUsers = getPaidUsers;
async function getUsersOnTable(tableId) {
    const users = await db_server_1.prisma.user.findMany({
        where: {
            tableId: tableId,
            roles: {
                none: {
                    OR: [
                        {
                            name: 'admin',
                        },
                        {
                            name: 'moderator',
                        },
                    ],
                },
            },
        },
    });
    return users.length > 0 ? users : null;
}
exports.getUsersOnTable = getUsersOnTable;
async function assignUserNewPayments(userId, amount, tip) {
    const userPrevPaidData = await db_server_1.prisma.user.findUnique({
        where: { id: userId },
        select: {
            total: true,
            tip: true,
            paid: true,
        },
    });
    return db_server_1.prisma.user.update({
        where: { id: userId },
        data: {
            paid: Number(userPrevPaidData === null || userPrevPaidData === void 0 ? void 0 : userPrevPaidData.paid) + amount,
            tip: Number(userPrevPaidData === null || userPrevPaidData === void 0 ? void 0 : userPrevPaidData.tip) + tip,
            total: Number(userPrevPaidData === null || userPrevPaidData === void 0 ? void 0 : userPrevPaidData.total) + amount + tip,
        },
    });
}
exports.assignUserNewPayments = assignUserNewPayments;
function cleanUserData(userId) {
    return db_server_1.prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            tip: 0,
            paid: 0,
            total: 0,
            orders: { disconnect: true },
            cartItems: { set: [] },
            // tableId: null,
            // tables: {disconnect: true},
        },
    });
}
exports.cleanUserData = cleanUserData;
