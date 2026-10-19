import { Context } from 'koishi'
import { SponsorQrRecord, SponsorQrView, SponsorRecord, SponsorView } from './types'

export function extendModel(ctx: Context) {
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
  }, { primary: 'id', autoInc: true })

  ctx.model.extend('sponsor_qr', {
    id: 'unsigned',
    name: 'string',
    image: 'text',
    enabled: 'boolean',
    sortOrder: 'unsigned',
    createdAt: 'timestamp',
    updatedAt: 'timestamp',
  }, { primary: 'id', autoInc: true })
}

export function toView(record: SponsorRecord): SponsorView {
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
  }
}

export function qrToView(record: SponsorQrRecord): SponsorQrView {
  return {
    id: record.id,
    name: record.name || '赞助方式',
    image: record.image || '',
    enabled: record.enabled !== false,
    sortOrder: Number(record.sortOrder || 0),
    createdAt: toIso(record.createdAt),
    updatedAt: toIso(record.updatedAt),
  }
}

function toIso(value: Date | string | number | undefined): string {
  if (!value) return ''
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? '' : date.toISOString()
}
