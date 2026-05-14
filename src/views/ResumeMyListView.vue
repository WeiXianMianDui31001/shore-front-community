<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的简历</h2>
      <p class="page-desc">在已保存的简历上继续修改，或从模板新建</p>
    </div>

    <div class="toolbar">
      <router-link to="/resume/templates" class="btn btn-primary">+ 从模板新建</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <template v-else>
      <p v-if="err" class="err">{{ err }}</p>
      <p v-if="actionErr" class="err">{{ actionErr }}</p>
      <p v-if="actionHint" class="action-hint">{{ actionHint }}</p>

      <div v-if="rows.length" class="data-table">
        <div class="table-header resume-grid">
          <span>标题</span>
          <span>模板</span>
          <span>更新时间</span>
          <span class="resume-actions-head">操作</span>
        </div>
        <div v-for="r in rows" :key="String(r.id)" class="table-row resume-grid">
          <span class="t-title">{{ r.title || '未命名' }}</span>
          <span class="t-muted">{{ r.templateName || '—' }}</span>
          <span class="t-muted">{{ formatTime(r.updatedAt) }}</span>
          <span class="resume-actions">
            <router-link
              class="btn btn-sm btn-secondary"
              :to="editQuery(r)"
            >
              编辑
            </router-link>
            <button
              type="button"
              class="btn btn-sm btn-primary"
              :disabled="exportBusyId != null"
              @click="exportRow(r)"
            >
              {{ exportBusyId === String(r.id) ? '导出中…' : '导出 PDF' }}
            </button>
          </span>
        </div>
      </div>

      <div v-else class="empty">暂无简历，先去模板库创建一份吧</div>
    </template>

    <div v-if="totalPages > 1" class="pagination">
      <button type="button" :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button type="button" :disabled="page >= totalPages" @click="page++; load()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { fetchMyResumes, startResumeExport, getResumeExportStatus } from '../api/resume'
import { resolvePdfViewUrl } from '../utils/pdfExportUrl'

const rows = ref([])
const loading = ref(true)
const err = ref('')
const actionErr = ref('')
const actionHint = ref('')
const exportBusyId = ref(null)
const page = ref(1)
const size = ref(20)
const total = ref(0)

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / size.value)))

function formatTime(t) {
  if (!t) return '—'
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function editQuery(r) {
  const q = { resumeId: String(r.id) }
  if (r.templateId != null && String(r.templateId).trim() !== '') q.templateId = String(r.templateId)
  return { path: '/resume/edit', query: q }
}

async function exportRow(r) {
  const id = r?.id != null ? String(r.id) : ''
  if (!id) return
  actionErr.value = ''
  actionHint.value = ''
  exportBusyId.value = id
  try {
    const started = await startResumeExport(id)
    const eid = started.exportId != null ? String(started.exportId) : ''
    if (!eid) throw new Error('未返回导出任务 id')
    for (let i = 0; i < 40; i++) {
      const st = await getResumeExportStatus(id, eid)
      if (st.status === 'SUCCESS' && st.pdfUrl) {
        const url = resolvePdfViewUrl(st.pdfUrl)
        if (url) window.open(url, '_blank', 'noopener,noreferrer')
        actionHint.value = '已在浏览器新标签打开 PDF；若无反应请检查弹窗拦截。'
        break
      }
      if (st.status === 'FAILED') throw new Error('PDF 生成失败')
      await new Promise((resolve) => setTimeout(resolve, 600))
    }
    if (!actionHint.value) actionHint.value = '导出超时，请进入编辑页重试或稍后再试。'
  } catch (e) {
    actionErr.value = e?.message || '导出失败'
  } finally {
    exportBusyId.value = null
  }
}

async function load() {
  loading.value = true
  err.value = ''
  try {
    const data = await fetchMyResumes(page.value, size.value)
    rows.value = data.records || data.list || []
    total.value = data.total ?? rows.value.length
  } catch (e) {
    err.value = e?.message || '加载失败'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<style scoped>
.resume-grid {
  grid-template-columns: 1.4fr 1fr 140px minmax(200px, auto);
}
.resume-actions-head {
  text-align: right;
  font-size: 13px;
  color: var(--text-muted);
}
.resume-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-2);
}
.action-hint {
  margin: var(--space-2) 0 0;
  font-size: 13px;
  color: var(--success);
}
.t-title {
  font-weight: 500;
  color: var(--text);
}
.t-muted {
  color: var(--text-muted);
  font-size: 13px;
}
.err {
  color: var(--danger-text);
}
</style>
