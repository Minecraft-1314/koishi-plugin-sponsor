"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extendModel = extendModel;
exports.toView = toView;
exports.qrToView = qrToView;
function extendModel(ctx) {
    ctx.model.extend('sponsor', {
        id: 'unsigned',
        name: 'string',
        amountCents: 'unsigned',
        message: 'text',
        platform: 'string',
        userId: 'string',
        enabled: 'boolean',
        createdAt: 'timestamp',
        updatedAt: 'timestamp',
    }, { primary: 'id', autoInc: true });
    ctx.model.extend('sponsor_qr', {
        id: 'unsigned',
        name: 'string',
        image: 'text',
        enabled: 'boolean',
        sortOrder: 'unsigned',
        createdAt: 'timestamp',
        updatedAt: 'timestamp',
    }, { primary: 'id', autoInc: true });
}
function toView(record) {
    return {
        id: record.id,
        name: record.name || '匿名支持者',
        amountCents: Number(record.amountCents || 0),
        message: record.message || '',
        platform: record.platform || '',
        userId: record.userId || '',
        enabled: record.enabled !== false,
        createdAt: toIso(record.createdAt),
        updatedAt: toIso(record.updatedAt),
    };
}
function qrToView(record) {
    return {
        id: record.id,
        name: record.name || '赞助方式',
        image: record.image || '',
        enabled: record.enabled !== false,
        sortOrder: Number(record.sortOrder || 0),
        createdAt: toIso(record.createdAt),
        updatedAt: toIso(record.updatedAt),
    };
}
function toIso(value) {
    if (!value)
        return '';
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}
