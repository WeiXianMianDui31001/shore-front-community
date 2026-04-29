<template>
  <div class="my-uploads-page">
    <div class="page-header">
      <h2>我的上传</h2>
      <p class="page-desc">追踪你上传的资源状态与审核进度</p>
    </div>

    <div class="toolbar">
      <div class="status-filter">
        <button :class="{ active: status === null }" @click="status = null; loadUploads()">全部</button>
        <button :class="{ active: status === 0 }" @click="status = 0; loadUploads()">待审核</button>
        <button :class="{ active: status === 1 }" @click="status = 1; loadUploads()">已上架</button>
        <button :class="{ active: status === 2 }" @click="status = 2; loadUploads()">已拒绝</button>
      </div>
      <router-link to="/resources/upload" class="upload-btn-primary">+ 上传新资源</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="uploads">
      <div v-for="res in uploads" :key="res.id" class="upload-card">
        <div class="upload-main">
          <h3 class="upload-title">{{ res.title }}</h3>
          <p class="upload-desc">{{ res.description || '暂无简介' }}</p>
          <div class="upload-meta">
            <span class="category-tag">{{ res.category }}</span>
            <span class="meta-item">{{ formatTime(res.createdAt) }}</span>
          </div>
        </div>
        <div class="upload-side">
          <span class="status-badge" :class="statusClass(res.status)">{{ statusText(res.status) }}</span>
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

function statusClass(status) {
  if (status === 0) return 'status-pending'
  if (status === 1) return 'status-approved'
  if (status === 2) return 'status-rejected'
  return ''
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
.page-header {
  margin-bottom: 24px;
}
.page-header h2 {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #1a3a5c;
}
.page-desc {
  color: #888;
  font-size: 14px;
  margin-top: 4px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
}
.status-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.status-filter button {
  padding: 8px 16px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}
.status-filter button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}
.upload-btn-primary {
  padding: 10px 20px;
  background: #c9a96e;
  color: #fff;
  border-radius: 10px;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}
.upload-btn-primary:hover {
  background: #b8985a;
}

.uploads {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.upload-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #ebe8e0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
.upload-main {
  flex: 1;
  min-width: 0;
}
.upload-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.upload-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.upload-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.category-tag {
  font-size: 12px;
  padding: 4px 10px;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 8px;
  font-weight: 500;
}
.meta-item {
  font-size: 13px;
  color: #aaa;
}

.upload-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  min-width: 100px;
}
.status-badge {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 8px;
  font-weight: 500;
}
.status-pending { background: #fff3e0; color: #e65100; }
.status-approved { background: #e8f5e9; color: #2e7d32; }
.status-rejected { background: #fce4ec; color: #c2185b; }
.upload-stats {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: #666;
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

.loading, .empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
}
.pagination button {
  padding: 8px 18px;
  border: 1px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
