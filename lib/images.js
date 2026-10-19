"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateQrImage = validateQrImage;
exports.repairQrImage = repairQrImage;
exports.saveQrImage = saveQrImage;
const fs_1 = require("fs");
const path_1 = require("path");
const DATA_IMAGE_PATTERN = /^data:image\/[\w.+-]+;base64,([A-Za-z0-9+/=\s]+)$/i;
const REMOTE_IMAGE_PATTERN = /^https?:\/\/\S+$/i;
const ASSET_UPLOAD_TIMEOUT = 10000;
function isBlockedHost(hostname) {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
    if (host === 'localhost' || host === '::1' || host === '0.0.0.0')
        return true;
    if (host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal') || host.endsWith('.lan'))
        return true;
    if (host.includes(':')) {
        const ipv6 = host.split('%')[0].toLowerCase();
        return ipv6 === '::' || ipv6 === '::1' || /^(fc|fd|fe[89ab])/.test(ipv6);
    }
    const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host);
    if (ipv4) {
        const parts = ipv4.slice(1).map(Number);
        if (parts.some(part => part > 255))
            return true;
        const [a, b] = parts;
        return a === 127 || a === 0 || a === 10 || a === 192 && b === 168 || a === 172 && b >= 16 && b <= 31 || a === 169 && b === 254 || a === 100 && b >= 64 && b <= 127;
    }
    return false;
}
function assertSafeRemoteUrl(value) {
    let parsed;
    try {
        parsed = new URL(value);
    }
    catch {
        throw new Error('二维码图片链接格式不正确。');
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('二维码图片链接只支持 HTTP 或 HTTPS。');
    }
    if (parsed.username || parsed.password) {
        throw new Error('二维码图片链接不能包含账号或密码。');
    }
    if (isBlockedHost(parsed.hostname)) {
        throw new Error('二维码图片链接不能指向本机或内网地址。');
    }
}
function sniffImageType(buffer) {
    if (buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
        return 'image/png';
    if (buffer.length > 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
        return 'image/jpeg';
    if (buffer.length > 4 && buffer.subarray(0, 4).toString('ascii') === 'GIF8')
        return 'image/gif';
    if (buffer.length > 12 && buffer.subarray(8, 12).toString('ascii') === 'WEBP')
        return 'image/webp';
    if (buffer.length > 2 && buffer[0] === 0x42 && buffer[1] === 0x4d)
        return 'image/bmp';
    if (buffer.length > 4 && buffer[0] === 0x00 && buffer[1] === 0x00 && buffer[2] === 0x01 && buffer[3] === 0x00)
        return 'image/x-icon';
    if (buffer.length > 12 && buffer.subarray(4, 12).toString('ascii') === 'ftypavif')
        return 'image/avif';
}
function decodeDataImage(source, maxBytes) {
    const matched = DATA_IMAGE_PATTERN.exec(source);
    if (!matched)
        return;
    const payload = matched[1].replace(/\s+/g, '');
    if (!payload || payload.length % 4 === 1)
        return;
    const buffer = Buffer.from(payload, 'base64');
    if (!buffer.length || buffer.length > maxBytes)
        return;
    const type = sniffImageType(buffer);
    return type ? { buffer, type } : undefined;
}
function validateQrImage(source, maxImageSize) {
    const value = String(source || '').trim();
    if (!value)
        throw new Error('请先选择或填写二维码图片。');
    if (value.startsWith('file:') || (!REMOTE_IMAGE_PATTERN.test(value) && !value.startsWith('data:image/'))) {
        throw new Error('二维码只支持图片链接或本地上传的图片。');
    }
    const maxBytes = Math.max(1, Math.floor(maxImageSize)) * 1024 * 1024;
    if (value.startsWith('data:image/')) {
        const decoded = decodeDataImage(value, maxBytes);
        if (!decoded)
            throw new Error(`二维码图片格式不受支持，或超过 ${maxImageSize}MB。`);
        return { value, type: decoded.type };
    }
    assertSafeRemoteUrl(value);
    return { value, type: '' };
}
function toDataImage(buffer, maxBytes) {
    if (!buffer.length || buffer.length > maxBytes)
        return;
    const type = sniffImageType(buffer);
    return type ? `data:${type};base64,${buffer.toString('base64')}` : undefined;
}
function readLocalAsset(ctx, source, maxBytes) {
    if (!REMOTE_IMAGE_PATTERN.test(source))
        return;
    let filename = '';
    try {
        filename = (0, path_1.basename)(new URL(source).pathname);
    }
    catch {
        return;
    }
    if (!filename)
        return;
    const roots = [
        String(ctx.assets?.root || ''),
        String(ctx.baseDir ? (0, path_1.resolve)(String(ctx.baseDir), 'data/assets') : ''),
    ].filter(Boolean);
    for (const root of roots) {
        const file = (0, path_1.resolve)(root, filename);
        if (!file.startsWith((0, path_1.resolve)(root)) || !(0, fs_1.existsSync)(file))
            continue;
        try {
            const data = toDataImage((0, fs_1.readFileSync)(file), maxBytes);
            if (data)
                return data;
        }
        catch {
            return;
        }
    }
}
function repairQrImage(ctx, source, maxImageSize) {
    const value = String(source || '').trim();
    if (!REMOTE_IMAGE_PATTERN.test(value))
        return value;
    const maxBytes = Math.max(1, Math.floor(maxImageSize)) * 1024 * 1024;
    return readLocalAsset(ctx, value, maxBytes) || value;
}
async function uploadToAssets(ctx, source, filename) {
    const assets = ctx.assets;
    if (!assets || typeof assets.upload !== 'function')
        return '';
    let timer;
    try {
        return String(await Promise.race([
            Promise.resolve(assets.upload(source, filename)),
            new Promise((_resolve, reject) => {
                timer = setTimeout(() => reject(new Error('assets 转存超时。')), ASSET_UPLOAD_TIMEOUT);
            }),
        ]) || '');
    }
    finally {
        if (timer)
            clearTimeout(timer);
    }
}
async function saveQrImage(ctx, source, maxImageSize, logger) {
    const validated = validateQrImage(source, maxImageSize);
    if (!validated.type) {
        const local = readLocalAsset(ctx, validated.value, Math.max(1, Math.floor(maxImageSize)) * 1024 * 1024);
        if (local)
            return local;
        try {
            const saved = await uploadToAssets(ctx, validated.value, '');
            if (saved)
                return repairQrImage(ctx, saved, maxImageSize);
        }
        catch (error) {
            logger.warn(`二维码链接转存到 assets 失败，保留原始链接：${error}`);
        }
        return validated.value;
    }
    return validated.value;
}
