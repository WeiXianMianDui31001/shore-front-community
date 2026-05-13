<template>
  <div class="page-container">
    <div class="page-header">
      <h2>资源大厅</h2>
      <p class="page-desc">考研资料、求职简历、面试经验，应有尽有</p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input v-model="searchKeyword" placeholder="搜索资源标题..." @keyup.enter="doSearch" />
        <button class="btn btn-primary btn-sm" @click="doSearch">搜索</button>
      </div>
      <div class="category-bar">
        <button :class="{ active: category === '' }" @click="category = ''; loadResources()">全部</button>
        <button v-for="cat in categories" :key="cat" :class="{ active: category === cat }" @click="category = cat; loadResources()">
          {{ cat }}
        </button>
      </div>
      <router-link to="/resources/upload" class="btn btn-primary">+ 上传资源</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="resource-list">
      <div v-for="res in resources" :key="res.id" class="resource-card card card-hover card-clickable" @click="goDetail(res.id)">
        <div class="resource-main">
          <h3 class="resource-title">{{ res.title }}</h3>
          <p class="resource-desc">{{ res.description || '暂无简介' }}</p>
          <span class="tag">{{ res.category }}</span>
        </div>
        <div class="resource-side">
          <span class="uploader-name">{{ res.uploaderNickname || '用户' + res.uploaderId }}</span>
          <div class="resource-stats">
            <span class="stat">
              <span class="stat-icon">&#128229;</span> {{ res.downloadCount || 0 }}
            </span>
            <span class="stat">
              <span class="stat-icon">&#128176;</span> {{ res.pointsCost || 0 }} 积分
            </span>
          </div>
          <span class="badge" :class="statusBadgeClass(res.status)">{{ statusText(res.status) }}</span>
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

async function loadResources() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
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
.category-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.category-bar button {
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.category-bar button:hover {
  border-color: var(--border-hover);
  color: var(--text);
}

.category-bar button.active {
  background: var(--primary);
  color: var(--text-on-primary);
  border-color: var(--primary);
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.resource-card {
  display: flex;
  justify-content: space-between;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-6);
}

.resource-main {
  flex: 1;
  min-width: 0;
}

.resource-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--space-2);
}

.resource-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: var(--space-3);
}

.resource-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  min-width: 120px;
}

.uploader-name {
  font-size: 13px;
  color: var(--text-muted);
}

.resource-stats {
  display: flex;
  gap: var(--space-3);
  font-size: 13px;
  color: var(--text-secondary);
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
