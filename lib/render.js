"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderSponsor = renderSponsor;
exports.renderSponsorQr = renderSponsorQr;
exports.renderSponsorRanking = renderSponsorRanking;
const koishi_1 = require("koishi");
const defaults_1 = require("./defaults");
function amountText(cents, currency) {
    const value = (Number(cents || 0) / 100).toLocaleString('zh-CN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    return `${currency || ''}${value}`;
}
function rankingLines(config, records, summary) {
    const lines = ['', '赞助排行榜'];
    if (config.showAmounts) {
        lines.push(`累计赞助：${amountText(summary.totalAmountCents, config.currency)}`);
    }
    if (!records.length) {
        lines.push('暂时还没有公开的赞助记录。');
        return lines;
    }
    records.forEach((record, index) => {
        const amount = config.showAmounts ? `　${amountText(record.amountCents, config.currency)}` : '';
        const message = record.message ? `　${record.message}` : '';
        lines.push(`${index + 1}. ${record.name || '匿名支持者'}${amount}${message}`);
    });
    return lines;
}
function renderSponsor(config, qrs, records, summary) {
    const lines = [`【${config.title || '感谢支持'}】`];
    if (config.description)
        lines.push(config.description);
    lines.push(...rankingLines(config, records, summary));
    const elements = [koishi_1.h.text(lines.join('\n'))];
    if (!qrs.length && defaults_1.BUILTIN_QR_IMAGE) {
        elements.push(koishi_1.h.text('\n内置二维码'));
        elements.push(koishi_1.h.image(defaults_1.BUILTIN_QR_IMAGE));
    }
    for (const qr of qrs) {
        if (!qr.image)
            continue;
        elements.push(koishi_1.h.text(`\n${qr.name || '赞助方式'}`));
        elements.push(koishi_1.h.image(qr.image));
    }
    return elements;
}
function renderSponsorQr(config, qrs) {
    const lines = [`【${config.title || '感谢支持'}】`];
    if (config.description)
        lines.push(config.description);
    if (!qrs.length)
        lines.push('二维码尚未配置，请稍后再试。');
    const elements = [koishi_1.h.text(lines.join('\n'))];
    if (!qrs.length && defaults_1.BUILTIN_QR_IMAGE) {
        elements.push(koishi_1.h.text('\n内置二维码'));
        elements.push(koishi_1.h.image(defaults_1.BUILTIN_QR_IMAGE));
    }
    for (const qr of qrs) {
        if (!qr.image)
            continue;
        elements.push(koishi_1.h.text(`\n${qr.name || '赞助方式'}`));
        elements.push(koishi_1.h.image(qr.image));
    }
    return elements;
}
function renderSponsorRanking(config, records, summary) {
    const lines = [`【${config.title || '感谢支持'}】`];
    lines.push(...rankingLines(config, records, summary));
    return [koishi_1.h.text(lines.join('\n'))];
}
