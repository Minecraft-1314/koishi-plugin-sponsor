"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ADMIN_AUTHORITY = void 0;
exports.setupConsole = setupConsole;
const path_1 = require("path");
const database_1 = require("./database");
const mapping_1 = require("./mapping");
const defaults_1 = require("./defaults");
const actions_1 = require("./actions");
exports.ADMIN_AUTHORITY = 4;
const UPLOAD_ID_PATTERN = /^[a-z0-9]{6,32}$/;
const UPLOAD_CHUNK_MAX = 64 * 1024;
const UPLOAD_CHUNK_COUNT_MAX = 1024;
const UPLOAD_TTL = 5 * 60 * 1000;
function clientName(client) {
    const auth = client.auth;
    return auth?.name || '控制台管理员';
}
function assertAdmin(client) {
    const authority = client.auth?.authority;
    if (typeof authority !== 'number' || authority < exports.ADMIN_AUTHORITY) {
        throw new Error('权限不足，只有管理员可以管理赞助信息。');
    }
}
function normalizeFilter(filter, config) {
    const page = Math.max(1, Math.floor(Number(filter?.page) || 1));
    const pageSize = (0, database_1.resolvePageSize)(filter?.pageSize, config.pageSize);
    return {
        keyword: String(filter?.keyword || '').trim().slice(0, 80),
        page,
        pageSize,
    };
}
function settingsOf(config) {
    return {
        title: config.title,
        description: config.description,
        currency: config.currency,
        showAmounts: config.showAmounts,
        leaderboardLimit: config.leaderboardLimit,
        maxQrCount: config.maxQrCount,
        maxImageSize: config.maxImageSize,
        pageSize: config.pageSize,
    };
}
async function stateOf(ctx, config, filter) {
    const normalized = normalizeFilter(filter, config);
    const [records, total, summary, qrs] = await Promise.all([
        (0, database_1.listSponsors)(ctx, normalized, normalized.pageSize),
        (0, database_1.countSponsors)(ctx, normalized),
        (0, database_1.summarizeSponsors)(ctx),
        (0, database_1.listQrCodes)(ctx, true),
    ]);
    return {
        rows: records.map(mapping_1.toView),
        total,
        page: normalized.page,
        pageSize: normalized.pageSize,
        summary,
        qrs: qrs.map(mapping_1.qrToView),
        settings: settingsOf(config),
    };
}
function setupConsole(service, ctx, config, logger) {
    const uploads = new Map();
    const uploadBudget = Math.ceil(config.maxImageSize * 1024 * 1024 * 4 / 3) + 4096;
    function pruneUploads() {
        const now = Date.now();
        for (const [id, entry] of uploads) {
            if (now - entry.updatedAt > UPLOAD_TTL)
                uploads.delete(id);
        }
    }
    function receiveChunk(payload) {
        const uploadId = String(payload?.uploadId || '');
        if (!UPLOAD_ID_PATTERN.test(uploadId))
            throw new Error('图片上传标识不合法，请重新选择图片。');
        const total = Math.floor(Number(payload?.total));
        if (!Number.isSafeInteger(total) || total < 1 || total > UPLOAD_CHUNK_COUNT_MAX) {
            throw new Error('图片分片数量不合法，请重新选择图片。');
        }
        const seq = Math.floor(Number(payload?.seq));
        if (!Number.isSafeInteger(seq) || seq < 0 || seq >= total) {
            throw new Error('图片分片序号不合法，请重新选择图片。');
        }
        const chunk = String(payload?.chunk || '');
        if (!chunk || chunk.length > UPLOAD_CHUNK_MAX || !/^[\x21-\x7e]+$/.test(chunk)) {
            throw new Error('图片分片内容不合法，请重新选择图片。');
        }
        pruneUploads();
        let entry = uploads.get(uploadId);
        if (!entry) {
            entry = { chunks: new Map(), total, bytes: 0, updatedAt: Date.now() };
            uploads.set(uploadId, entry);
        }
        if (entry.total !== total) {
            uploads.delete(uploadId);
            throw new Error('图片分片数量前后不一致，请重新选择图片。');
        }
        if (entry.chunks.has(seq))
            return entry.chunks.size;
        entry.chunks.set(seq, chunk);
        entry.bytes += chunk.length;
        entry.updatedAt = Date.now();
        if (entry.bytes > uploadBudget) {
            uploads.delete(uploadId);
            throw new Error('二维码图片体积超出限制。');
        }
        return entry.chunks.size;
    }
    function assembleUpload(uploadId) {
        const entry = uploads.get(uploadId);
        if (!entry || !entry.chunks.size)
            throw new Error('图片上传数据已失效，请重新选择图片。');
        if (entry.chunks.size !== entry.total)
            throw new Error('图片分片不完整，请重新选择图片。');
        uploads.delete(uploadId);
        const parts = [];
        for (let seq = 0; seq < entry.total; seq++) {
            const part = entry.chunks.get(seq);
            if (part === undefined)
                throw new Error('图片分片不完整，请重新选择图片。');
            parts.push(part);
        }
        return parts.join('');
    }
    ctx.on('dispose', () => uploads.clear());
    service.addEntry({
        dev: (0, path_1.resolve)(__dirname, '../client'),
        prod: (0, path_1.resolve)(__dirname, '../dist'),
    });
    service.addListener('sponsor/state', async function (filter = {}) {
        assertAdmin(this);
        return stateOf(ctx, config, filter);
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/list', async function (filter = {}) {
        assertAdmin(this);
        const state = await stateOf(ctx, config, filter);
        return {
            rows: state.rows,
            total: state.total,
            page: state.page,
            pageSize: state.pageSize,
            summary: state.summary,
        };
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/settings', async function () {
        assertAdmin(this);
        return settingsOf(config);
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/builtin-image', async function () {
        assertAdmin(this);
        return defaults_1.BUILTIN_QR_IMAGE;
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/save', async function (payload) {
        assertAdmin(this);
        return (0, actions_1.saveSponsor)(ctx, payload, clientName(this));
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/delete', async function (id) {
        assertAdmin(this);
        return (0, actions_1.deleteSponsor)(ctx, Number(id));
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/toggle', async function (payload) {
        assertAdmin(this);
        return (0, actions_1.toggleSponsor)(ctx, Number(payload?.id), Boolean(payload?.enabled));
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/qr/list', async function () {
        assertAdmin(this);
        return (await (0, database_1.listQrCodes)(ctx, true)).map(mapping_1.qrToView);
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/qr/chunk', async function (payload) {
        assertAdmin(this);
        try {
            return { ok: true, message: 'ok', received: receiveChunk(payload) };
        }
        catch (error) {
            return { ok: false, message: String(error?.message || error), received: 0 };
        }
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/qr/save', async function (payload) {
        assertAdmin(this);
        const uploadId = String(payload?.uploadId || '');
        if (!uploadId)
            return (0, actions_1.saveQr)(ctx, payload, config, logger);
        try {
            const image = assembleUpload(uploadId);
            return await (0, actions_1.saveQr)(ctx, { ...payload, image, uploadId: undefined }, config, logger);
        }
        catch (error) {
            return { ok: false, message: String(error?.message || error) };
        }
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/qr/delete', async function (id) {
        assertAdmin(this);
        return (0, actions_1.deleteQr)(ctx, Number(id));
    }, { authority: exports.ADMIN_AUTHORITY });
    service.addListener('sponsor/qr/toggle', async function (payload) {
        assertAdmin(this);
        return (0, actions_1.toggleQr)(ctx, Number(payload?.id), Boolean(payload?.enabled));
    }, { authority: exports.ADMIN_AUTHORITY });
    logger.info('控制台管理页面已注册，路径 /sponsor');
}
