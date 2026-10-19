"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolvePageSize = resolvePageSize;
exports.listQrCodes = listQrCodes;
exports.getQrCode = getQrCode;
exports.countQrCodes = countQrCodes;
exports.listSponsors = listSponsors;
exports.countSponsors = countSponsors;
exports.getLeaderboard = getLeaderboard;
exports.summarizeSponsors = summarizeSponsors;
exports.getSponsor = getSponsor;
exports.removeSponsor = removeSponsor;
exports.removeQrCode = removeQrCode;
exports.setSponsorEnabled = setSponsorEnabled;
exports.setQrEnabled = setQrEnabled;
const koishi_1 = require("koishi");
function escapeRegExp(source) {
    return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function isValidId(value) {
    const id = Number(value);
    return Number.isSafeInteger(id) && id > 0;
}
function buildSponsorQuery(filter) {
    const keyword = String(filter.keyword || '').trim();
    if (!keyword)
        return {};
    const pattern = new RegExp(escapeRegExp(keyword), 'i');
    return {
        $or: [
            { name: { $regex: pattern } },
            { message: { $regex: pattern } },
        ],
    };
}
function resolvePageSize(override, fallback = 10) {
    const value = Math.floor(Number(override || fallback));
    return Math.min(100, Math.max(1, Number.isFinite(value) ? value : fallback));
}
async function listQrCodes(ctx, includeDisabled = false) {
    const where = includeDisabled ? {} : { enabled: true };
    return ctx.database.select('sponsor_qr')
        .where(where)
        .orderBy('sortOrder', 'asc')
        .orderBy('id', 'asc')
        .execute();
}
async function getQrCode(ctx, id) {
    if (!isValidId(id))
        return;
    const rows = await ctx.database.get('sponsor_qr', { id });
    return rows[0];
}
async function countQrCodes(ctx) {
    return Number(await ctx.database.eval('sponsor_qr', row => koishi_1.$.count(row.id), {}) || 0);
}
async function listSponsors(ctx, filter, limit) {
    const offset = Math.max(0, (Number(filter.page) || 1) - 1) * limit;
    return ctx.database.select('sponsor')
        .where(buildSponsorQuery(filter))
        .orderBy('id', 'desc')
        .offset(offset)
        .limit(limit)
        .execute();
}
async function countSponsors(ctx, filter) {
    return Number(await ctx.database.eval('sponsor', row => koishi_1.$.count(row.id), buildSponsorQuery(filter)) || 0);
}
async function getLeaderboard(ctx, limit) {
    const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)));
    return ctx.database.select('sponsor')
        .where({ enabled: true })
        .orderBy('amountCents', 'desc')
        .orderBy('createdAt', 'asc')
        .limit(safeLimit)
        .execute();
}
async function summarizeSponsors(ctx) {
    const [totalAmountCents, publicCount, hiddenCount, qrCount] = await Promise.all([
        ctx.database.eval('sponsor', row => koishi_1.$.sum(row.amountCents), { enabled: true }),
        ctx.database.eval('sponsor', row => koishi_1.$.count(row.id), { enabled: true }),
        ctx.database.eval('sponsor', row => koishi_1.$.count(row.id), { enabled: false }),
        ctx.database.eval('sponsor_qr', row => koishi_1.$.count(row.id), {}),
    ]);
    return {
        totalAmountCents: Number(totalAmountCents || 0),
        publicCount: Number(publicCount || 0),
        hiddenCount: Number(hiddenCount || 0),
        qrCount: Number(qrCount || 0),
    };
}
async function getSponsor(ctx, id) {
    if (!isValidId(id))
        return;
    const rows = await ctx.database.get('sponsor', { id });
    return rows[0];
}
async function removeSponsor(ctx, id) {
    if (!isValidId(id))
        return false;
    const result = await ctx.database.remove('sponsor', { id });
    return Boolean(result?.matched);
}
async function removeQrCode(ctx, id) {
    if (!isValidId(id))
        return false;
    const result = await ctx.database.remove('sponsor_qr', { id });
    return Boolean(result?.matched);
}
async function setSponsorEnabled(ctx, id, enabled) {
    if (!isValidId(id))
        return false;
    const result = await ctx.database.set('sponsor', { id }, { enabled, updatedAt: new Date() });
    return Boolean(result?.matched);
}
async function setQrEnabled(ctx, id, enabled) {
    if (!isValidId(id))
        return false;
    const result = await ctx.database.set('sponsor_qr', { id }, { enabled, updatedAt: new Date() });
    return Boolean(result?.matched);
}
