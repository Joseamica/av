"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignExpirationAndValuesToOrder = exports.getOrderTotal = exports.findOrCreateOrder = exports.getOrder = void 0;
const db_server_1 = require("../db.server");
function getOrder(tableId, includes) {
    return db_server_1.prisma.order.findFirst({
        where: { tableId, active: true },
        include: includes,
    });
}
exports.getOrder = getOrder;
async function findOrCreateOrder(branchId, tableId, userId) {
    const order = await db_server_1.prisma.order.findFirst({
        where: {
            tableId,
        },
        include: {
            users: true,
        },
    });
    if (!order && tableId) {
        return await db_server_1.prisma.order.create({
            data: {
                paid: false,
                active: true,
                creationDate: new Date(),
                orderedDate: new Date(),
                branch: {
                    connect: {
                        id: branchId,
                    },
                },
                table: {
                    connect: {
                        id: tableId,
                    },
                },
                users: {
                    connect: {
                        id: userId,
                    },
                },
            },
        });
    }
    return order;
}
exports.findOrCreateOrder = findOrCreateOrder;
function getOrderTotal(orderId) {
    return db_server_1.prisma.order.findUnique({
        where: { id: orderId },
        select: { total: true },
    });
}
exports.getOrderTotal = getOrderTotal;
async function assignExpirationAndValuesToOrder(amountLeft, tip, total, order) {
    if (!order) {
        return null;
    }
    // console.time('⏲️Expiration begins and order is updated')
    if (amountLeft <= total) {
        await db_server_1.prisma.order.update({
            where: { id: order.id },
            data: {
                paid: true,
                paidDate: new Date(),
                tip: Number(order === null || order === void 0 ? void 0 : order.tip) + tip,
            },
        });
        return console.log('⏲️Expiration begins and order is updated');
    }
}
exports.assignExpirationAndValuesToOrder = assignExpirationAndValuesToOrder;
