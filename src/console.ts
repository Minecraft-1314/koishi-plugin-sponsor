import { Context, Logger } from 'koishi'
import { Client } from '@koishijs/console'
import { resolve } from 'path'
import {
  SponsorActionPayload,
  SponsorActionResult,
  SponsorConfig,
  SponsorListFilter,
  SponsorListResult,
  SponsorQrActionPayload,
  SponsorQrChunkPayload,
  SponsorChunkResult,
  SponsorSettings,
  SponsorState,
} from './types'
import {
  countSponsors,
  listQrCodes,
  listSponsors,
  resolvePageSize,
  summarizeSponsors,
} from './database'
import { qrToView, toView } from './mapping'
import { BUILTIN_QR_IMAGE } from './defaults'
import { deleteQr, deleteSponsor, saveQr, saveSponsor, toggleQr, toggleSponsor } from './actions'

export const ADMIN_AUTHORITY = 4

const UPLOAD_ID_PATTERN = /^[a-z0-9]{6,32}$/
const UPLOAD_CHUNK_MAX = 64 * 1024
const UPLOAD_CHUNK_COUNT_MAX = 1024
const UPLOAD_TTL = 5 * 60 * 1000

declare module '@koishijs/console' {
  interface Events {
    'sponsor/state'(this: Client, filter?: SponsorListFilter): Promise<SponsorState>
    'sponsor/list'(this: Client, filter?: SponsorListFilter): Promise<SponsorListResult>
    'sponsor/save'(this: Client, payload: SponsorActionPayload): Promise<SponsorActionResult>
    'sponsor/delete'(this: Client, id: number): Promise<SponsorActionResult>
    'sponsor/toggle'(this: Client, payload: { id: number; enabled: boolean }): Promise<SponsorActionResult>
    'sponsor/qr/list'(this: Client): Promise<SponsorState['qrs']>
    'sponsor/qr/save'(this: Client, payload: SponsorQrActionPayload): Promise<SponsorActionResult>
    'sponsor/qr/chunk'(this: Client, payload: SponsorQrChunkPayload): Promise<SponsorChunkResult>
    'sponsor/qr/delete'(this: Client, id: number): Promise<SponsorActionResult>
    'sponsor/qr/toggle'(this: Client, payload: { id: number; enabled: boolean }): Promise<SponsorActionResult>
    'sponsor/settings'(this: Client): Promise<SponsorSettings>
    'sponsor/builtin-image'(this: Client): Promise<string>
  }
}

function clientName(client: Client): string {
  const auth = (client as any).auth
  return auth?.name || '控制台管理员'
}

function assertAdmin(client: Client) {
  const authority = (client as any).auth?.authority
  if (typeof authority !== 'number' || authority < ADMIN_AUTHORITY) {
    throw new Error('权限不足，只有管理员可以管理赞助信息。')
  }
}

function normalizeFilter(filter: SponsorListFilter, config: SponsorConfig) {
  const page = Math.max(1, Math.floor(Number(filter?.page) || 1))
  const pageSize = resolvePageSize(filter?.pageSize, config.pageSize)
  return {
    keyword: String(filter?.keyword || '').trim().slice(0, 80),
    page,
    pageSize,
  }
}

function settingsOf(config: SponsorConfig): SponsorSettings {
  return {
    title: config.title,
    description: config.description,
    currency: config.currency,
    showAmounts: config.showAmounts,
    leaderboardLimit: config.leaderboardLimit,
    maxQrCount: config.maxQrCount,
    maxImageSize: config.maxImageSize,
    pageSize: config.pageSize,
  }
}

async function stateOf(ctx: Context, config: SponsorConfig, filter: SponsorListFilter): Promise<SponsorState> {
  const normalized = normalizeFilter(filter, config)
  const [records, total, summary, qrs] = await Promise.all([
    listSponsors(ctx, normalized, normalized.pageSize),
    countSponsors(ctx, normalized),
    summarizeSponsors(ctx),
    listQrCodes(ctx, true),
  ])
  return {
    rows: records.map(toView),
    total,
    page: normalized.page,
    pageSize: normalized.pageSize,
    summary,
    qrs: qrs.map(qrToView),
    settings: settingsOf(config),
  }
}

export function setupConsole(
  service: any,
  ctx: Context,
  config: SponsorConfig,
  logger: Logger,
) {
  const uploads = new Map<string, { chunks: Map<number, string>; total: number; bytes: number; updatedAt: number }>()
  const uploadBudget = Math.ceil(config.maxImageSize * 1024 * 1024 * 4 / 3) + 4096

  function pruneUploads() {
    const now = Date.now()
    for (const [id, entry] of uploads) {
      if (now - entry.updatedAt > UPLOAD_TTL) uploads.delete(id)
    }
  }

  function receiveChunk(payload: SponsorQrChunkPayload): number {
    const uploadId = String(payload?.uploadId || '')
    if (!UPLOAD_ID_PATTERN.test(uploadId)) throw new Error('图片上传标识不合法，请重新选择图片。')
    const total = Math.floor(Number(payload?.total))
    if (!Number.isSafeInteger(total) || total < 1 || total > UPLOAD_CHUNK_COUNT_MAX) {
      throw new Error('图片分片数量不合法，请重新选择图片。')
    }
    const seq = Math.floor(Number(payload?.seq))
    if (!Number.isSafeInteger(seq) || seq < 0 || seq >= total) {
      throw new Error('图片分片序号不合法，请重新选择图片。')
    }
    const chunk = String(payload?.chunk || '')
    if (!chunk || chunk.length > UPLOAD_CHUNK_MAX || !/^[\x21-\x7e]+$/.test(chunk)) {
      throw new Error('图片分片内容不合法，请重新选择图片。')
    }

    pruneUploads()
    let entry = uploads.get(uploadId)
    if (!entry) {
      entry = { chunks: new Map(), total, bytes: 0, updatedAt: Date.now() }
      uploads.set(uploadId, entry)
    }
    if (entry.total !== total) {
      uploads.delete(uploadId)
      throw new Error('图片分片数量前后不一致，请重新选择图片。')
    }
    if (entry.chunks.has(seq)) return entry.chunks.size
    entry.chunks.set(seq, chunk)
    entry.bytes += chunk.length
    entry.updatedAt = Date.now()
    if (entry.bytes > uploadBudget) {
      uploads.delete(uploadId)
      throw new Error('二维码图片体积超出限制。')
    }
    return entry.chunks.size
  }

  function assembleUpload(uploadId: string): string {
    const entry = uploads.get(uploadId)
    if (!entry || !entry.chunks.size) throw new Error('图片上传数据已失效，请重新选择图片。')
    if (entry.chunks.size !== entry.total) throw new Error('图片分片不完整，请重新选择图片。')
    uploads.delete(uploadId)
    const parts: string[] = []
    for (let seq = 0; seq < entry.total; seq++) {
      const part = entry.chunks.get(seq)
      if (part === undefined) throw new Error('图片分片不完整，请重新选择图片。')
      parts.push(part)
    }
    return parts.join('')
  }

  ctx.on('dispose', () => uploads.clear())

  service.addEntry({
    dev: resolve(__dirname, '../client'),
    prod: resolve(__dirname, '../dist'),
  })

  service.addListener('sponsor/state', async function (this: Client, filter: SponsorListFilter = {}) {
    assertAdmin(this)
    return stateOf(ctx, config, filter)
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/list', async function (this: Client, filter: SponsorListFilter = {}): Promise<SponsorListResult> {
    assertAdmin(this)
    const state = await stateOf(ctx, config, filter)
    return {
      rows: state.rows,
      total: state.total,
      page: state.page,
      pageSize: state.pageSize,
      summary: state.summary,
    }
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/settings', async function (this: Client) {
    assertAdmin(this)
    return settingsOf(config)
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/builtin-image', async function (this: Client) {
    assertAdmin(this)
    return BUILTIN_QR_IMAGE
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/save', async function (this: Client, payload: SponsorActionPayload) {
    assertAdmin(this)
    return saveSponsor(ctx, payload, clientName(this))
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/delete', async function (this: Client, id: number) {
    assertAdmin(this)
    return deleteSponsor(ctx, Number(id))
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/toggle', async function (this: Client, payload: { id: number; enabled: boolean }) {
    assertAdmin(this)
    return toggleSponsor(ctx, Number(payload?.id), Boolean(payload?.enabled))
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/qr/list', async function (this: Client) {
    assertAdmin(this)
    return (await listQrCodes(ctx, true)).map(qrToView)
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/qr/chunk', async function (this: Client, payload: SponsorQrChunkPayload) {
    assertAdmin(this)
    try {
      return { ok: true, message: 'ok', received: receiveChunk(payload) } as SponsorChunkResult
    } catch (error) {
      return { ok: false, message: String((error as any)?.message || error), received: 0 } as SponsorChunkResult
    }
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/qr/save', async function (this: Client, payload: SponsorQrActionPayload) {
    assertAdmin(this)
    const uploadId = String(payload?.uploadId || '')
    if (!uploadId) return saveQr(ctx, payload, config, logger)
    try {
      const image = assembleUpload(uploadId)
      return await saveQr(ctx, { ...payload, image, uploadId: undefined }, config, logger)
    } catch (error) {
      return { ok: false, message: String((error as any)?.message || error) }
    }
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/qr/delete', async function (this: Client, id: number) {
    assertAdmin(this)
    return deleteQr(ctx, Number(id))
  }, { authority: ADMIN_AUTHORITY })

  service.addListener('sponsor/qr/toggle', async function (this: Client, payload: { id: number; enabled: boolean }) {
    assertAdmin(this)
    return toggleQr(ctx, Number(payload?.id), Boolean(payload?.enabled))
  }, { authority: ADMIN_AUTHORITY })

  logger.info('控制台管理页面已注册，路径 /sponsor')
}
