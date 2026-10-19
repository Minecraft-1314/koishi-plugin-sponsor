import { h } from 'koishi'
import { SponsorConfig, SponsorQrRecord, SponsorRecord, SponsorSummary } from './types'
import { BUILTIN_QR_IMAGE } from './defaults'

function amountText(cents: number, currency: string): string {
  const value = (Number(cents || 0) / 100).toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  return `${currency || ''}${value}`
}

function rankingLines(
  config: SponsorConfig,
  records: SponsorRecord[],
  summary: SponsorSummary,
): string[] {
  const lines: string[] = ['', '赞助排行榜']
  if (config.showAmounts) {
    lines.push(`累计赞助：${amountText(summary.totalAmountCents, config.currency)}`)
  }
  if (!records.length) {
    lines.push('暂时还没有公开的赞助记录。')
    return lines
  }
  records.forEach((record, index) => {
    const amount = config.showAmounts ? `　${amountText(record.amountCents, config.currency)}` : ''
    const message = record.message ? `　${record.message}` : ''
    lines.push(`${index + 1}. ${record.name || '匿名支持者'}${amount}${message}`)
  })
  return lines
}

export function renderSponsor(
  config: SponsorConfig,
  qrs: SponsorQrRecord[],
  records: SponsorRecord[],
  summary: SponsorSummary,
): h[] {
  const lines = [`【${config.title || '感谢支持'}】`]
  if (config.description) lines.push(config.description)
  lines.push(...rankingLines(config, records, summary))
  const elements: h[] = [h.text(lines.join('\n'))]
  if (!qrs.length && BUILTIN_QR_IMAGE) {
    elements.push(h.text('\n内置二维码'))
    elements.push(h.image(BUILTIN_QR_IMAGE))
  }
  for (const qr of qrs) {
    if (!qr.image) continue
    elements.push(h.text(`\n${qr.name || '赞助方式'}`))
    elements.push(h.image(qr.image))
  }
  return elements
}

export function renderSponsorQr(config: SponsorConfig, qrs: SponsorQrRecord[]): h[] {
  const lines = [`【${config.title || '感谢支持'}】`]
  if (config.description) lines.push(config.description)
  if (!qrs.length) lines.push('二维码尚未配置，请稍后再试。')
  const elements: h[] = [h.text(lines.join('\n'))]
  if (!qrs.length && BUILTIN_QR_IMAGE) {
    elements.push(h.text('\n内置二维码'))
    elements.push(h.image(BUILTIN_QR_IMAGE))
  }
  for (const qr of qrs) {
    if (!qr.image) continue
    elements.push(h.text(`\n${qr.name || '赞助方式'}`))
    elements.push(h.image(qr.image))
  }
  return elements
}

export function renderSponsorRanking(
  config: SponsorConfig,
  records: SponsorRecord[],
  summary: SponsorSummary,
): h[] {
  const lines = [`【${config.title || '感谢支持'}】`]
  lines.push(...rankingLines(config, records, summary))
  return [h.text(lines.join('\n'))]
}
