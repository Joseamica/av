"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPasswordHash = exports.createPassword = exports.isValidE164Number = exports.capitalizeFirstLetter = exports.dayOfWeek = exports.getSearchParams = exports.getUrl = exports.getIsDvctTokenExpired = exports.createQueryString = exports.Translate = exports.getMenuIdFromUrl = exports.getTableIdFromUrl = exports.isOrderExpired = exports.getDateTimeTz = exports.getRandomColor = exports.getAmountLeftToPay = exports.getDateTime = exports.getHour = exports.getCurrency = exports.formatCurrency = exports.getTotal = exports.validateEmail = exports.getFundamentals = exports.useUser = exports.useOptionalUser = exports.useMatchesData = exports.safeRedirect = void 0;
const react_1 = require("@remix-run/react");
const react_2 = require("react");
const faker_1 = require("@faker-js/faker");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const date_fns_tz_1 = require("date-fns-tz");
const tiny_invariant_1 = __importDefault(require("tiny-invariant"));
const db_server_1 = require("./db.server");
const branch_server_1 = require("./models/branch.server");
const menu_server_1 = require("./models/menu.server");
const order_server_1 = require("./models/order.server");
const DEFAULT_REDIRECT = '/';
/**
 * This should be used any time the redirect path is user-provided
 * (Like the query string on our login/signup pages). This avoids
 * open-redirect vulnerabilities.
 * @param {string} to The redirect destination
 * @param {string} defaultRedirect The redirect to use if the to is unsafe.
 */
function safeRedirect(to, defaultRedirect = DEFAULT_REDIRECT) {
    console.log('to', to);
    if (!to || typeof to !== 'string') {
        return defaultRedirect;
    }
    if (!to.startsWith('/') || to.startsWith('//')) {
        return defaultRedirect;
    }
    return to;
}
exports.safeRedirect = safeRedirect;
/**
 * This base hook is used in other hooks to quickly search for specific data
 * across all loader data using useMatches.
 * @param {string} id The route id
 * @returns {JSON|undefined} The router data or undefined if not found
 */
function useMatchesData(id) {
    const matchingRoutes = (0, react_1.useMatches)();
    const route = (0, react_2.useMemo)(() => matchingRoutes.find(route => route.id === id), [matchingRoutes, id]);
    return route === null || route === void 0 ? void 0 : route.data;
}
exports.useMatchesData = useMatchesData;
function isUser(user) {
    return user && typeof user === 'object' && typeof user.email === 'string';
}
function useOptionalUser() {
    const data = useMatchesData('root');
    if (!data || !isUser(data.user)) {
        return undefined;
    }
    return data.user;
}
exports.useOptionalUser = useOptionalUser;
function useUser() {
    const maybeUser = useOptionalUser();
    if (!maybeUser) {
        throw new Error('No user found in root loader, but user is required by useUser. If user is optional, try useOptionalUser instead.');
    }
    return maybeUser;
}
exports.useUser = useUser;
async function getFundamentals() {
    return null;
}
exports.getFundamentals = getFundamentals;
function validateEmail(email) {
    return typeof email === 'string' && email.length > 3 && email.includes('@');
}
exports.validateEmail = validateEmail;
function getTotal(order) {
    return null;
}
exports.getTotal = getTotal;
function formatCurrency(currency, amount) {
    switch (currency) {
        case '$':
            return `$${Number(amount).toFixed(1)}`;
        case '€':
            return `${Number(amount).toFixed(1)} €`;
        default:
            return `${Number(amount).toFixed(1)}`;
    }
}
exports.formatCurrency = formatCurrency;
async function getCurrency(tableId) {
    let branchId = null;
    if (!branchId) {
        branchId = await (0, branch_server_1.getBranchId)(tableId);
    }
    (0, tiny_invariant_1.default)(branchId, 'branchId should be defined');
    const currency = await (0, menu_server_1.getMenu)(branchId).then((menu) => (menu === null || menu === void 0 ? void 0 : menu.currency) || 'mxn');
    switch (currency) {
        case 'mxn':
            return '$';
        case 'usd':
            return '$';
        case 'eur':
            return '€';
        default:
            return '$';
    }
}
exports.getCurrency = getCurrency;
function getHour() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const timeNow = Number(`${hours}.${String(minutes).padStart(2, '0')}`);
    return timeNow;
}
exports.getHour = getHour;
function getDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0'); // JS months start at 0
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const timeNow = `${day}/${month}:${hours}.${minutes}`;
    return timeNow;
}
exports.getDateTime = getDateTime;
async function getAmountLeftToPay(tableId) {
    const order = await (0, order_server_1.getOrder)(tableId);
    if (!order)
        return null;
    const payments = await db_server_1.prisma.payments.aggregate({
        where: { orderId: order.id },
        _sum: { amount: true },
    });
    const totalPayments = Number(payments._sum.amount);
    const getTotalBill = await db_server_1.prisma.order.aggregate({
        _sum: { total: true },
        where: { id: order.id },
    });
    const totalBill = Number(getTotalBill._sum.total);
    return Number(totalBill - totalPayments);
}
exports.getAmountLeftToPay = getAmountLeftToPay;
function getRandomColor() {
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = Math.floor(Math.random() * 100) + 100; // adjust range as needed
        color += value.toString(16);
    }
    return color;
}
exports.getRandomColor = getRandomColor;
async function getDateTimeTz(tableId) {
    const branchId = await (0, branch_server_1.getBranchId)(tableId);
    const timeZone = await db_server_1.prisma.branch
        .findUnique({
        where: { id: branchId },
        select: { timezone: true },
    })
        .then(branch => branch === null || branch === void 0 ? void 0 : branch.timezone);
    if (!timeZone) {
        return null;
    }
    const date = new Date();
    const zonedDate = (0, date_fns_tz_1.utcToZonedTime)(date, timeZone);
    // zonedDate could be used to initialize a date picker or display the formatted local date/time
    // Set the output to "1.9.2018 18:01:36.386 GMT+02:00 (CEST)"
    const pattern = "d.M.yyyy HH:mm:ss.SSS 'GMT' XXX (z)";
    const output = (0, date_fns_tz_1.format)(zonedDate, pattern, {
        timeZone: 'America/Mexico_City',
    });
    const d = new Date(output);
    console.log('d', d);
    return output;
}
exports.getDateTimeTz = getDateTimeTz;
function isOrderExpired(orderPaidDate, hoursToExpire = 2) {
    if (!orderPaidDate) {
        return null;
    }
    const MILLISECONDS_IN_AN_HOUR = 3600000;
    const currentDate = new Date();
    const expiryDate = new Date(orderPaidDate.getTime() + hoursToExpire * MILLISECONDS_IN_AN_HOUR);
    return currentDate.getTime() >= expiryDate.getTime();
}
exports.isOrderExpired = isOrderExpired;
function getTableIdFromUrl(pathname) {
    let segments = pathname.split('/');
    let tableIndex = segments.indexOf('table');
    let tableId = segments[tableIndex + 1];
    return tableId;
}
exports.getTableIdFromUrl = getTableIdFromUrl;
function getMenuIdFromUrl(pathname) {
    let segments = pathname.split('/');
    let menuIndex = segments.indexOf('menu');
    let menuId = segments[menuIndex + 1];
    return menuId;
}
exports.getMenuIdFromUrl = getMenuIdFromUrl;
const TRANSLATIONS = {
    en: {
        card: 'Card',
        cash: 'Cash',
        paypal: 'Paypal',
    },
    es: {
        card: 'Tarjeta',
        cash: 'Efectivo',
        paypal: 'Paypal',
    },
};
function Translate(wishLanguage, textToTranslate) {
    return TRANSLATIONS[wishLanguage][textToTranslate] || textToTranslate;
}
exports.Translate = Translate;
function createQueryString(params) {
    let queryString = '';
    for (const key in params) {
        if (queryString !== '') {
            queryString += '&';
        }
        queryString += `${key}=${encodeURIComponent(params[key])}`;
    }
    return queryString;
}
exports.createQueryString = createQueryString;
async function getIsDvctTokenExpired() {
    const dvct = await db_server_1.prisma.deliverect.findFirst({});
    const dvctExpiration = dvct.deliverectExpiration;
    const dvctToken = dvct.deliverectToken;
    const currentTime = Math.floor(Date.now() / 1000); // Get the current time in Unix timestamp
    if (!dvctToken || !dvctExpiration) {
        console.log('%cutils.ts line:256 🔴  dvctToken or dvctExpiration on db is null', 'color: #007acc;');
        return true;
    }
    const isTokenExpired = dvct && dvctExpiration <= currentTime ? true : false;
    console.log('isDvctTokenExpired', isTokenExpired === false ? '🟢 token is not expired' : '🔴 needs to refresh!');
    return isTokenExpired;
}
exports.getIsDvctTokenExpired = getIsDvctTokenExpired;
function getUrl(name, pathname, params) {
    const tableId = getTableIdFromUrl(pathname);
    const menuId = getMenuIdFromUrl(pathname);
    const mainPath = `/table/${tableId}`;
    const menuIdPath = `${mainPath}/menu/${menuId}`;
    switch (name) {
        case 'userProfile':
            return `${mainPath}/user/${params.userId}?redirect=${pathname}`;
        case 'back':
            return `${mainPath}`;
        case 'main':
            return mainPath;
        case 'search':
            return `${menuIdPath}/search`;
    }
}
exports.getUrl = getUrl;
function getSearchParams({ request }) {
    return new URL(request.url).searchParams;
}
exports.getSearchParams = getSearchParams;
const dayOfWeek = number => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days[number - 1];
};
exports.dayOfWeek = dayOfWeek;
function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
exports.capitalizeFirstLetter = capitalizeFirstLetter;
const isValidE164Number = phoneNumber => {
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
};
exports.isValidE164Number = isValidE164Number;
function createPassword(username = faker_1.faker.internet.userName()) {
    return {
        hash: bcryptjs_1.default.hashSync(username, 10),
    };
}
exports.createPassword = createPassword;
async function getPasswordHash(password) {
    const hash = await bcryptjs_1.default.hash(password, 10);
    return hash;
}
exports.getPasswordHash = getPasswordHash;
