<template>
  <div class="page-container">
    <div class="page-header">
      <h2>信息聚合</h2>
      <p class="page-desc">考研院校信息、求职招聘资讯，一站聚合</p>
    </div>

    <div class="toolbar">
      <div class="segmented">
        <button :class="{ active: scene === 0 }" @click="switchScene(0)">考研</button>
        <button :class="{ active: scene === 1 }" @click="switchScene(1)">求职</button>
      </div>
      <div class="search-box">
        <input v-model="keyword" placeholder="搜索标题关键词..." @keyup.enter="doSearch" />
        <button class="btn btn-primary btn-sm" @click="doSearch">搜索</button>
      </div>
    </div>

    <div class="category-bar">
      <button :class="{ active: category === '' }" @click="category = ''; loadInfo()">全部</button>
      <button v-for="cat in categories" :key="cat" :class="{ active: category === cat }" @click="category = cat; loadInfo()">
        {{ cat }}
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="info-list">
      <div v-for="item in infoList" :key="item.id" class="info-card card card-hover card-clickable" @click="goDetail(item.id)">
        <div class="info-main">
          <h3 class="info-title">{{ item.title }}</h3>
          <div class="info-meta">
            <span class="badge badge-info">{{ item.category }}</span>
            <span v-if="item.sourceName" class="meta-text">来源：{{ item.sourceName }}</span>
            <span v-if="item.updateTime" class="meta-muted">{{ formatDate(item.updateTime) }}</span>
          </div>
        </div>
        <span class="arrow"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg></span>
      </div>
    </div>

    <div v-if="!loading && infoList.length === 0" class="empty">暂无信息</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; loadInfo()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadInfo()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { listInfo, getInfoCategories } from '../api/info'

const router = useRouter()
const userStore = useUserStore()

const scene = ref(userStore.userInfo?.role === 1 ? 1 : 0)
const keyword = ref('')
const category = ref('')
const categories = ref([])
const infoList = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(15)
const total = ref(0)

const totalPages = computed(() => Math.ceil(total.value / size.value))

function switchScene(s) {
  scene.value = s
  category.value = ''
  page.value = 1
  loadCategories()
  loadInfo()
}

function doSearch() {
  page.value = 1
  loadInfo()
}

async function loadCategories() {
  try {
    const res = await getInfoCategories(scene.value)
    categories.value = res.data || []
  } catch (e) {
    console.error(e)
  }
}

async function loadInfo() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value, scene: scene.value }
    if (category.value) params.category = category.value
    if (keyword.value.trim()) params.keyword = keyword.value.trim()
    const res = await listInfo(params)
    infoList.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function goDetail(id) {
  router.push(`/info/${id}`)
}

onMounted(() => {
  loadCategories()
  loadInfo()
})
</script>

<style scoped>
.category-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.category-bar button {
  height: 36px;
  padding: 0 16px;
  border: 1px solid var(--border);
  background: var(--surface-glass);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.category-bar button:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.category-bar button.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: var(--text-on-primary);
  border-color: transparent;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-5) var(--space-6);
}

.info-main {
  flex: 1;
  min-width: 0;
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.info-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
  font-size: 13px;
}

.meta-text {
  color: var(--text-secondary);
}

.meta-muted {
  color: var(--text-muted);
}

.arrow {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  margin-left: var(--space-4);
  flex-shrink: 0;
  transition: all 0.2s;
}

.info-card:hover .arrow {
  color: var(--primary);
  transform: translateX(3px);
}
</style>
