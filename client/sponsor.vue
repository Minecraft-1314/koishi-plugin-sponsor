<template>
  <el-config-provider :locale="zhCn">
    <k-layout main="page-sponsor">
      <k-content>
        <div class="an-page">
          <header class="an-hero">
            <div class="an-hero-text">
              <h1>赞助管理</h1>
              <p>{{ settings.description || '维护赞助渠道与公开排行榜。' }}</p>
            </div>
            <div class="an-hero-actions">
              <label class="an-switch">
                <span>自动刷新</span>
                <el-switch v-model="autoRefresh" />
              </label>
              <el-button :loading="loading" @click="load()">
                <k-icon name="redo" />
                <span>刷新</span>
              </el-button>
              <el-button type="primary" :disabled="acting" @click="openSponsor()">
                <k-icon name="add" />
                <span>新增记录</span>
              </el-button>
            </div>
          </header>

          <section class="an-stats">
            <button v-for="card in statCards" :key="card.key" type="button" class="an-stat" :class="`is-${card.key}`">
              <span class="an-stat-head">
                <span class="an-stat-label">{{ card.label }}</span>
                <span class="an-stat-dot" />
              </span>
              <span class="an-stat-value">{{ card.value }}</span>
              <span class="an-stat-track">
                <span class="an-stat-fill" :style="{ transform: `scaleX(${card.ratio})` }" />
              </span>
            </button>
          </section>

          <nav class="an-tabs" role="tablist">
            <button type="button" class="an-tab" :class="{ 'is-active': activeTab === 'ranking' }" @click="activeTab = 'ranking'">
              <k-icon name="clipboard-list" />
              <span>赞助排行榜</span>
            </button>
            <button type="button" class="an-tab" :class="{ 'is-active': activeTab === 'qr' }" @click="activeTab = 'qr'">
              <k-icon name="tag" />
              <span>收款二维码</span>
            </button>
          </nav>

          <section v-if="activeTab === 'ranking'" class="an-panel">
            <div class="an-toolbar">
              <el-input v-model="keyword" class="an-search" placeholder="搜索赞助人或留言，按回车开始搜索" clearable @keyup.enter="reload" @clear="reload" />
              <el-select v-model="pageSize" class="an-select is-small" @change="reload">
                <el-option :value="10" label="每页 10 条" />
                <el-option :value="20" label="每页 20 条" />
                <el-option :value="50" label="每页 50 条" />
              </el-select>
              <el-button type="primary" :disabled="acting" @click="openSponsor()">
                <k-icon name="add" />
                <span>新增记录</span>
              </el-button>
            </div>

            <el-table v-loading="loading" :data="rows" row-key="id" class="an-table">
              <el-table-column label="排名" width="76">
                <template #default="{ $index }">
                  <span class="an-rank" :class="$index < 3 ? `rank-${$index + 1}` : ''">{{ $index + 1 }}</span>
                </template>
              </el-table-column>
              <el-table-column label="赞助人" min-width="180">
                <template #default="{ row }">
                  <p class="an-cell-title">{{ row.name || '匿名支持者' }}</p>
                  <p class="an-cell-meta">{{ row.platform ? `${row.platform} · ${row.userId || '未知'}` : '控制台记录' }}</p>
                </template>
              </el-table-column>
              <el-table-column label="金额" width="130">
                <template #default="{ row }">
                  <strong class="an-amount">{{ money(row.amountCents, settings.currency, showAmounts) }}</strong>
                </template>
              </el-table-column>
              <el-table-column label="留言" min-width="220">
                <template #default="{ row }">
                  <span class="an-message">{{ row.message || '—' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="状态" width="100">
                <template #default="{ row }">
                  <span class="an-tag" :class="row.enabled ? 'is-done' : 'is-partial'">{{ row.enabled ? '公开' : '隐藏' }}</span>
                </template>
              </el-table-column>
              <el-table-column label="时间" width="150">
                <template #default="{ row }">
                  <span :title="formatTime(row.createdAt)">{{ relativeTime(row.createdAt) }}</span>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="150" align="right">
                <template #default="{ row }">
                  <el-button size="small" text :disabled="acting" @click="toggleSponsor(row)">{{ row.enabled ? '隐藏' : '公开' }}</el-button>
                  <el-button size="small" text @click="openSponsor(row)">编辑</el-button>
                  <el-button size="small" text class="an-danger-button" :disabled="acting" @click="confirmDeleteSponsor(row)">删除</el-button>
                </template>
              </el-table-column>
              <template #empty>
                <div class="an-empty">
                  <k-icon name="box-open" />
                  <p class="an-empty-title">还没有赞助记录</p>
                  <p class="an-empty-desc">点击右上角「新增记录」开始维护</p>
                </div>
              </template>
            </el-table>

            <footer v-if="total > 0" class="an-footer">
              <span class="an-total">共 {{ total }} 条，当前第 {{ page }} / {{ pages }} 页</span>
              <el-pagination v-if="pages > 1" layout="prev, pager, next" :total="total" :current-page="page" :page-size="pageSize" :pager-count="5" @current-change="changePage" />
            </footer>
          </section>

          <section v-else class="an-panel">
            <div class="an-toolbar">
              <span class="an-toolbar-label">已配置 {{ qrs.length }} / {{ settings.maxQrCount }} 个渠道</span>
              <el-button type="primary" :disabled="acting || qrs.length >= settings.maxQrCount" @click="openQr()">
                <k-icon name="add" />
                <span>新增二维码</span>
              </el-button>
            </div>
            <div v-if="qrs.length" class="an-qr-grid">
              <article v-for="row in qrs" :key="row.id" class="an-qr-card" :class="{ 'is-disabled': !row.enabled }">
                <div class="an-qr-preview">
                  <el-image v-if="row.image" :src="row.image" :alt="row.name || '赞助二维码'" fit="contain" :preview-src-list="[row.image]" preview-teleported />
                  <k-icon v-else name="file-archive" />
                </div>
                <div class="an-qr-info">
                  <div class="an-qr-head">
                    <strong>{{ row.name || '赞助方式' }}</strong>
                    <span class="an-qr-order">#{{ row.sortOrder }}</span>
                  </div>
                  <div class="an-qr-state">
                    <span class="an-tag" :class="row.enabled ? 'is-done' : 'is-partial'">{{ row.enabled ? '已启用' : '已停用' }}</span>
                    <el-switch :model-value="row.enabled" :disabled="acting" @change="toggleQr(row)" />
                  </div>
                </div>
                <div class="an-qr-actions">
                  <el-button size="small" text @click="openQr(row)">编辑</el-button>
                  <el-button size="small" text class="an-danger-button" :disabled="acting" @click="confirmDeleteQr(row)">删除</el-button>
                </div>
              </article>
            </div>
            <div v-else class="an-empty">
              <k-icon name="tag" />
              <p class="an-empty-title">还没有二维码</p>
              <p class="an-empty-desc">新增一个赞助渠道</p>
            </div>
          </section>

          <el-dialog v-model="sponsorDialog" :title="sponsorForm.id ? `编辑记录 #${sponsorForm.id}` : '新增赞助记录'" width="620px" align-center :close-on-click-modal="false">
            <el-form label-position="top" class="an-form">
              <el-form-item label="赞助人名称">
                <el-input v-model="sponsorForm.name" maxlength="40" placeholder="匿名支持者" />
              </el-form-item>
              <el-form-item label="赞助金额">
                <el-input v-model="sponsorForm.amount" type="number" min="0.01" step="0.01" placeholder="0.00" />
              </el-form-item>
              <el-form-item label="留言">
                <el-input v-model="sponsorForm.message" type="textarea" :rows="4" maxlength="200" placeholder="可选" />
              </el-form-item>
              <el-form-item label="公开到排行榜">
                <el-switch v-model="sponsorForm.enabled" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="sponsorDialog = false">取消</el-button>
              <el-button type="primary" :loading="acting" @click="submitSponsor">保存记录</el-button>
            </template>
          </el-dialog>

          <el-dialog v-model="qrDialog" :title="qrForm.id ? `编辑二维码 #${qrForm.id}` : '新增二维码'" width="620px" align-center :close-on-click-modal="false">
            <el-form label-position="top" class="an-form">
              <el-form-item label="渠道名称">
                <el-input v-model="qrForm.name" maxlength="40" placeholder="微信赞助" />
              </el-form-item>
              <el-form-item class="an-image-field" label="二维码图片">
                <div class="an-qr-upload">
                  <input ref="qrFileInput" class="an-file-input" type="file" accept="image/png,image/jpeg,image/gif,image/webp,image/bmp" :disabled="qrUploading" @change="chooseQrFile">
                  <button type="button" class="an-upload-button" :class="{ 'is-disabled': qrUploading }" :disabled="qrUploading" @click="chooseQrFileClick">
                    <k-icon name="file-archive" />
                    <span>{{ qrUploading ? '读取中' : '选择图片' }}</span>
                  </button>
                  <span class="an-qr-hint" :class="{ 'is-error': qrError }">{{ qrProgress || qrError || '支持 PNG、APNG、JPEG、GIF、WebP、AVIF、BMP、ICO' }}</span>
                </div>
                <div v-if="qrForm.image" class="an-qr-image-preview">
                  <el-image :src="qrForm.image" alt="二维码预览" fit="contain" :preview-src-list="[qrForm.image]" preview-teleported />
                </div>
                <el-input v-model="qrForm.image" type="url" placeholder="也可以粘贴图片链接" />
              </el-form-item>
              <el-form-item label="排序">
                <el-input-number v-model="qrForm.sortOrder" :min="0" :max="9999" />
              </el-form-item>
              <el-form-item label="启用">
                <el-switch v-model="qrForm.enabled" />
              </el-form-item>
            </el-form>
            <template #footer>
              <el-button @click="qrDialog = false">取消</el-button>
              <el-button type="primary" :loading="acting || qrUploading" @click="submitQr">保存二维码</el-button>
            </template>
          </el-dialog>
        </div>
      </k-content>
    </k-layout>
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { message, messageBox, send } from '@koishijs/client'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import type { SponsorQrView, SponsorSettings, SponsorSummary, SponsorView } from '../src/types'

const REFRESH_INTERVAL = 30 * 1000
const RPC_TIMEOUT = 15 * 1000
const UPLOAD_CHUNK_SIZE = 48 * 1024
const INLINE_IMAGE_LIMIT = 40 * 1024
const ALLOWED_TYPES = ['image/png', 'image/apng', 'image/jpeg', 'image/gif', 'image/webp', 'image/avif', 'image/bmp', 'image/x-icon']
const DEFAULT_SUMMARY = { totalAmountCents: 0, publicCount: 0, hiddenCount: 0, qrCount: 0 }
const DEFAULT_SETTINGS = {
  title: '赞助管理',
  description: '',
  currency: '¥',
  showAmounts: true,
  leaderboardLimit: 10,
  maxQrCount: 4,
  maxImageSize: 2,
  pageSize: 10,
}

const loading = ref(false)
const acting = ref(false)
const rows = ref<SponsorView[]>([])
const qrs = ref<SponsorQrView[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(10)
const keyword = ref('')
const summary = ref<SponsorSummary>({ ...DEFAULT_SUMMARY })
const settings = ref<SponsorSettings>({ ...DEFAULT_SETTINGS })
const activeTab = ref<'ranking' | 'qr'>('ranking')
const autoRefresh = ref(true)
const sponsorDialog = ref(false)
const qrDialog = ref(false)
const qrUploading = ref(false)
const qrError = ref('')
const qrProgress = ref('')
const qrFileInput = ref<HTMLInputElement | null>(null)
const sponsorForm = ref({ id: 0, name: '', amount: '', message: '', enabled: true })
const qrForm = ref({ id: 0, name: '', image: '', enabled: true, sortOrder: 0 })
let refreshTimer: number | undefined
let keyHandler: ((event: KeyboardEvent) => void) | undefined
let loadingRequests = 0
let loadVersion = 0
let disposed = false

const pages = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))
const showAmounts = computed(() => settings.value.showAmounts !== false)
const statCards = computed(() => {
  const totalValue = Math.max(1, summary.value.publicCount + summary.value.hiddenCount)
  return [
    { key: 'total', label: '累计赞助', value: money(summary.value.totalAmountCents, settings.value.currency, showAmounts.value), ratio: 1 },
    { key: 'public', label: '公开记录', value: `${summary.value.publicCount} 条`, ratio: summary.value.publicCount / totalValue },
    { key: 'hidden', label: '隐藏记录', value: `${summary.value.hiddenCount} 条`, ratio: summary.value.hiddenCount / totalValue },
    { key: 'qr', label: '二维码渠道', value: `${summary.value.qrCount} 个`, ratio: Math.min(1, summary.value.qrCount / Math.max(1, settings.value.maxQrCount)) },
  ]
})

function money(cents: number | string | undefined, currency: string, show = true) {
  if (!show) return '未公开'
  return `${currency || '¥'}${(Number(cents || 0) / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatTime(value: string | number | Date | undefined) {
  if (!value) return '未知'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '未知'
  const pad = (number: number) => String(number).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function relativeTime(value: string | number | Date | undefined) {
  if (!value) return '未知'
  const time = new Date(value).getTime()
  if (Number.isNaN(time)) return '未知'
  const diff = Date.now() - time
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} 分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} 小时前`
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)} 天前`
  return formatTime(value)
}

function errorText(error: unknown) {
  const raw = typeof error === 'string' ? error : String((error as any)?.message || error || '')
  return raw.split('\n')[0].replace(/^Error:\s*/, '').trim() || '操作没有成功，请稍后再试。'
}

function readFileAsDataUrl(file: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error || new Error('读取图片失败'))
    reader.readAsDataURL(file)
  })
}

async function uploadImageChunked(dataUrl: string) {
  const uploadId = Math.random().toString(36).slice(2, 14)
  const total = Math.ceil(dataUrl.length / UPLOAD_CHUNK_SIZE)
  for (let seq = 0; seq < total; seq++) {
    qrProgress.value = `上传图片 ${seq + 1}/${total}`
    const chunk = dataUrl.slice(seq * UPLOAD_CHUNK_SIZE, (seq + 1) * UPLOAD_CHUNK_SIZE)
    const result = await rpc<any>('sponsor/qr/chunk', { uploadId, seq, total, chunk })
    if (result?.ok === false) throw new Error(result.message || '图片上传失败，请重新选择图片。')
  }
  qrProgress.value = ''
  return uploadId
}

async function rpc<T = any>(type: string, ...args: any[]): Promise<T> {
  let timer: number | undefined
  try {
    const request = (send as any)(type, ...args)
    if (!request) return Promise.reject(new Error('与控制台的连接还没有建立，请稍后重试。'))
    return Promise.race([
      request,
      new Promise((_resolve, reject) => {
        timer = window.setTimeout(() => reject(new Error('控制台请求超时，请稍后重试。')), RPC_TIMEOUT)
      }),
    ]).finally(() => {
      if (timer) window.clearTimeout(timer)
    }) as Promise<T>
  } catch (error) {
    return Promise.reject(error)
  }
}

async function load(silent = false) {
  if (disposed) return
  const version = ++loadVersion
  if (!silent) {
    loadingRequests += 1
    loading.value = true
  }
  try {
    const state = await rpc<any>('sponsor/state', { keyword: keyword.value.trim(), page: page.value, pageSize: pageSize.value })
    if (disposed || version !== loadVersion) return
    rows.value = state.rows || []
    qrs.value = state.qrs || []
    total.value = Number(state.total || 0)
    page.value = Number(state.page || 1)
    pageSize.value = Number(state.pageSize || pageSize.value)
    summary.value = { ...DEFAULT_SUMMARY, ...(state.summary || {}) }
    settings.value = { ...DEFAULT_SETTINGS, ...(state.settings || {}) }
  } catch (error) {
    if (!disposed && version === loadVersion && !silent) message.error(errorText(error))
  } finally {
    if (!silent) {
      loadingRequests = Math.max(0, loadingRequests - 1)
      loading.value = loadingRequests > 0
    }
  }
}

function reload() {
  page.value = 1
  load()
}

function changePage(nextPage: number) {
  page.value = Math.min(pages.value, Math.max(1, Number(nextPage) || 1))
  load()
}

function stopRefresh() {
  if (refreshTimer) window.clearInterval(refreshTimer)
  refreshTimer = undefined
}

function startRefresh() {
  stopRefresh()
  if (!autoRefresh.value) return
  refreshTimer = window.setInterval(() => {
    if (sponsorDialog.value || qrDialog.value || acting.value) return
    load(true)
  }, REFRESH_INTERVAL)
}

function openSponsor(row?: SponsorView) {
  sponsorForm.value = {
    id: row?.id || 0,
    name: row?.name || '',
    amount: row ? (Number(row.amountCents || 0) / 100).toFixed(2) : '',
    message: row?.message || '',
    enabled: row ? row.enabled !== false : true,
  }
  sponsorDialog.value = true
}

function openQr(row?: SponsorQrView) {
  qrError.value = ''
  qrProgress.value = ''
  qrForm.value = {
    id: row?.id || 0,
    name: row?.name || '',
    image: row?.image || '',
    enabled: row ? row.enabled !== false : true,
    sortOrder: row?.sortOrder || 0,
  }
  qrDialog.value = true
}

async function runSponsorAction(type: string, payload: unknown, successMessage: string) {
  if (acting.value) return false
  acting.value = true
  try {
    const result = await rpc<any>(type, payload)
    if (result?.ok === false) {
      message.warning(result.message)
      return false
    }
    message.success(result?.message || successMessage)
    return true
  } catch (error) {
    message.error(errorText(error))
    return false
  } finally {
    await load(true)
    acting.value = false
  }
}

async function submitSponsor() {
  const amount = Number(sponsorForm.value.amount)
  if (!Number.isFinite(amount) || amount <= 0) {
    message.warning('赞助金额必须大于 0。')
    return
  }
  const saved = await runSponsorAction('sponsor/save', {
    id: sponsorForm.value.id || undefined,
    name: sponsorForm.value.name.trim() || '匿名支持者',
    amount,
    message: sponsorForm.value.message.trim(),
    enabled: sponsorForm.value.enabled,
  }, '赞助记录已保存。')
  if (saved) sponsorDialog.value = false
}

async function submitQr() {
  if (acting.value || qrUploading.value) return
  if (!qrForm.value.name.trim()) {
    message.warning('请填写二维码名称。')
    return
  }
  const source = qrForm.value.image
  if (!source) {
    message.warning('请选择或填写二维码图片。')
    return
  }
  const payload: any = {
    id: qrForm.value.id || undefined,
    name: qrForm.value.name.trim(),
    image: source,
    enabled: qrForm.value.enabled,
    sortOrder: Number(qrForm.value.sortOrder) || 0,
  }
  if (source.startsWith('data:') && source.length > INLINE_IMAGE_LIMIT) {
    qrUploading.value = true
    qrError.value = ''
    try {
      payload.uploadId = await uploadImageChunked(source)
      delete payload.image
    } catch (error) {
      qrError.value = errorText(error)
      message.error(qrError.value)
      return
    } finally {
      qrUploading.value = false
      qrProgress.value = ''
    }
  }
  const saved = await runSponsorAction('sponsor/qr/save', payload, '二维码已保存。')
  if (saved) qrDialog.value = false
}

function chooseQrFileClick() {
  if (!qrUploading.value) qrFileInput.value?.click()
}

async function chooseQrFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  const maxBytes = Math.max(1, Number(settings.value.maxImageSize) || 2) * 1024 * 1024
  if (!ALLOWED_TYPES.includes(file.type) || file.size > maxBytes) {
    qrError.value = `请选择不超过 ${settings.value.maxImageSize || 2}MB 的 PNG、JPEG、GIF、WebP 或 BMP 图片。`
    return
  }
  qrUploading.value = true
  qrError.value = ''
  try {
    qrForm.value.image = await readFileAsDataUrl(file)
  } catch (error) {
    qrError.value = errorText(error)
  } finally {
    qrUploading.value = false
  }
}

async function toggleSponsor(row: SponsorView) {
  await runSponsorAction('sponsor/toggle', { id: row.id, enabled: !row.enabled }, '记录状态已更新。')
}

async function toggleQr(row: SponsorQrView) {
  await runSponsorAction('sponsor/qr/toggle', { id: row.id, enabled: !row.enabled }, '二维码状态已更新。')
}

async function confirmDeleteSponsor(row: SponsorView) {
  try {
    await messageBox.confirm(`确定删除赞助记录 #${row.id} 吗？删除后无法恢复。`, '删除赞助记录', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await runSponsorAction('sponsor/delete', row.id, '赞助记录已删除。')
}

async function confirmDeleteQr(row: SponsorQrView) {
  try {
    await messageBox.confirm(`确定删除二维码“${row.name}”吗？删除后无法恢复。`, '删除二维码', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
  } catch {
    return
  }
  await runSponsorAction('sponsor/qr/delete', row.id, '二维码已删除。')
}

watch(autoRefresh, startRefresh)

onMounted(() => {
  keyHandler = event => {
    if (event.key === 'Escape') {
      sponsorDialog.value = false
      qrDialog.value = false
    }
  }
  window.addEventListener('keydown', keyHandler)
  load()
  startRefresh()
})

onUnmounted(() => {
  disposed = true
  loadVersion += 1
  if (keyHandler) window.removeEventListener('keydown', keyHandler)
  stopRefresh()
})
</script>
<style scoped>
.an-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.an-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}

.an-hero-text h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--k-text-dark);
}

.an-hero-text p {
  margin: 0.4rem 0 0;
  max-width: 46rem;
  color: var(--k-text-normal);
  font-size: 0.875rem;
  line-height: 1.6;
}

.an-hero-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.an-switch {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: var(--k-text-normal);
  font-size: 0.8125rem;
  cursor: pointer;
}

.an-btn-text {
  margin-left: 0.25rem;
}

.an-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(136px, 1fr));
  gap: 0.75rem;
}

.an-stat {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.85rem 0.95rem 0.75rem;
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  background: var(--k-card-bg);
  text-align: left;
  cursor: pointer;
  transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
}

.an-stat:hover {
  transform: translateY(-2px);
  box-shadow: var(--k-card-shadow);
}

.an-stat.is-active {
  border-color: var(--k-color-primary);
  box-shadow: 0 0 0 1px var(--k-color-primary) inset;
}

.an-stat-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.an-stat-label {
  color: var(--k-text-normal);
  font-size: 0.8125rem;
}

.an-stat-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--k-text-light);
}

.an-stat.is-all .an-stat-dot { background: var(--k-color-info); }
.an-stat.is-done .an-stat-dot { background: var(--k-color-success); }
.an-stat.is-partial .an-stat-dot { background: var(--k-color-warning); }
.an-stat.is-failed .an-stat-dot { background: var(--k-color-danger); }

.an-stat-value {
  font-size: 1.5rem;
  font-weight: 600;
  line-height: 1.1;
  color: var(--k-text-dark);
}

.an-stat-track {
  display: block;
  height: 3px;
  border-radius: 999px;
  background: var(--k-activity-bg);
  overflow: hidden;
}

.an-stat-fill {
  display: block;
  height: 100%;
  border-radius: 999px;
  transform-origin: left center;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  background: var(--k-color-info);
}

.an-stat.is-done .an-stat-fill { background: var(--k-color-success); }
.an-stat.is-partial .an-stat-fill { background: var(--k-color-warning); }
.an-stat.is-failed .an-stat-fill { background: var(--k-color-danger); }

.an-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.an-search {
  flex: 1 1 20rem;
  min-width: 12rem;
}

.an-select {
  width: 12rem;
}

.an-select.is-small {
  width: 9rem;
}

.an-option-empty {
  margin: 0;
  padding: 0.85rem 0;
  text-align: center;
  color: var(--k-text-normal);
  font-size: 0.8125rem;
}

.an-panel {
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  background: var(--k-card-bg);
  overflow: hidden;
}

.an-table {
  width: 100%;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: var(--k-activity-bg);
  --el-table-header-text-color: var(--k-text-normal);
  --el-table-text-color: var(--k-text-dark);
  --el-table-border-color: var(--k-color-divider);
  --el-table-row-hover-bg-color: var(--k-hover-bg);
}

:deep(.an-table .el-table__row) {
  cursor: pointer;
  transition: background-color 0.15s ease;
}

:deep(.an-table th.el-table__cell) {
  font-weight: 500;
}

.an-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-weight: 600;
  color: var(--k-text-dark);
}

.an-tag {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.5rem;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.75rem;
  line-height: 1.5;
  white-space: nowrap;
  background: var(--k-activity-bg);
  color: var(--k-text-normal);
}

.an-tag.is-sending { background: var(--k-color-primary-fade); border-color: var(--k-color-primary); }
.an-tag.is-done { background: var(--k-color-success-fade); border-color: var(--k-color-success); }
.an-tag.is-partial { background: var(--k-color-warning-fade); border-color: var(--k-color-warning); }
.an-tag.is-failed { background: var(--k-color-danger-fade); border-color: var(--k-color-danger); }

.an-target {
  color: var(--k-text-normal);
}

.an-cell-title {
  margin: 0;
  color: var(--k-text-dark);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.an-cell-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.2rem 0 0;
  color: var(--k-text-normal);
  font-size: 0.75rem;
}

.an-result {
  display: flex;
  gap: 0.55rem;
  margin: 0;
  font-size: 0.8125rem;
}

.is-success {
  color: var(--k-color-success);
}

.is-fail {
  color: var(--k-color-danger);
}

.an-detail-btn :deep(svg) {
  width: 12px;
  height: 12px;
  margin-left: 0.15rem;
}

.an-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 2.25rem 1rem;
  color: var(--k-text-normal);
}

.an-empty :deep(svg) {
  width: 34px;
  height: 34px;
  opacity: 0.55;
}

.an-empty-title {
  margin: 0.35rem 0 0;
  color: var(--k-text-normal);
}

.an-empty-desc {
  margin: 0;
  font-size: 0.8125rem;
}

.an-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.65rem 0.9rem;
  border-top: 1px solid var(--k-color-divider);
  flex-wrap: wrap;
}

.an-total {
  color: var(--k-text-normal);
  font-size: 0.8125rem;
}

.an-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.an-detail-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0 0 0.85rem;
  border-bottom: 1px solid var(--k-color-divider);
}

.an-detail-title {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-size: 1rem;
}

.an-detail-tools {
  display: flex;
  align-items: center;
  gap: 0.15rem;
}

.an-detail-tools :deep(svg) {
  width: 15px;
  height: 15px;
}

.an-detail-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.35rem;
}

.an-detail-sub {
  margin: 0;
  color: var(--k-text-normal);
  font-size: 0.8125rem;
}

.an-meta {
  display: grid;
  gap: 0.5rem;
  margin: 0;
}

.an-meta > div {
  display: flex;
  gap: 0.6rem;
  font-size: 0.8125rem;
  line-height: 1.5;
}

.an-meta dt {
  flex: 0 0 4.5rem;
  color: var(--k-text-normal);
}

.an-meta dd {
  margin: 0;
  color: var(--k-text-dark);
  word-break: break-word;
}

.an-block h3 {
  margin: 0 0 0.6rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--k-text-dark);
}

.an-content {
  margin: 0;
  color: var(--k-text-dark);
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.an-images {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.7rem;
}

.an-image {
  width: 96px;
  height: 96px;
  border-radius: 8px;
  border: 1px solid var(--k-color-divider);
  overflow: hidden;
  transition: transform 0.18s ease;
}

.an-image:hover {
  transform: scale(1.02);
}

.an-result-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.an-result-grid > div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.7rem;
  border-radius: 8px;
  background: var(--k-activity-bg);
}

.an-result-grid span {
  color: var(--k-text-normal);
  font-size: 0.75rem;
}

.an-result-grid strong {
  color: var(--k-text-dark);
  font-size: 1.1rem;
}

.an-note {
  margin: 0.75rem 0 0;
  color: var(--k-color-danger);
  font-size: 0.8125rem;
  line-height: 1.6;
}

.an-detail-foot {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.85rem 0 0;
  border-top: 1px solid var(--k-color-divider);
}

.an-form-target {
  width: 12rem;
}

.an-preflight {
  margin-left: 0.75rem;
  color: var(--k-text-normal);
  font-size: 0.8125rem;
}

.an-upload-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.an-upload-row :deep(.el-input) {
  flex: 1 1 12rem;
  min-width: 10rem;
}

.an-upload-hint {
  color: var(--k-text-normal);
  font-size: 0.8125rem;
}

.an-attach {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  width: 100%;
}

.an-attach .an-images {
  margin-top: 0;
}

.an-image-wrap {
  position: relative;
}

.an-image-remove {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.an-image-remove :deep(svg) {
  width: 11px;
  height: 11px;
}

.an-image-wrap:hover .an-image-remove,
.an-image-remove:focus-visible {
  opacity: 1;
}

.an-image-remove:hover {
  transform: scale(1.08);
}

.an-image-remove:focus-visible {
  outline: 2px solid var(--k-color-primary);
  outline-offset: 1px;
}

.an-preflight.is-loading {
  animation: an-pulse 1.2s ease-in-out infinite;
}

@keyframes an-pulse {
  50% { opacity: 0.45; }
}

@media (max-width: 900px) {
  .an-hero {
    flex-direction: column;
  }

  .an-hero-actions {
    width: 100%;
    flex-wrap: wrap;
  }

  .an-result-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .an-select,
  .an-select.is-small {
    width: calc(50% - 0.4rem);
  }

  .an-search {
    flex-basis: 100%;
  }

  .an-reset {
    flex: 1;
  }

  .an-detail-foot {
    flex-direction: column-reverse;
  }

  .an-detail-foot .el-button {
    width: 100%;
    margin-left: 0;
  }

  .an-preflight {
    display: block;
    margin: 0.35rem 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .an-stat,
  .an-stat-fill,
  .an-image,
  .an-image-remove {
    transition: none;
  }

  .an-image:hover,
  .an-image-remove:hover {
    transform: none;
  }

  .an-preflight.is-loading {
    animation: none;
  }
}

.an-tabs {
  display: inline-flex;
  align-self: flex-start;
  gap: 0.25rem;
  padding: 0.25rem;
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  background: var(--k-activity-bg);
}

.an-tab {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 2.25rem;
  padding: 0.45rem 0.8rem;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: var(--k-text-normal);
  font: inherit;
  font-size: 0.84rem;
  cursor: pointer;
}

.an-tab.is-active {
  background: var(--k-card-bg);
  box-shadow: 0 2px 7px rgba(20, 32, 51, 0.1);
  color: var(--k-color-primary);
}

.an-panel > .an-toolbar {
  padding: 0.75rem 0.9rem;
}

.an-qr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 0.9rem;
  padding: 0 0.9rem 0.9rem;
}

.an-qr-card {
  display: grid;
  grid-template-columns: 96px minmax(8rem, 1fr) auto;
  gap: 0.75rem;
  align-items: center;
  min-width: 0;
  padding: 0.9rem;
  border: 1px solid var(--k-color-border);
  border-radius: 8px;
  background: var(--k-card-bg);
}

.an-qr-card.is-disabled {
  opacity: 0.64;
}

.an-qr-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border: 1px solid var(--k-color-border);
  border-radius: 7px;
  background: #fff;
  overflow: hidden;
}

.an-qr-preview .el-image,
.an-qr-image-preview .el-image {
  width: 100%;
  height: 100%;
}

.an-qr-info {
  min-width: 8rem;
  width: 100%;
}

.an-qr-head,
.an-qr-state {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.an-qr-head {
  align-items: baseline;
  flex-direction: row;
  gap: 0.5rem;
}

.an-qr-head strong {
  min-width: 0;
  overflow: hidden;
  line-height: 1.45;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.an-qr-state {
  margin-top: 0.8rem;
}

.an-qr-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
  white-space: nowrap;
}

.an-toolbar-label {
  flex: 1 1 auto;
  min-width: 0;
  margin-right: auto;
  color: var(--k-text-normal);
  font-size: 0.84rem;
  line-height: 1.5;
  white-space: normal;
}

.an-image-field :deep(.el-form-item__content) {
  display: block;
}

.an-qr-upload {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  flex-wrap: wrap;
  min-height: 2.5rem;
  margin-bottom: 0.75rem;
}

.an-upload-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  min-height: 2.5rem;
  padding: 0.5rem 0.9rem;
  border: 1px solid var(--k-color-primary);
  border-radius: 6px;
  background: var(--k-color-primary);
  color: #fff;
  font: inherit;
  font-size: 0.82rem;
  cursor: pointer;
}

.an-upload-button.is-disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.an-file-input {
  display: none;
}

.an-qr-hint {
  color: var(--k-text-light);
  font-size: 0.75rem;
}

.an-qr-hint.is-error {
  color: var(--k-color-danger);
}

.an-qr-image-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 9rem;
  height: 9rem;
  margin: 0 0 0.75rem;
  border: 1px solid var(--k-color-border);
  border-radius: 7px;
  background: #fff;
  overflow: hidden;
}

.an-image-field .el-input {
  width: 100%;
}

@media (max-width: 900px) {
  .an-qr-card {
    grid-template-columns: 80px minmax(0, 1fr) auto;
  }

  .an-qr-preview {
    width: 80px;
    height: 80px;
  }
}

@media (max-width: 640px) {
  .an-qr-card {
    grid-template-columns: 72px minmax(0, 1fr);
  }

  .an-qr-preview {
    width: 72px;
    height: 72px;
  }

  .an-qr-actions {
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: flex-end;
    border-top: 1px solid var(--k-color-border);
    padding-top: 0.55rem;
  }

  .an-qr-image-preview {
    width: 7rem;
    height: 7rem;
  }
}
</style>
