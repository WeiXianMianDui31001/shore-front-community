<template>
  <div class="re-page">
    <header class="re-toolbar card">
      <div class="re-toolbar-row">
        <router-link to="/resume/templates" class="btn btn-ghost btn-sm">← 模板库</router-link>
        <router-link v-if="resumeId" to="/resume/my" class="btn btn-ghost btn-sm">我的简历</router-link>
        <div class="re-title-wrap field">
          <label>简历标题</label>
          <input v-model="title" class="input" type="text" placeholder="未命名简历" />
        </div>
        <div class="re-toolbar-actions">
          <button type="button" class="btn btn-secondary" @click="drawerOpen = !drawerOpen">
            {{ drawerOpen ? '收起侧栏' : '打开编辑侧栏' }}
          </button>
          <button type="button" class="btn btn-primary" :disabled="busy || !templateId" @click="save">
            {{ busy ? '保存中…' : '保存' }}
          </button>
          <button type="button" class="btn btn-secondary" :disabled="exportBusy || !resumeId" @click="exportPdf">
            {{ exportBusy ? '导出中…' : '导出 PDF' }}
          </button>
        </div>
      </div>
      <p v-if="hint" class="re-hint">{{ hint }}</p>
      <p v-if="err" class="re-err">{{ err }}</p>
    </header>

    <div v-if="pageLoading" class="loading page-loading">加载中…</div>

    <div v-else-if="pageErr" class="page-container">
      <p class="re-err">{{ pageErr }}</p>
    </div>

    <div v-else class="re-body">
      <main class="re-preview">
        <div class="re-paper-desk">
          <div class="re-paper-desk-scroll">
            <p v-if="previewLoading" class="re-preview-status">正在渲染预览…</p>
            <p v-else-if="previewErr" class="re-err">{{ previewErr }}</p>
            <iframe
              v-if="previewBlobUrl"
              ref="previewFrame"
              class="re-preview-frame"
              title="resume-preview"
              :src="previewBlobUrl"
              @load="onPreviewFrameLoad"
            />
          </div>
        </div>
        <div v-if="pdfViewUrl" class="re-pdf-block card">
          <h4>本次导出 PDF</h4>
          <iframe class="re-pdf-frame" title="pdf" :src="pdfViewUrl" />
          <a class="btn btn-sm btn-secondary" :href="pdfViewUrl" target="_blank" rel="noopener">新窗口打开</a>
        </div>
      </main>

      <aside class="re-drawer card" :class="{ collapsed: !drawerOpen }">
        <div class="re-drawer-head">
          <h3>字段编辑</h3>
          <p class="re-drawer-desc">与左侧整页预览联动，修改后约 0.5s 刷新</p>
        </div>

        <div v-for="d in defs" :key="d.key" class="re-section">
          <h4 class="re-section-title">{{ d.title }}</h4>
          <template v-if="sectionFor(d.key)">
            <div
              v-for="(item, itemIdx) in sectionFor(d.key).items"
              :key="itemIdx"
              class="re-item"
            >
              <div v-if="d.key !== 'basic' && sectionFor(d.key).items.length > 1" class="re-item-head">
                <span>第 {{ itemIdx + 1 }} 条</span>
                <button
                  v-if="canRemoveRow(d.key)"
                  type="button"
                  class="btn btn-sm btn-danger"
                  @click="removeItem(d.key, itemIdx)"
                >
                  删除
                </button>
              </div>
              <div v-for="f in d.fields || []" :key="f" class="field">
                <label>{{ f }}</label>
                <p v-if="isPhotoField(f)" class="re-mini-hint">可本地上传或粘贴图片 HTTPS 链接</p>
                <label v-if="isPhotoField(f)" class="btn btn-secondary btn-sm re-file-btn">
                  <input
                    type="file"
                    class="re-file-input"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    :disabled="photoBusyKey === `${d.key}-${itemIdx}-${f}`"
                    @change="onPhotoFile(d.key, itemIdx, f, $event)"
                  />
                  {{ photoBusyKey === `${d.key}-${itemIdx}-${f}` ? '上传中…' : '本地上传' }}
                </label>
                <textarea
                  class="input"
                  :rows="isLongField(f) ? 3 : isPhotoField(f) ? 2 : 1"
                  :value="item[f] ?? ''"
                  @input="onField(d.key, itemIdx, f, $event.target.value)"
                />
              </div>
            </div>
            <button
              v-if="d.key !== 'basic'"
              type="button"
              class="btn btn-secondary btn-sm re-add"
              @click="addItem(d.key)"
            >
              + 添加一条
            </button>
          </template>
        </div>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  fetchTemplateDetail,
  fetchResumeDetail,
  createResume,
  updateResume,
  previewResumeHtml,
  startResumeExport,
  getResumeExportStatus,
  uploadResumePhoto,
} from '../api/resume'
import { resolvePdfViewUrl } from '../utils/pdfExportUrl'
import { parseDigitsQuery } from '../utils/numericQuery'
import {
  parseStructureJson,
  buildEmptyContentRoot,
  parseContentJson,
  alignSectionsWithDefs,
  stringifyContent,
} from '../utils/resumeContent'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const defs = ref([])
const sections = ref([])
const title = ref('')
const resumeId = ref(null)
const templateId = ref(null)

const pageLoading = ref(true)
const pageErr = ref('')
const busy = ref(false)
const exportBusy = ref(false)
const err = ref('')
const hint = ref('')

const drawerOpen = ref(true)

const previewBlobUrl = ref(null)
const previewLoading = ref(false)
const previewErr = ref('')
const previewFrame = ref(null)
const pdfUrl = ref(null)
const pdfViewUrl = computed(() => resolvePdfViewUrl(pdfUrl.value))

const photoBusyKey = ref('')

const contentRoot = computed(() => ({ sections: sections.value }))

function injectPreviewScreenStyles(html) {
  const snippet = `<style data-shore-preview="1">
    html {
      min-height: 100%;
      background: #f8fafc !important;
      box-sizing: border-box;
      padding: 28px 18px 72px;
      overflow: hidden !important;
    }
    body.pdf-resume {
      width: min(100%, 210mm) !important;
      max-width: 100% !important;
      margin: 0 auto !important;
      padding: 11mm 13mm !important;
      min-height: 297mm;
      height: auto;
      background: #fff !important;
      box-sizing: border-box;
      overflow-x: hidden !important;
      box-shadow:
        0 0 0 1px rgba(15, 23, 42, 0.05),
        0 6px 24px rgba(15, 23, 42, 0.06);
      border-radius: 6px;
    }
  </style>
  <meta name="viewport" content="width=device-width, initial-scale=1" />`
  if (html.includes('</head>')) {
    return html.replace('</head>', `${snippet}</head>`)
  }
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"/>${snippet}</head><body class="pdf-resume">${html}</body></html>`
}

let previewDebounce = null

function revokePreview() {
  if (previewBlobUrl.value) {
    URL.revokeObjectURL(previewBlobUrl.value)
    previewBlobUrl.value = null
  }
}

async function runPreview() {
  if (!templateId.value || pageLoading.value) return
  previewLoading.value = true
  previewErr.value = ''
  try {
    const html = await previewResumeHtml(templateId.value, stringifyContent(contentRoot.value))
    revokePreview()
    const wrapped = injectPreviewScreenStyles(html)
    previewBlobUrl.value = URL.createObjectURL(new Blob([wrapped], { type: 'text/html;charset=utf-8' }))
  } catch (e) {
    previewErr.value = e?.message || '预览失败'
    revokePreview()
  } finally {
    previewLoading.value = false
  }
}

function schedulePreview() {
  if (!templateId.value || pageLoading.value) return
  if (previewDebounce) clearTimeout(previewDebounce)
  previewDebounce = setTimeout(() => void runPreview(), 450)
}

watch(sections, schedulePreview, { deep: true })
watch(title, schedulePreview)
watch(
  () => pageLoading.value,
  (v) => {
    if (!v && templateId.value) schedulePreview()
  }
)

onUnmounted(() => {
  if (previewDebounce) clearTimeout(previewDebounce)
  revokePreview()
})

function onPreviewFrameLoad() {
  const el = previewFrame.value
  if (!el) return
  try {
    const doc = el.contentDocument
    const h = Math.max(doc?.documentElement?.scrollHeight ?? 0, doc?.body?.scrollHeight ?? 0)
    if (h > 0) {
      el.style.height = `${Math.min(Math.max(h + 8, 400), 4800)}px`
    }
  } catch {
    /* ignore */
  }
}

function sectionFor(key) {
  return sections.value.find((s) => s.key === key)
}

function defByKey(key) {
  return defs.value.find((d) => d.key === key)
}

function emptyRow(fields) {
  const r = {}
  for (const f of fields || []) r[f] = ''
  return r
}

function onField(key, itemIdx, field, value) {
  const sec = sections.value.find((s) => s.key === key)
  if (!sec?.items[itemIdx]) return
  sec.items[itemIdx][field] = value
}

function addItem(key) {
  const d = defByKey(key)
  if (!d || d.key === 'basic') return
  const sec = sections.value.find((s) => s.key === key)
  if (!sec) return
  sec.items.push(emptyRow(d.fields))
}

function canRemoveRow(key) {
  const sec = sections.value.find((s) => s.key === key)
  return sec && sec.items.length > 1
}

function removeItem(key, itemIdx) {
  const sec = sections.value.find((s) => s.key === key)
  if (!sec || sec.items.length <= 1) return
  sec.items.splice(itemIdx, 1)
}

function isPhotoField(f) {
  return f === '证件照' || f === '照片'
}

function isLongField(f) {
  return f.includes('描述') || f.includes('要点')
}

async function onPhotoFile(sectionKey, itemIdx, field, ev) {
  const input = ev.target
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!userStore.isLoggedIn) {
    err.value = '上传图片需先登录'
    return
  }
  const key = `${sectionKey}-${itemIdx}-${field}`
  photoBusyKey.value = key
  err.value = ''
  try {
    const r = await uploadResumePhoto(file)
    onField(sectionKey, itemIdx, field, r.absoluteUrl || r.url)
  } catch (e) {
    err.value = e?.message || '上传失败'
  } finally {
    if (photoBusyKey.value === key) photoBusyKey.value = ''
  }
}

async function save() {
  if (!templateId.value) return
  if (!userStore.isLoggedIn) {
    err.value = '请先登录'
    router.push({ path: '/login', query: { redirect: route.fullPath } })
    return
  }
  busy.value = true
  err.value = ''
  hint.value = ''
  try {
    const body = {
      title: title.value.trim() || '未命名简历',
      templateId: templateId.value,
      contentJson: stringifyContent(contentRoot.value),
    }
    if (resumeId.value) {
      await updateResume(resumeId.value, body)
      hint.value = '已保存'
    } else {
      const r = await createResume(body)
      resumeId.value = r.resumeId != null ? String(r.resumeId) : null
      hint.value = '已创建'
      router.replace({
        path: '/resume/edit',
        query: { resumeId: String(r.resumeId), templateId: String(templateId.value) },
      })
    }
  } catch (e) {
    err.value = e?.message || '保存失败'
  } finally {
    busy.value = false
  }
}

async function exportPdf() {
  if (!resumeId.value) {
    err.value = '请先保存简历后再导出'
    return
  }
  exportBusy.value = true
  pdfUrl.value = null
  err.value = ''
  hint.value = ''
  try {
    const started = await startResumeExport(resumeId.value)
    const max = 40
    for (let i = 0; i < max; i++) {
      const st = await getResumeExportStatus(resumeId.value, started.exportId)
      if (st.status === 'SUCCESS' && st.pdfUrl) {
        pdfUrl.value = st.pdfUrl
        hint.value = '导出成功'
        break
      }
      if (st.status === 'FAILED') {
        throw new Error('PDF 生成失败')
      }
      await new Promise((r) => setTimeout(r, 600))
    }
    if (!pdfUrl.value) hint.value = '导出超时，请稍后在「我的简历」中重试'
  } catch (e) {
    err.value = e?.message || '导出失败'
  } finally {
    exportBusy.value = false
  }
}

onMounted(async () => {
  pageLoading.value = true
  pageErr.value = ''
  const rid = parseDigitsQuery(route.query.resumeId)
  const tidStr = parseDigitsQuery(route.query.templateId)
  const tid = tidStr != null ? Number(tidStr) : NaN

  try {
    if (!rid && !Number.isFinite(tid)) {
      pageErr.value = '请从「简历模板」选择模板，或从「我的简历」进入编辑。'
      return
    }

    if (rid) {
      const detail = await fetchResumeDetail(rid)
      resumeId.value = detail.id != null ? String(detail.id) : null
      templateId.value = detail.templateId != null ? Number(detail.templateId) : null
      title.value = detail.title || ''
      const tmpl = await fetchTemplateDetail(detail.templateId)
      defs.value = parseStructureJson(tmpl.structureJson)
      const parsed = parseContentJson(detail.contentJson)
      if (parsed?.sections?.length) {
        sections.value = alignSectionsWithDefs(defs.value, parsed.sections)
      } else {
        sections.value = buildEmptyContentRoot(defs.value).sections
      }
    } else {
      templateId.value = tid
      const tmpl = await fetchTemplateDetail(tid)
      defs.value = parseStructureJson(tmpl.structureJson)
      title.value = `我的简历 — ${tmpl.name}`
      sections.value = buildEmptyContentRoot(defs.value).sections
    }
  } catch (e) {
    pageErr.value = e?.message || '加载失败'
  } finally {
    pageLoading.value = false
  }
})
</script>

<style scoped>
.re-page {
  min-height: calc(100vh - 32px);
  padding: var(--space-4) var(--space-5) var(--space-8);
  max-width: 100%;
}

.re-toolbar {
  margin-bottom: var(--space-4);
  padding: var(--space-4) var(--space-5);
}

.re-toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: var(--space-3);
}

.re-title-wrap {
  flex: 1;
  min-width: 200px;
  margin-bottom: 0;
}

.re-toolbar-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.re-hint {
  margin: var(--space-3) 0 0;
  font-size: 13px;
  color: var(--success);
}

.re-err {
  margin: var(--space-2) 0 0;
  font-size: 13px;
  color: var(--danger-text);
}

.page-loading {
  padding: var(--space-8);
}

.re-body {
  display: flex;
  align-items: stretch;
  gap: var(--space-4);
  min-height: 520px;
}

.re-preview {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.re-paper-desk {
  border-radius: var(--radius-lg);
  background: var(--bg);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  min-width: 0;
}

.re-paper-desk-scroll {
  overflow-y: auto;
  overflow-x: hidden;
  max-height: min(82vh, 920px);
  min-height: 360px;
  padding: var(--space-6) var(--space-5) var(--space-8);
  /* 隐藏滚动条但保留滚轮/触控板滚动（Windows 上 thin 仍会显示粗条） */
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.re-paper-desk-scroll::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.re-preview-status {
  margin: var(--space-3);
  font-size: 14px;
  color: var(--text-secondary);
}

.re-preview-frame {
  display: block;
  width: 100%;
  max-width: 100%;
  min-height: 420px;
  border: none;
  background: transparent;
  overflow: hidden;
  vertical-align: top;
}

.re-pdf-block {
  padding: var(--space-4);
}
.re-pdf-block h4 {
  margin: 0 0 var(--space-2);
  font-size: 15px;
}
.re-pdf-frame {
  width: 100%;
  height: 480px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
}

.re-drawer {
  width: 400px;
  flex-shrink: 0;
  padding: var(--space-4) var(--space-5);
  max-height: min(88vh, 960px);
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  transition: width 0.22s ease, margin 0.22s ease, opacity 0.2s ease, padding 0.22s ease;
  border: 1px solid var(--border);
}

.re-drawer::-webkit-scrollbar {
  display: none;
  width: 0;
  height: 0;
}

.re-drawer.collapsed {
  width: 0;
  padding-left: 0;
  padding-right: 0;
  opacity: 0;
  overflow: hidden;
  border: none;
  pointer-events: none;
}

.re-drawer-head {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border);
}

.re-drawer-head h3 {
  margin: 0 0 var(--space-1);
  font-size: 16px;
  font-weight: 700;
  color: var(--text);
}

.re-drawer-desc {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
  line-height: 1.4;
}

.re-section {
  margin-bottom: var(--space-5);
}

.re-section-title {
  margin: 0 0 var(--space-3);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
}

.re-item {
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px dashed var(--border);
}

.re-item:last-of-type {
  border-bottom: none;
}

.re-item-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
  font-size: 13px;
  color: var(--text-muted);
}

.re-mini-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin: 0 0 var(--space-1);
}

.re-file-btn {
  position: relative;
  display: inline-block !important;
  margin-bottom: var(--space-2);
  cursor: pointer;
  overflow: hidden;
}

.re-file-input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.re-add {
  margin-top: var(--space-1);
}

@media (max-width: 1100px) {
  .re-body {
    flex-direction: column;
  }
  .re-drawer {
    width: 100%;
    margin-left: 0;
    max-height: none;
  }
  .re-drawer.collapsed {
    display: none;
  }
}
</style>
