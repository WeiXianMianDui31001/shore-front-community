<template>
  <div class="page-container resource-detail-page">
    <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-4)" @click="router.back()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><polyline points="15 18 9 12 15 6"/></svg> 返回
    </button>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="resource" class="card" style="overflow:hidden">
      <div class="detail-header">
        <span class="badge badge-info">{{ resource.category }}</span>
        <h1 class="detail-title">{{ resource.title }}</h1>
        <div class="detail-meta">
          <div class="meta-item">
            <span class="meta-label">上传者</span>
            <span class="meta-value">{{ resource.uploaderNickname || '用户' + resource.uploaderId }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="meta-label">上传时间</span>
            <span class="meta-value">{{ formatTime(resource.createdAt) }}</span>
          </div>
          <div class="meta-divider"></div>
          <div class="meta-item">
            <span class="status-dot" :class="statusClass(resource.status)"></span>
            <span class="meta-value">{{ statusText(resource.status) }}</span>
          </div>
        </div>
      </div>

      <div class="detail-body">
        <div class="info-block">
          <h3 class="block-title">资源简介</h3>
          <p class="description">{{ resource.description || '暂无简介' }}</p>
        </div>

        <div class="info-block">
          <h3 class="block-title">文件信息</h3>
          <div class="info-grid">
            <div class="info-cell">
              <span class="cell-label">文件名</span>
              <span class="cell-value">{{ resource.fileName }}</span>
            </div>
            <div class="info-cell">
              <span class="cell-label">文件大小</span>
              <span class="cell-value">{{ formatFileSize(resource.fileSize) }}</span>
            </div>
            <div class="info-cell">
              <span class="cell-label">下载次数</span>
              <span class="cell-value">{{ resource.downloadCount || 0 }} 次</span>
            </div>
            <div class="info-cell">
              <span class="cell-label">下载消耗</span>
              <span class="cell-value" style="color:var(--warning)">{{ resource.pointsCost || 0 }} 积分</span>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-footer">
        <div class="points-bar">
          <span style="font-size:14px;color:var(--text-secondary)">我的积分余额</span>
          <span class="points-value" :class="{ insufficient: resource.pointsCost > myPoints }">{{ myPoints }}</span>
        </div>
        <div class="action-group">
          <button class="btn btn-secondary" :class="{ active: resource.collected }" @click="toggleCollect">
            <svg style="margin-right:4px" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> {{ resource.collected ? '已收藏' : '收藏' }}
          </button>
          <button
            class="btn btn-primary btn-lg"
            :disabled="resource.status !== 1 || downloading || resource.pointsCost > myPoints"
            @click="doDownload"
          >
            <span v-if="downloading">处理中...</span>
            <span v-else-if="resource.status !== 1">资源暂不可下载</span>
            <span v-else-if="resource.pointsCost > myPoints">积分不足</span>
            <span v-else><svg style="margin-right:4px" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> 立即下载</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="empty">资源不存在</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getResource, downloadResource, collectResource, uncollectResource } from '../api/resource'
import { getPointsSummary } from '../api/points'

const route = useRoute()
const router = useRouter()

const resource = ref(null)
const loading = ref(false)
const downloading = ref(false)
const myPoints = ref(0)

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function formatFileSize(size) {
  if (!size) return '-'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

function statusText(status) {
  if (status === 0) return '待审核'
  if (status === 1) return '已上架'
  if (status === 2) return '已拒绝'
  return '未知'
}

function statusClass(status) {
  if (status === 0) return 'pending'
  if (status === 1) return 'approved'
  if (status === 2) return 'rejected'
  return ''
}

async function loadResource() {
  loading.value = true
  try {
    const res = await getResource(route.params.id)
    resource.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function loadMyPoints() {
  try {
    const res = await getPointsSummary()
    myPoints.value = res.data.balance || 0
  } catch (e) {
    console.error(e)
  }
}

async function toggleCollect() {
  if (!resource.value) return
  if (resource.value.collected) {
    await uncollectResource(resource.value.id)
    resource.value.collected = false
  } else {
    await collectResource(resource.value.id)
    resource.value.collected = true
  }
}

async function doDownload() {
  if (!resource.value || resource.value.status !== 1) return
  if (resource.value.pointsCost > myPoints.value) {
    alert('积分不足，请先获取积分')
    return
  }
  downloading.value = true
  try {
    const res = await downloadResource(resource.value.id)
    const { fileUrl } = res.data
    if (fileUrl) {
      window.open(fileUrl, '_blank')
      await loadResource()
      await loadMyPoints()
    }
  } catch (e) {
    alert(e.message || '下载失败')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  loadResource()
  loadMyPoints()
})
</script>

<style scoped>
.detail-header {
  padding: var(--space-8);
  border-bottom: 1px solid var(--border);
}
.detail-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
  letter-spacing: -0.3px;
  margin: var(--space-3) 0 var(--space-4);
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  font-size: 14px;
}
.meta-label {
  color: var(--text-muted);
  font-size: 12px;
  margin-right: 4px;
}
.meta-value {
  color: var(--text-secondary);
  font-weight: 500;
}
.meta-divider {
  width: 1px;
  height: 16px;
  background: var(--border);
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: var(--radius-full);
  display: inline-block;
  margin-right: 6px;
}
.status-dot.pending { background: var(--warning); }
.status-dot.approved { background: var(--success); }
.status-dot.rejected { background: var(--danger); }

.detail-body {
  padding: var(--space-8);
}
.info-block {
  margin-bottom: var(--space-8);
}
.info-block:last-child {
  margin-bottom: 0;
}
.block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-3);
}
.description {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
}
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: var(--space-3);
}
.info-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--space-4);
  background: var(--bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
}
.cell-label {
  font-size: 12px;
  color: var(--text-muted);
  font-weight: 500;
}
.cell-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.detail-footer {
  padding: var(--space-5) var(--space-8);
  background: var(--bg);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--space-4);
}
.points-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}
.points-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.points-value.insufficient {
  color: var(--danger);
}
.action-group {
  display: flex;
  gap: var(--space-3);
}
</style>
