<template>
  <div class="resource-detail-page">
    <button class="back-btn" @click="router.back()">&#8592; 返回</button>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="resource" class="resource-detail">
      <div class="detail-header">
        <h1 class="detail-title">{{ resource.title }}</h1>
        <div class="detail-meta">
          <span class="category-tag">{{ resource.category }}</span>
          <span class="meta-item">上传者：{{ resource.uploaderNickname || '用户' + resource.uploaderId }}</span>
          <span class="meta-item">{{ formatTime(resource.createdAt) }}</span>
        </div>
      </div>

      <div class="detail-body">
        <div class="info-section">
          <h3 class="section-title">资源简介</h3>
          <p class="description">{{ resource.description || '暂无简介' }}</p>
        </div>

        <div v-if="resource.tags" class="info-section">
          <h3 class="section-title">标签</h3>
          <div class="tags">
            <span v-for="tag in parseTags(resource.tags)" :key="tag" class="tag">{{ tag }}</span>
          </div>
        </div>

        <div class="info-section">
          <h3 class="section-title">文件信息</h3>
          <div class="file-info-grid">
            <div class="file-info-item">
              <span class="file-info-label">文件名</span>
              <span class="file-info-value">{{ resource.fileName }}</span>
            </div>
            <div class="file-info-item">
              <span class="file-info-label">大小</span>
              <span class="file-info-value">{{ formatFileSize(resource.fileSize) }}</span>
            </div>
            <div class="file-info-item">
              <span class="file-info-label">下载次数</span>
              <span class="file-info-value">{{ resource.downloadCount || 0 }}</span>
            </div>
            <div class="file-info-item">
              <span class="file-info-label">状态</span>
              <span class="file-info-value">{{ statusText(resource.status) }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="download-section">
        <div class="download-info">
          <span class="cost-label">下载消耗：</span>
          <span class="cost-value">{{ resource.pointsCost || 0 }} 积分</span>
          <span class="balance-label">（我的余额：{{ myPoints }} 积分）</span>
        </div>
        <button
          class="download-btn"
          :disabled="resource.status !== 1 || downloading || resource.pointsCost > myPoints"
          @click="doDownload"
        >
          <span v-if="downloading">处理中...</span>
          <span v-else-if="resource.status !== 1">资源暂不可下载</span>
          <span v-else-if="resource.pointsCost > myPoints">积分不足</span>
          <span v-else>&#128229; 立即下载</span>
        </button>
      </div>
    </div>

    <div v-else class="empty">资源不存在</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getResource, downloadResource } from '../api/resource'
import { getPointsSummary } from '../api/points'

const route = useRoute()
const router = useRouter()

const resource = ref(null)
const loading = ref(false)
const downloading = ref(false)
const myPoints = ref(0)

function parseTags(tagsJson) {
  try { return JSON.parse(tagsJson) } catch { return [] }
}

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
      // 重新加载资源详情，确保下载次数与积分显示最新值
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
.resource-detail-page {
  padding-bottom: 40px;
}
.back-btn {
  margin-bottom: 16px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #1a3a5c;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}
.back-btn:hover {
  text-decoration: underline;
}

.resource-detail {
  background: #fff;
  border-radius: 20px;
  border: 1px solid #ebe8e0;
  overflow: hidden;
}

.detail-header {
  padding: 32px;
  border-bottom: 1px solid #f0ece4;
}
.detail-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 14px;
}
.detail-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 14px;
  color: #888;
}
.category-tag {
  font-size: 13px;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 8px;
  font-weight: 500;
}

.detail-body {
  padding: 32px;
}
.info-section {
  margin-bottom: 28px;
}
.info-section:last-child {
  margin-bottom: 0;
}
.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  color: #1a3a5c;
  margin-bottom: 12px;
}
.description {
  font-size: 15px;
  line-height: 1.8;
  color: #444;
}
.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  font-size: 13px;
  padding: 5px 12px;
  background: #f0ece4;
  color: #5a5a5a;
  border-radius: 10px;
}

.file-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}
.file-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px;
  background: #faf9f7;
  border-radius: 12px;
}
.file-info-label {
  font-size: 12px;
  color: #888;
}
.file-info-value {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.download-section {
  padding: 24px 32px;
  background: #faf9f7;
  border-top: 1px solid #f0ece4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}
.download-info {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
}
.cost-label {
  color: #555;
}
.cost-value {
  font-weight: 700;
  color: #e65100;
}
.balance-label {
  color: #888;
  font-size: 13px;
}
.download-btn {
  padding: 12px 32px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
}
.download-btn:hover:not(:disabled) {
  background: #0f2540;
}
.download-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading, .empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
}
</style>
