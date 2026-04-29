<template>
  <div class="resource-list-page">
    <div class="page-header">
      <h2>资源大厅</h2>
      <p class="page-desc">考研资料、求职简历、面试经验，应有尽有</p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input v-model="searchKeyword" placeholder="搜索资源标题..." @keyup.enter="doSearch" />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
      <div class="category-filter">
        <button :class="{ active: category === '' }" @click="category = ''; loadResources()">全部</button>
        <button v-for="cat in categories" :key="cat" :class="{ active: category === cat }" @click="category = cat; loadResources()">
          {{ cat }}
        </button>
      </div>
      <router-link to="/resources/upload" class="upload-btn-primary">+ 上传资源</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="resources">
      <div v-for="res in resources" :key="res.id" class="resource-card" @click="goDetail(res.id)">
        <div class="resource-main">
          <h3 class="resource-title">{{ res.title }}</h3>
          <p class="resource-desc">{{ res.description || '暂无简介' }}</p>
          <div class="resource-meta">
            <span class="category-tag">{{ res.category }}</span>
            <span v-if="res.tags" class="tag-list">
              <span v-for="tag in parseTags(res.tags)" :key="tag" class="tag">{{ tag }}</span>
            </span>
          </div>
        </div>
        <div class="resource-side">
          <div class="uploader">
            <span class="uploader-name">{{ res.uploaderNickname || '用户' + res.uploaderId }}</span>
          </div>
          <div class="stats">
            <span class="stat">
              <span class="stat-icon">&#128229;</span> {{ res.downloadCount || 0 }}
            </span>
            <span class="stat">
              <span class="stat-icon">&#128176;</span> {{ res.pointsCost || 0 }} 积分
            </span>
          </div>
          <span class="status-badge" :class="statusClass(res.status)">{{ statusText(res.status) }}</span>
        </div>
      </div>
    </div>

    <div v-if="!loading && resources.length === 0" class="empty">暂无资源</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; loadResources()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadResources()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listResources, getCategories } from '../api/resource'

const router = useRouter()

const resources = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const category = ref('')
const categories = ref([])

const totalPages = computed(() => Math.ceil(total.value / size.value))

function parseTags(tagsJson) {
  try {
    return JSON.parse(tagsJson)
  } catch {
    return []
  }
}

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

async function loadResources() {
  loading.value = true
  try {
    const params = {
      page: page.value,
      size: size.value
    }
    if (searchKeyword.value) params.keyword = searchKeyword.value
    if (category.value) params.category = category.value
    const res = await listResources(params)
    resources.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function doSearch() {
  page.value = 1
  loadResources()
}

function goDetail(id) {
  router.push(`/resources/${id}`)
}

onMounted(async () => {
  const catRes = await getCategories()
  categories.value = catRes.data || []
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

.toolbar {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
}
.search-box {
  display: flex;
  flex: 1;
  min-width: 260px;
  gap: 8px;
}
.search-box input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
}
.search-box input:focus {
  border-color: #c9a96e;
}
.search-btn {
  padding: 10px 20px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
}

.category-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.category-filter button {
  padding: 8px 14px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
  transition: all 0.2s;
}
.category-filter button.active {
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

.resources {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.resource-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #ebe8e0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
.resource-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 58, 92, 0.08);
}

.resource-main {
  flex: 1;
  min-width: 0;
}
.resource-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.resource-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 12px;
}
.resource-meta {
  display: flex;
  align-items: center;
  gap: 10px;
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
.tag-list {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.tag {
  font-size: 12px;
  padding: 3px 8px;
  background: #f0ece4;
  color: #5a5a5a;
  border-radius: 6px;
}

.resource-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 120px;
}
.uploader-name {
  font-size: 13px;
  color: #888;
}
.stats {
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #666;
}
.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}
.stat-icon {
  font-size: 14px;
}
.status-badge {
  font-size: 12px;
  padding: 3px 10px;
  border-radius: 8px;
  font-weight: 500;
}
.status-pending { background: #fff3e0; color: #e65100; }
.status-approved { background: #e8f5e9; color: #2e7d32; }
.status-rejected { background: #fce4ec; color: #c2185b; }

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
