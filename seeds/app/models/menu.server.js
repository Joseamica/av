"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMenu = exports.getHour = void 0;
const db_server_1 = require("../db.server");
function getHour() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Returns a string in the "HH:MM" format
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}
exports.getHour = getHour;
function getDayOfWeek() {
    const date = new Date();
    let day = date.getDay();
    if (day === 0) {
        // if it's Sunday
        day = 7; // make it 7
    }
    return day;
}
function getMenu(branchId) {
    const timeNow = getHour();
    const dayOfWeekNow = getDayOfWeek();
    return db_server_1.prisma.menu.findFirst({
        where: {
            branchId,
            availabilities: {
                some: {
                    dayOfWeek: dayOfWeekNow,
                    OR: [
                        {
                            AND: [
                                {
                                    startTime: {
                                        lte: String(timeNow),
                                    },
                                },
                                {
                                    endTime: {
                                        gte: String(timeNow),
                                    },
                                },
                            ],
                        },
                        {
                            AND: [
                                {
                                    startTime: {
                                        lte: String(timeNow),
                                    },
                                },
                                {
                                    endTime: {
                                        gte: String(timeNow),
                                    },
                                },
                            ],
                        },
                    ],
                },
            },
        },
        include: {
            availabilities: true,
        },
    });
}
exports.getMenu = getMenu;
