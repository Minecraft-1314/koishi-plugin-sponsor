"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseAmountToCents = parseAmountToCents;
exports.saveSponsor = saveSponsor;
exports.saveQr = saveQr;
exports.ensureBuiltinQr = ensureBuiltinQr;
exports.deleteSponsor = deleteSponsor;
exports.deleteQr = deleteQr;
exports.toggleSponsor = toggleSponsor;
exports.toggleQr = toggleQr;
const database_1 = require("./database");
const images_1 = require("./images");
const defaults_1 = require("./defaults");
function parseAmountToCents(value) {
    const amount = Number(value);
    if (!Number.isFinite(amount) || amount <= 0)
        throw new Error('赞助金额必须大于 0。');
    const cents = Math.round(amount * 100);
    if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 1000000000000) {
        throw new Error('赞助金额超出允许范围。');
    }
    return cents;
}
function normalizeName(value, fallback) {
    const name = String(value ?? '').trim().replace(/\s+/g, ' ');
    if (!name)
        return fallback;
    return name.slice(0, 40);
}
function normalizeMessage(value) {
    return String(value ?? '').replace(/\r\n/g, '\n').trim().slice(0, 200);
}
async function saveSponsor(ctx, payload, operator) {
    try {
        const id = Number(payload?.id) || 0;
        const name = normalizeName(payload?.name, '匿名支持者');
        const amountCents = parseAmountToCents(payload?.amount);
        const message = normalizeMessage(payload?.message);
        const enabled = payload?.enabled !== false;
        const now = new Date();
        if (id) {
            const existing = await (0, database_1.getSponsor)(ctx, id);
            if (!existing)
                return { ok: false, message: `没有找到赞助记录 #${id}。` };
            await ctx.database.set('sponsor', { id }, {
                name,
                amountCents,
                message,
                enabled,
                updatedAt: now,
            });
            return { ok: true, id, message: `已更新赞助记录 #${id}。` };
        }
        const row = await ctx.database.create('sponsor', {
            name,
            amountCents,
            message,
            platform: 'console',
            userId: operator,
            enabled,
            createdAt: now,
            updatedAt: now,
        });
        const newId = Number(row?.id || 0);
        return { ok: Boolean(newId), id: newId, message: newId ? `已新增赞助记录 #${newId}。` : '赞助记录创建失败。' };
    }
    catch (error) {
        return { ok: false, message: String(error?.message || error) };
    }
}
async function saveQr(ctx, payload, config, logger) {
    try {
        const id = Number(payload?.id) || 0;
        const name = normalizeName(payload?.name, '赞助方式');
        const enabled = payload?.enabled !== false;
        const sortOrder = Math.min(9999, Math.max(0, Math.floor(Number(payload?.sortOrder) || 0)));
        const now = new Date();
        if (id) {
            const existing = await (0, database_1.getQrCode)(ctx, id);
            if (!existing)
                return { ok: false, message: `没有找到二维码 #${id}。` };
            const image = payload?.image
                ? await (0, images_1.saveQrImage)(ctx, payload.image, config.maxImageSize, logger)
                : existing.image;
            if (!image)
                return { ok: false, message: '二维码图片不能为空。' };
            await ctx.database.set('sponsor_qr', { id }, { name, image, enabled, sortOrder, updatedAt: now });
            return { ok: true, id, message: `已更新二维码 #${id}。` };
        }
        const total = await (0, database_1.countQrCodes)(ctx);
        if (total >= config.maxQrCount) {
            return { ok: false, message: `最多只能保存 ${config.maxQrCount} 个二维码。` };
        }
        const image = await (0, images_1.saveQrImage)(ctx, String(payload?.image || ''), config.maxImageSize, logger);
        const row = await ctx.database.create('sponsor_qr', {
            name,
            image,
            enabled,
            sortOrder,
            createdAt: now,
            updatedAt: now,
        });
        const newId = Number(row?.id || 0);
        return { ok: Boolean(newId), id: newId, message: newId ? `已新增二维码 #${newId}。` : '二维码创建失败。' };
    }
    catch (error) {
        return { ok: false, message: String(error?.message || error) };
    }
}
async function ensureBuiltinQr(ctx, config, logger) {
    try {
        const rows = await (0, database_1.listQrCodes)(ctx, true);
        for (const row of rows) {
            const repaired = (0, images_1.repairQrImage)(ctx, row.image, config.maxImageSize);
            if (repaired !== row.image) {
                await ctx.database.set('sponsor_qr', { id: row.id }, {
                    image: repaired,
                    updatedAt: new Date(),
                });
                row.image = repaired;
            }
        }
        const existing = rows.find(row => row.name === defaults_1.BUILTIN_QR_NAME);
        if (existing) {
            if (!existing.image) {
                await ctx.database.set('sponsor_qr', { id: existing.id }, {
                    image: defaults_1.BUILTIN_QR_IMAGE,
                    updatedAt: new Date(),
                });
            }
            return;
        }
        const result = await saveQr(ctx, {
            name: defaults_1.BUILTIN_QR_NAME,
            image: defaults_1.BUILTIN_QR_IMAGE,
            enabled: true,
            sortOrder: 0,
        }, config, logger);
        if (!result.ok) {
            logger.warn('内置二维码初始化失败，将保留现有二维码列表。');
        }
    }
    catch (error) {
        logger.warn(`初始化内置二维码失败：${error}`);
    }
}
async function deleteSponsor(ctx, id) {
    const removed = await (0, database_1.removeSponsor)(ctx, id);
    return { ok: removed, id, message: removed ? `已删除赞助记录 #${id}。` : `没有找到赞助记录 #${id}。` };
}
async function deleteQr(ctx, id) {
    const removed = await (0, database_1.removeQrCode)(ctx, id);
    return { ok: removed, id, message: removed ? `已删除二维码 #${id}。` : `没有找到二维码 #${id}。` };
}
async function toggleSponsor(ctx, id, enabled) {
    const changed = await (0, database_1.setSponsorEnabled)(ctx, id, enabled);
    return { ok: changed, id, message: changed ? `已${enabled ? '公开' : '隐藏'}赞助记录 #${id}。` : `没有找到赞助记录 #${id}。` };
}
async function toggleQr(ctx, id, enabled) {
    const changed = await (0, database_1.setQrEnabled)(ctx, id, enabled);
    return { ok: changed, id, message: changed ? `已${enabled ? '启用' : '停用'}二维码 #${id}。` : `没有找到二维码 #${id}。` };
}
