<template>
  <div class="page-container">
    <div class="page-header">
      <h2>简历模板</h2>
      <p class="page-desc">
        选择模板后在整页预览上编辑内容。下方卡片为模板内置范文经服务端渲染的实时预览（与编辑页导出引擎一致）。
      </p>
    </div>

    <div class="toolbar">
      <div class="segmented">
        <button type="button" :class="{ active: typeFilter === undefined }" @click="typeFilter = undefined; load()">
          全部
        </button>
        <button type="button" :class="{ active: typeFilter === 0 }" @click="typeFilter = 0; load()">考研</button>
        <button type="button" :class="{ active: typeFilter === 1 }" @click="typeFilter = 1; load()">求职</button>
      </div>
      <router-link to="/resume/my" class="btn btn-secondary">我的简历</router-link>
    </div>

    <section class="tpl-showcase" aria-label="模板预览区">
      <div v-if="loading" class="tpl-showcase-inner tpl-showcase-loading">加载中…</div>
      <div v-else-if="err" class="tpl-showcase-inner">
        <p class="tpl-showcase-err">{{ err }}</p>
      </div>
      <template v-else>
        <div class="tpl-showcase-inner">
          <div v-if="list.length" class="tpl-showcase-grid">
            <div v-for="t in list" :key="String(t.id)" class="tpl-showcase-card">
              <router-link
                class="tpl-showcase-card-link"
                :to="{ path: '/resume/edit', query: { templateId: String(t.id) } }"
              >
                <div class="tpl-showcase-thumb">
                  <div
                    v-if="previewState[String(t.id)] === 'ready' && previewBlobs[String(t.id)]"
                    class="tpl-preview-viewport"
                  >
                    <iframe
                      :src="previewBlobs[String(t.id)]"
                      class="tpl-preview-iframe"
                      :title="`预览：${t.name}`"
                      loading="lazy"
                    />
                  </div>
                  <div v-else-if="previewState[String(t.id)] === 'pending'" class="tpl-preview-placeholder">
                    生成预览中…
                  </div>
                  <div v-else class="tpl-preview-fallback">
                    <img class="tpl-preview-fallback-img" :src="svgThumbDataUri(t.name)" alt="" />
                  </div>
                </div>
                <div class="tpl-showcase-foot">
                  <p class="tpl-showcase-name">{{ t.name }}</p>
                </div>
              </router-link>
            </div>
          </div>
          <p v-else class="tpl-showcase-empty">暂无模板</p>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { fetchTemplates, previewResumeHtml } from '../api/resume'
import { parseStructureJson, buildEmptyContentRoot, stringifyContent } from '../utils/resumeContent'

const list = ref([])
const loading = ref(true)
const err = ref('')
const typeFilter = ref(undefined)

/** 'pending' | 'ready' | 'fail' */
const previewState = ref({})
const previewBlobs = ref({})

function escapeXml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function svgThumbDataUri(title) {
  const text = escapeXml((title || '简历模板').slice(0, 14))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="565" viewBox="0 0 400 565">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#e2e8f0"/></linearGradient></defs>
    <rect width="400" height="565" fill="url(#g)"/>
    <rect x="24" y="24" width="352" height="517" rx="6" fill="#fff" stroke="#cbd5e1" stroke-width="1"/>
    <text x="200" y="260" text-anchor="middle" fill="#64748b" font-family="system-ui,sans-serif" font-size="15">预览不可用</text>
    <text x="200" y="300" text-anchor="middle" fill="#64748b" font-family="system-ui,sans-serif" font-size="17">${text}</text>
  </svg>`
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function wrapListPreviewHtml(html) {
  const snippet = `<meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style data-tpl-list-preview="1">
    html { margin: 0; background: #fff; }
    body { margin: 0 !important; }
    body.pdf-resume {
      box-shadow: none !important;
      margin: 0 auto !important;
    }
  </style>`
  if (html.includes('</head>')) {
    return html.replace('</head>', `${snippet}</head>`)
  }
  return `<!DOCTYPE html><html><head>${snippet}</head><body class="pdf-resume">${html}</body></html>`
}

function revokeAllPreviews() {
  for (const url of Object.values(previewBlobs.value)) {
    if (typeof url === 'string' && url.startsWith('blob:')) URL.revokeObjectURL(url)
  }
  previewBlobs.value = {}
  previewState.value = {}
}

async function loadHtmlPreviews() {
  revokeAllPreviews()
  const items = list.value
  if (!items.length) return

  for (const t of items) {
    const id = String(t.id)
    previewState.value = { ...previewState.value, [id]: 'pending' }
  }

  await Promise.all(
    items.map(async (t) => {
      const id = String(t.id)
      try {
        const defs = parseStructureJson(t.structureJson || '[]')
        if (!defs.length) {
          previewState.value = { ...previewState.value, [id]: 'fail' }
          return
        }
        const templateId = typeof t.id === 'string' ? Number(t.id) : t.id
        const contentJson = stringifyContent(buildEmptyContentRoot(defs))
        const html = await previewResumeHtml(templateId, contentJson)
        const wrapped = wrapListPreviewHtml(html)
        const blobUrl = URL.createObjectURL(new Blob([wrapped], { type: 'text/html;charset=utf-8' }))
        previewBlobs.value = { ...previewBlobs.value, [id]: blobUrl }
        previewState.value = { ...previewState.value, [id]: 'ready' }
      } catch {
        previewState.value = { ...previewState.value, [id]: 'fail' }
      }
    }),
  )
}

async function load() {
  loading.value = true
  err.value = ''
  revokeAllPreviews()
  try {
    list.value = await fetchTemplates(typeFilter.value)
  } catch (e) {
    err.value = e?.message || '加载失败'
  } finally {
    loading.value = false
    if (!err.value && list.value.length) {
      void loadHtmlPreviews()
    }
  }
}

onMounted(load)

onUnmounted(() => {
  revokeAllPreviews()
})
</script>

<style scoped>
/* 与整页背景一体，无外框 */
.tpl-showcase {
  margin-top: var(--space-4);
}

.tpl-showcase-inner {
  padding: var(--space-2) 0 var(--space-6);
  min-height: 280px;
}

.tpl-showcase-loading,
.tpl-showcase-err,
.tpl-showcase-empty {
  margin: 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 15px;
}

.tpl-showcase-err {
  color: var(--danger-text);
}

.tpl-showcase-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-5);
  max-width: 1100px;
  margin: 0 auto;
  padding: 0;
}

@media (max-width: 900px) {
  .tpl-showcase-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .tpl-showcase-grid {
    grid-template-columns: 1fr;
  }
}

.tpl-showcase-card {
  border-radius: var(--radius-md);
  background: var(--surface);
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.tpl-showcase-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 14px rgba(15, 23, 42, 0.1);
}

.tpl-showcase-card-link {
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.tpl-showcase-thumb {
  position: relative;
  aspect-ratio: 210 / 297;
  background: #fff;
  container-type: size;
  container-name: tpl-thumb;
}

.tpl-preview-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.tpl-preview-iframe {
  position: absolute;
  left: 50%;
  top: 0;
  width: 820px;
  height: 1160px;
  border: 0;
  /* 旧浏览器回退：略放大；支持容器查询时按 cover 铺满 */
  transform: translateX(-50%) scale(0.32);
  transform-origin: top center;
  background: #fff;
}

@container tpl-thumb (min-width: 0px) {
  .tpl-preview-iframe {
    transform: translateX(-50%) scale(max(calc(100cqi / 820), calc(100cqb / 1160)));
  }
}

.tpl-preview-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--text-muted);
}

.tpl-preview-fallback {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tpl-preview-fallback-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tpl-showcase-foot {
  padding: var(--space-2) var(--space-3);
  background: var(--surface);
  border-top: 1px solid var(--border);
}

.tpl-showcase-name {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
  line-height: 1.4;
  text-align: center;
}
</style>
