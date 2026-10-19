import { $, Context } from 'koishi'
import { SponsorListFilter, SponsorQrRecord, SponsorRecord, SponsorSummary } from './types'

function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function isValidId(value: unknown): value is number {
  const id = Number(value)
  return Number.isSafeInteger(id) && id > 0
}

function buildSponsorQuery(filter: SponsorListFilter): Record<string, any> {
  const keyword = String(filter.keyword || '').trim()
  if (!keyword) return {}
  const pattern = new RegExp(escapeRegExp(keyword), 'i')
  return {
    $or: [
      { name: { $regex: pattern } },
      { message: { $regex: pattern } },
    ],
  }
}

export function resolvePageSize(override?: number, fallback = 10): number {
  const value = Math.floor(Number(override || fallback))
  return Math.min(100, Math.max(1, Number.isFinite(value) ? value : fallback))
}

export async function listQrCodes(ctx: Context, includeDisabled = false): Promise<SponsorQrRecord[]> {
  const where = includeDisabled ? {} : { enabled: true }
  return ctx.database.select('sponsor_qr')
    .where(where)
    .orderBy('sortOrder', 'asc')
    .orderBy('id', 'asc')
    .execute() as Promise<SponsorQrRecord[]>
}

export async function getQrCode(ctx: Context, id: number): Promise<SponsorQrRecord | undefined> {
  if (!isValidId(id)) return
  const rows = await ctx.database.get('sponsor_qr', { id })
  return rows[0]
}

export async function countQrCodes(ctx: Context): Promise<number> {
  return Number(await ctx.database.eval('sponsor_qr', row => $.count(row.id), {}) || 0)
}

export async function listSponsors(
  ctx: Context,
  filter: SponsorListFilter,
  limit: number,
): Promise<SponsorRecord[]> {
  const offset = Math.max(0, (Number(filter.page) || 1) - 1) * limit
  return ctx.database.select('sponsor')
    .where(buildSponsorQuery(filter))
    .orderBy('id', 'desc')
    .offset(offset)
    .limit(limit)
    .execute() as Promise<SponsorRecord[]>
}

export async function countSponsors(ctx: Context, filter: SponsorListFilter): Promise<number> {
  return Number(await ctx.database.eval('sponsor', row => $.count(row.id), buildSponsorQuery(filter)) || 0)
}

export async function getLeaderboard(ctx: Context, limit: number): Promise<SponsorRecord[]> {
  const safeLimit = Math.min(100, Math.max(1, Math.floor(Number(limit) || 10)))
  return ctx.database.select('sponsor')
    .where({ enabled: true })
    .orderBy('amountCents', 'desc')
    .orderBy('createdAt', 'asc')
    .limit(safeLimit)
    .execute() as Promise<SponsorRecord[]>
}

export async function summarizeSponsors(ctx: Context): Promise<SponsorSummary> {
  const [totalAmountCents, publicCount, hiddenCount, qrCount] = await Promise.all([
    ctx.database.eval('sponsor', row => $.sum(row.amountCents), { enabled: true }),
    ctx.database.eval('sponsor', row => $.count(row.id), { enabled: true }),
    ctx.database.eval('sponsor', row => $.count(row.id), { enabled: false }),
    ctx.database.eval('sponsor_qr', row => $.count(row.id), {}),
  ])
  return {
    totalAmountCents: Number(totalAmountCents || 0),
    publicCount: Number(publicCount || 0),
    hiddenCount: Number(hiddenCount || 0),
    qrCount: Number(qrCount || 0),
  }
}

export async function getSponsor(ctx: Context, id: number): Promise<SponsorRecord | undefined> {
  if (!isValidId(id)) return
  const rows = await ctx.database.get('sponsor', { id })
  return rows[0]
}

export async function removeSponsor(ctx: Context, id: number): Promise<boolean> {
  if (!isValidId(id)) return false
  const result = await ctx.database.remove('sponsor', { id })
  return Boolean((result as any)?.matched)
}

export async function removeQrCode(ctx: Context, id: number): Promise<boolean> {
  if (!isValidId(id)) return false
  const result = await ctx.database.remove('sponsor_qr', { id })
  return Boolean((result as any)?.matched)
}

export async function setSponsorEnabled(ctx: Context, id: number, enabled: boolean): Promise<boolean> {
  if (!isValidId(id)) return false
  const result = await ctx.database.set('sponsor', { id }, { enabled, updatedAt: new Date() })
  return Boolean((result as any)?.matched)
}

export async function setQrEnabled(ctx: Context, id: number, enabled: boolean): Promise<boolean> {
  if (!isValidId(id)) return false
  const result = await ctx.database.set('sponsor_qr', { id }, { enabled, updatedAt: new Date() })
  return Boolean((result as any)?.matched)
}
