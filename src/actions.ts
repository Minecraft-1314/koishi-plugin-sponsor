import { Context, Logger } from 'koishi'
import {
  SponsorActionPayload,
  SponsorActionResult,
  SponsorConfig,
  SponsorQrActionPayload,
} from './types'
import {
  countQrCodes,
  getQrCode,
  getSponsor,
  listQrCodes,
  removeQrCode,
  removeSponsor,
  setQrEnabled,
  setSponsorEnabled,
} from './database'
import { repairQrImage, saveQrImage } from './images'
import { BUILTIN_QR_IMAGE, BUILTIN_QR_NAME } from './defaults'

export function parseAmountToCents(value: unknown): number {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('赞助金额必须大于 0。')
  const cents = Math.round(amount * 100)
  if (!Number.isSafeInteger(cents) || cents <= 0 || cents > 1_000_000_000_000) {
    throw new Error('赞助金额超出允许范围。')
  }
  return cents
}

function normalizeName(value: unknown, fallback: string): string {
  const name = String(value ?? '').trim().replace(/\s+/g, ' ')
  if (!name) return fallback
  return name.slice(0, 40)
}

function normalizeMessage(value: unknown): string {
  return String(value ?? '').replace(/\r\n/g, '\n').trim().slice(0, 200)
}

export async function saveSponsor(
  ctx: Context,
  payload: SponsorActionPayload,
  operator: string,
): Promise<SponsorActionResult> {
  try {
    const id = Number(payload?.id) || 0
    const name = normalizeName(payload?.name, '匿名支持者')
    const amountCents = parseAmountToCents(payload?.amount)
    const message = normalizeMessage(payload?.message)
    const enabled = payload?.enabled !== false
    const now = new Date()

    if (id) {
      const existing = await getSponsor(ctx, id)
      if (!existing) return { ok: false, message: `没有找到赞助记录 #${id}。` }
      await ctx.database.set('sponsor', { id }, {
        name,
        amountCents,
        message,
        enabled,
        updatedAt: now,
      })
      return { ok: true, id, message: `已更新赞助记录 #${id}。` }
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
    } as any)
    const newId = Number((row as any)?.id || 0)
    return { ok: Boolean(newId), id: newId, message: newId ? `已新增赞助记录 #${newId}。` : '赞助记录创建失败。' }
  } catch (error) {
    return { ok: false, message: String((error as any)?.message || error) }
  }
}

export async function saveQr(
  ctx: Context,
  payload: SponsorQrActionPayload,
  config: SponsorConfig,
  logger: Logger,
): Promise<SponsorActionResult> {
  try {
    const id = Number(payload?.id) || 0
    const name = normalizeName(payload?.name, '赞助方式')
    const enabled = payload?.enabled !== false
    const sortOrder = Math.min(9999, Math.max(0, Math.floor(Number(payload?.sortOrder) || 0)))
    const now = new Date()

    if (id) {
      const existing = await getQrCode(ctx, id)
      if (!existing) return { ok: false, message: `没有找到二维码 #${id}。` }
      const image = payload?.image
        ? await saveQrImage(ctx, payload.image, config.maxImageSize, logger)
        : existing.image
      if (!image) return { ok: false, message: '二维码图片不能为空。' }
      await ctx.database.set('sponsor_qr', { id }, { name, image, enabled, sortOrder, updatedAt: now })
      return { ok: true, id, message: `已更新二维码 #${id}。` }
    }

    const total = await countQrCodes(ctx)
    if (total >= config.maxQrCount) {
      return { ok: false, message: `最多只能保存 ${config.maxQrCount} 个二维码。` }
    }
    const image = await saveQrImage(ctx, String(payload?.image || ''), config.maxImageSize, logger)
    const row = await ctx.database.create('sponsor_qr', {
      name,
      image,
      enabled,
      sortOrder,
      createdAt: now,
      updatedAt: now,
    } as any)
    const newId = Number((row as any)?.id || 0)
    return { ok: Boolean(newId), id: newId, message: newId ? `已新增二维码 #${newId}。` : '二维码创建失败。' }
  } catch (error) {
    return { ok: false, message: String((error as any)?.message || error) }
  }
}

export async function ensureBuiltinQr(
  ctx: Context,
  config: SponsorConfig,
  logger: Logger,
): Promise<void> {
  try {
    const rows = await listQrCodes(ctx, true)
    for (const row of rows) {
      const repaired = repairQrImage(ctx, row.image, config.maxImageSize)
      if (repaired !== row.image) {
        await ctx.database.set('sponsor_qr', { id: row.id }, {
          image: repaired,
          updatedAt: new Date(),
        })
        row.image = repaired
      }
    }
    const existing = rows.find(row => row.name === BUILTIN_QR_NAME)
    if (existing) {
      if (!existing.image) {
        await ctx.database.set('sponsor_qr', { id: existing.id }, {
          image: BUILTIN_QR_IMAGE,
          updatedAt: new Date(),
        })
      }
      return
    }
    const result = await saveQr(ctx, {
      name: BUILTIN_QR_NAME,
      image: BUILTIN_QR_IMAGE,
      enabled: true,
      sortOrder: 0,
    }, config, logger)
    if (!result.ok) {
      logger.warn('内置二维码初始化失败，将保留现有二维码列表。')
    }
  } catch (error) {
    logger.warn(`初始化内置二维码失败：${error}`)
  }
}

export async function deleteSponsor(ctx: Context, id: number): Promise<SponsorActionResult> {
  const removed = await removeSponsor(ctx, id)
  return { ok: removed, id, message: removed ? `已删除赞助记录 #${id}。` : `没有找到赞助记录 #${id}。` }
}

export async function deleteQr(ctx: Context, id: number): Promise<SponsorActionResult> {
  const removed = await removeQrCode(ctx, id)
  return { ok: removed, id, message: removed ? `已删除二维码 #${id}。` : `没有找到二维码 #${id}。` }
}

export async function toggleSponsor(ctx: Context, id: number, enabled: boolean): Promise<SponsorActionResult> {
  const changed = await setSponsorEnabled(ctx, id, enabled)
  return { ok: changed, id, message: changed ? `已${enabled ? '公开' : '隐藏'}赞助记录 #${id}。` : `没有找到赞助记录 #${id}。` }
}

export async function toggleQr(ctx: Context, id: number, enabled: boolean): Promise<SponsorActionResult> {
  const changed = await setQrEnabled(ctx, id, enabled)
  return { ok: changed, id, message: changed ? `已${enabled ? '启用' : '停用'}二维码 #${id}。` : `没有找到二维码 #${id}。` }
}
