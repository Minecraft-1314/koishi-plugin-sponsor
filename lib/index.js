"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = exports.inject = exports.name = void 0;
exports.apply = apply;
const koishi_1 = require("koishi");
const mapping_1 = require("./mapping");
const database_1 = require("./database");
const render_1 = require("./render");
const console_1 = require("./console");
const actions_1 = require("./actions");
exports.name = 'sponsor';
exports.inject = {
    required: ['database'],
    optional: ['assets', 'http', 'console'],
};
exports.Config = koishi_1.Schema.object({
    enabled: koishi_1.Schema.boolean().default(true).description('是否启用赞助插件'),
    title: koishi_1.Schema.string().default('感谢支持').description('聊天展示的标题'),
    description: koishi_1.Schema.string().role('textarea').default('你的支持会帮助项目继续运行。').description('聊天展示的说明'),
    currency: koishi_1.Schema.string().default('¥').description('排行榜金额符号'),
    showAmounts: koishi_1.Schema.boolean().default(true).description('是否公开显示赞助金额'),
    leaderboardLimit: koishi_1.Schema.number().min(1).max(100).step(1).default(10).description('排行榜最多展示的人数'),
    maxQrCount: koishi_1.Schema.number().min(1).max(8).step(1).default(4).description('最多保存的二维码数量'),
    maxImageSize: koishi_1.Schema.number().min(1).max(10).step(1).default(2).description('二维码图片最大体积（MB）'),
    pageSize: koishi_1.Schema.number().min(1).max(100).step(1).default(10).description('控制台每页显示的赞助记录数'),
});
function safeConfig(config) {
    return {
        ...config,
        title: String(config.title || '感谢支持').trim().slice(0, 60) || '感谢支持',
        description: String(config.description || '').trim().slice(0, 300),
        currency: String(config.currency || '¥').trim().slice(0, 8) || '¥',
        leaderboardLimit: Math.min(100, Math.max(1, Math.floor(Number(config.leaderboardLimit) || 10))),
        maxQrCount: Math.min(8, Math.max(1, Math.floor(Number(config.maxQrCount) || 4))),
        maxImageSize: Math.min(10, Math.max(1, Math.floor(Number(config.maxImageSize) || 2))),
        pageSize: Math.min(100, Math.max(1, Math.floor(Number(config.pageSize) || 10))),
    };
}
async function apply(ctx, rawConfig) {
    const config = safeConfig(rawConfig);
    if (!config.enabled)
        return;
    const logger = new koishi_1.Logger(exports.name);
    try {
        (0, mapping_1.extendModel)(ctx);
    }
    catch (error) {
        logger.warn(`扩展赞助数据表失败（可能已存在）：${error}`);
    }
    await (0, actions_1.ensureBuiltinQr)(ctx, config, logger);
    ctx.command('赞助', '查看赞助二维码与排行榜')
        .alias('支持项目')
        .alias('sponsor')
        .action(async () => {
        try {
            const [qrs, records, summary] = await Promise.all([
                (0, database_1.listQrCodes)(ctx),
                (0, database_1.getLeaderboard)(ctx, config.leaderboardLimit),
                (0, database_1.summarizeSponsors)(ctx),
            ]);
            return (0, render_1.renderSponsor)(config, qrs, records, summary);
        }
        catch (error) {
            logger.warn(`读取赞助信息失败：${error}`);
            return '暂时无法读取赞助信息，请稍后重试。';
        }
    });
    ctx.command('赞助二维码', '查看赞助二维码')
        .alias('赞助码')
        .alias('sponsor.qr')
        .action(async () => {
        try {
            const qrs = await (0, database_1.listQrCodes)(ctx);
            return (0, render_1.renderSponsorQr)(config, qrs);
        }
        catch (error) {
            logger.warn(`读取赞助二维码失败：${error}`);
            return '暂时无法读取赞助二维码，请稍后重试。';
        }
    });
    ctx.command('赞助排行 [limit:natural]', '查看赞助排行榜')
        .alias('赞助榜')
        .alias('sponsor.rank')
        .action(async (_, limit) => {
        try {
            const requested = Number(limit) || config.leaderboardLimit;
            const [records, summary] = await Promise.all([
                (0, database_1.getLeaderboard)(ctx, Math.min(100, requested)),
                (0, database_1.summarizeSponsors)(ctx),
            ]);
            return (0, render_1.renderSponsorRanking)(config, records, summary);
        }
        catch (error) {
            logger.warn(`读取赞助排行榜失败：${error}`);
            return '暂时无法读取赞助排行榜，请稍后重试。';
        }
    });
    ctx.inject(['console'], consoleCtx => {
        (0, console_1.setupConsole)(consoleCtx.console, consoleCtx, config, logger);
    });
}
