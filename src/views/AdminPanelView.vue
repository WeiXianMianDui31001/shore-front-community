<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>管理后台</h2>
      <p class="page-desc">资源审核与帖子加精管理</p>
    </div>

    <div class="admin-tabs">
      <button :class="{ active: activeTab === 'resources' }" @click="activeTab = 'resources'">资源审核</button>
      <button :class="{ active: activeTab === 'excellent' }" @click="activeTab = 'excellent'">待加精帖子</button>
    </div>

    <!-- 资源审核 -->
    <div v-if="activeTab === 'resources'" class="tab-panel">
      <div class="sub-toolbar">
        <div class="status-filter">
          <button :class="{ active: resourceStatus === null }" @click="resourceStatus = null; loadResources()">全部</button>
          <button :class="{ active: resourceStatus === 0 }" @click="resourceStatus = 0; loadResources()">待审核</button>
          <button :class="{ active: resourceStatus === 1 }" @click="resourceStatus = 1; loadResources()">已通过</button>
          <button :class="{ active: resourceStatus === 2 }" @click="resourceStatus = 2; loadResources()">已拒绝</button>
        </div>
      </div>

      <div v-if="resourceLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="res in resources" :key="res.id" class="admin-item">
          <div class="item-main">
            <h4 class="item-title">{{ res.title }}</h4>
            <p class="item-desc">{{ res.description || '暂无简介' }}</p>
            <div class="item-meta">
              <span class="category-tag">{{ res.category }}</span>
              <span class="meta-text">上传者：{{ res.uploaderNickname || '用户' + res.uploaderId }}</span>
              <span class="meta-text">{{ formatTime(res.createdAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <span class="status-badge" :class="statusClass(res.status)">{{ statusText(res.status) }}</span>
            <button class="action-btn preview" @click="previewFile(res.id)">&#128269; 预览</button>
            <template v-if="res.status === 0">
              <button class="action-btn approve" @click="auditResource(res.id, 1)">通过</button>
              <button class="action-btn reject" @click="auditResource(res.id, 2)">拒绝</button>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!resourceLoading && resources.length === 0" class="empty">暂无资源</div>

      <div v-if="resourceTotalPages > 1" class="pagination">
        <button :disabled="resourcePage <= 1" @click="resourcePage--; loadResources()">上一页</button>
        <span>{{ resourcePage }} / {{ resourceTotalPages }}</span>
        <button :disabled="resourcePage >= resourceTotalPages" @click="resourcePage++; loadResources()">下一页</button>
      </div>
    </div>

    <!-- 待加精帖子 -->
    <div v-if="activeTab === 'excellent'" class="tab-panel">
      <div v-if="excellentLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="post in pendingPosts" :key="post.id" class="admin-item">
          <div class="item-main">
            <h4 class="item-title">{{ post.title }}</h4>
            <p class="item-desc">{{ excerpt(post.content) }}</p>
            <div class="item-meta">
              <span class="meta-text">作者：{{ post.authorNickname || '用户' + post.authorId }}</span>
              <span class="meta-text endorse-count">
                <span class="endorse-icon">&#128077;</span> {{ post.endorseCount || 0 }} 认可
              </span>
              <span class="meta-text">{{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="action-btn excellent" @click="markExcellent(post.id)">加精</button>
          </div>
        </div>
      </div>

      <div v-if="!excellentLoading && pendingPosts.length === 0" class="empty">暂无待加精帖子</div>

      <div v-if="excellentTotalPages > 1" class="pagination">
        <button :disabled="excellentPage <= 1" @click="excellentPage--; loadPendingPosts()">上一页</button>
        <span>{{ excellentPage }} / {{ excellentTotalPages }}</span>
        <button :disabled="excellentPage >= excellentTotalPages" @click="excellentPage++; loadPendingPosts()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { auditList, auditResource as auditResourceApi, previewResource } from '../api/admin'
import { getPendingExcellentPosts, excellentPost } from '../api/community'

const activeTab = ref('resources')

// Resources
const resources = ref([])
const resourceLoading = ref(false)
const resourcePage = ref(1)
const resourceSize = ref(10)
const resourceTotal = ref(0)
const resourceStatus = ref(null)

const resourceTotalPages = computed(() => Math.ceil(resourceTotal.value / resourceSize.value))

// Excellent posts
const pendingPosts = ref([])
const excellentLoading = ref(false)
const excellentPage = ref(1)
const excellentSize = ref(10)
const excellentTotal = ref(0)

const excellentTotalPages = computed(() => Math.ceil(excellentTotal.value / excellentSize.value))

function statusText(status) {
  if (status === 0) return '待审核'
  if (status === 1) return '已通过'
  if (status === 2) return '已拒绝'
  return '未知'
}

function statusClass(status) {
  if (status === 0) return 'status-pending'
  if (status === 1) return 'status-approved'
  if (status === 2) return 'status-rejected'
  return ''
}

function excerpt(content) {
  if (!content) return ''
  return content.length > 120 ? content.slice(0, 120) + '...' : content
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

async function loadResources() {
  resourceLoading.value = true
  try {
    const params = { page: resourcePage.value, size: resourceSize.value }
    if (resourceStatus.value !== null) params.status = resourceStatus.value
    const res = await auditList(params)
    resources.value = res.data.records || []
    resourceTotal.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    resourceLoading.value = false
  }
}

async function loadPendingPosts() {
  excellentLoading.value = true
  try {
    const res = await getPendingExcellentPosts({
      page: excellentPage.value,
      size: excellentSize.value
    })
    pendingPosts.value = res.data.records || []
    excellentTotal.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    excellentLoading.value = false
  }
}

async function previewFile(id) {
  try {
    const res = await previewResource(id)
    const url = res.data
    if (url) {
      window.open(url, '_blank')
    }
  } catch (e) {
    alert(e.message || '预览失败')
  }
}

async function auditResource(id, action) {
  const reason = action === 2 ? prompt('请输入拒绝原因：') || '' : ''
  try {
    await auditResourceApi(id, action, reason)
    loadResources()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

async function markExcellent(id) {
  if (!confirm('确认将该帖子加精为经验帖？')) return
  try {
    await excellentPost(id)
    loadPendingPosts()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

watch(activeTab, (tab) => {
  if (tab === 'resources') loadResources()
  if (tab === 'excellent') loadPendingPosts()
})

onMounted(() => {
  loadResources()
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

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.admin-tabs button {
  padding: 10px 24px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  color: #555;
}
.admin-tabs button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}

.sub-toolbar {
  margin-bottom: 16px;
}
.status-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.status-filter button {
  padding: 8px 14px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}
.status-filter button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.admin-item {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #ebe8e0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}
.item-main {
  flex: 1;
  min-width: 0;
}
.item-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}
.item-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
}
.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.category-tag {
  font-size: 12px;
  padding: 3px 8px;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 6px;
}
.meta-text {
  font-size: 13px;
  color: #888;
}
.endorse-count {
  display: flex;
  align-items: center;
  gap: 4px;
}
.endorse-icon {
  font-size: 14px;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 80px;
}
.status-badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}
.status-pending { background: #fff3e0; color: #e65100; }
.status-approved { background: #e8f5e9; color: #2e7d32; }
.status-rejected { background: #fce4ec; color: #c2185b; }

.action-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}
.action-btn.approve {
  background: #e8f5e9;
  color: #2e7d32;
}
.action-btn.approve:hover {
  background: #2e7d32;
  color: #fff;
}
.action-btn.reject {
  background: #fce4ec;
  color: #c2185b;
}
.action-btn.reject:hover {
  background: #c2185b;
  color: #fff;
}
.action-btn.preview {
  background: #e3f2fd;
  color: #1565c0;
}
.action-btn.preview:hover {
  background: #1565c0;
  color: #fff;
}
.action-btn.excellent {
  background: #fff8e1;
  color: #e65100;
}
.action-btn.excellent:hover {
  background: #e65100;
  color: #fff;
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
