<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的上传</h2>
      <p class="page-desc">追踪你上传的资源状态与审核进度</p>
    </div>

    <div class="toolbar">
      <div class="status-bar">
        <button :class="{ active: status === null }" @click="status = null; loadUploads()">全部</button>
        <button :class="{ active: status === 0 }" @click="status = 0; loadUploads()">待审核</button>
        <button :class="{ active: status === 1 }" @click="status = 1; loadUploads()">已上架</button>
        <button :class="{ active: status === 2 }" @click="status = 2; loadUploads()">已拒绝</button>
      </div>
      <router-link to="/resources/upload" class="btn btn-primary">+ 上传新资源</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="upload-list">
      <div v-for="res in uploads" :key="res.id" class="upload-card card">
        <div class="upload-main">
          <h3 class="upload-title">{{ res.title }}</h3>
          <p class="upload-desc">{{ res.description || '暂无简介' }}</p>
          <div class="upload-meta">
            <span class="tag">{{ res.category }}</span>
            <span class="meta-muted">{{ formatTime(res.createdAt) }}</span>
          </div>
        </div>
        <div class="upload-side">
          <span class="badge" :class="statusBadgeClass(res.status)">{{ statusText(res.status) }}</span>
          <div class="upload-stats">
            <span class="stat">
              <span class="stat-icon">&#128229;</span> {{ res.downloadCount || 0 }} 下载
            </span>
            <span class="stat">
              <span class="stat-icon">&#128176;</span> {{ res.pointsCost || 0 }} 积分
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="!loading && uploads.length === 0" class="empty">暂无上传记录</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; loadUploads()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadUploads()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { myUploads } from '../api/resource'

const uploads = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)
const status = ref(null)

const totalPages = computed(() => Math.ceil(total.value / size.value))

function statusText(status) {
  if (status === 0) return '待审核'
  if (status === 1) return '已上架'
  if (status === 2) return '已拒绝'
  return '未知'
}

function statusBadgeClass(status) {
  if (status === 0) return 'badge-warning'
  if (status === 1) return 'badge-success'
  if (status === 2) return 'badge-danger'
  return 'badge-neutral'
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

async function loadUploads() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (status.value !== null) params.status = status.value
    const res = await myUploads(params)
    uploads.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadUploads()
})
</script>

<style scoped>
.status-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.status-bar button {
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.status-bar button:hover {
  border-color: var(--border-hover);
  color: var(--text);
}

.status-bar button.active {
  background: var(--primary);
  color: var(--text-on-primary);
  border-color: var(--primary);
}

.upload-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.upload-card {
  display: flex;
  justify-content: space-between;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-6);
}

.upload-main {
  flex: 1;
  min-width: 0;
}

.upload-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--space-2);
}

.upload-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: var(--space-3);
}

.upload-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.meta-muted {
  font-size: 13px;
  color: var(--text-muted);
}

.upload-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  min-width: 100px;
}

.upload-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  align-items: flex-end;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}
</style>
