"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentMethods = exports.getTipsPercentages = exports.getBranchId = exports.getBranch = void 0;
const db_server_1 = require("../db.server");
function getBranch(tableId) {
    return db_server_1.prisma.branch.findFirst({
        where: {
            tables: {
                some: {
                    id: tableId,
                },
            },
        },
    });
}
exports.getBranch = getBranch;
async function getBranchId(tableId) {
    const branch = await getBranch(tableId);
    return branch === null || branch === void 0 ? void 0 : branch.id;
}
exports.getBranchId = getBranchId;
async function getTipsPercentages(tableId) {
    var _a;
    const branchId = await getBranchId(tableId);
    return ((_a = db_server_1.prisma.branch
        .findFirst({
        where: { id: branchId },
        select: { tipsPercentages: true },
    })
        .then(branch => branch === null || branch === void 0 ? void 0 : branch.tipsPercentages)) !== null && _a !== void 0 ? _a : { tipsPercentages: ['10', '12', '15'] }.tipsPercentages);
}
exports.getTipsPercentages = getTipsPercentages;
async function getPaymentMethods(tableId) {
    const branchId = await getBranchId(tableId);
    const result = await db_server_1.prisma.branch.findFirst({
        where: { id: branchId },
        select: {
            // firstPaymentMethod: true,
            // secondPaymentMethod: true,
            // thirdPaymentMethod: true,
            // fourthPaymentMethod: true,
            paymentMethods: true,
        },
    });
    // Remove null fields
    if (result) {
        const nonNullResults = {};
        for (const [key, value] of Object.entries(result)) {
            if (value !== null) {
                nonNullResults[key] = value;
            }
        }
        return nonNullResults;
    }
    else {
        return null;
    }
}
exports.getPaymentMethods = getPaymentMethods;
