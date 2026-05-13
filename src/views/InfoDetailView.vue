<template>
  <div class="page-container info-detail-page">
    <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-4)" @click="router.back()">
      <span style="margin-right:4px">&#8592;</span> 返回
    </button>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="info" class="card" style="overflow:hidden">
      <div class="detail-header">
        <span class="badge badge-info">{{ info.category }}</span>
        <h1 class="detail-title">{{ info.title }}</h1>
        <div class="detail-meta">
          <span v-if="info.sourceName" class="meta-item">
            <span class="meta-label">来源</span>
            {{ info.sourceName }}
          </span>
          <span v-if="info.updateTime" class="meta-item">
            <span class="meta-label">更新于</span>
            {{ formatDate(info.updateTime) }}
          </span>
          <span class="meta-item">
            <span class="meta-label">场景</span>
            {{ info.scene === 0 ? '考研' : '求职' }}
          </span>
        </div>
      </div>

      <div class="detail-body">
        <div class="source-block">
          <h3 class="block-title">信息来源</h3>
          <a v-if="info.sourceUrl" :href="info.sourceUrl" target="_blank" class="source-link">
            <span class="link-text">{{ info.sourceUrl }}</span>
            <span>&#8599;</span>
          </a>
          <p v-else style="color:var(--text-muted);font-size:14px">暂无来源链接</p>
        </div>
      </div>

      <div class="detail-footer">
        <button class="btn btn-secondary" :class="{ active: collected }" @click="toggleCollect">
          <span style="margin-right:4px">&#9733;</span> {{ collected ? '已收藏' : '收藏' }}
        </button>
      </div>
    </div>

    <div v-else class="empty">信息不存在或已下架</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getInfoDetail, collectInfo, uncollectInfo } from '../api/info'

const route = useRoute()
const router = useRouter()

const info = ref(null)
const loading = ref(false)
const collected = ref(false)

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

async function loadInfo() {
  loading.value = true
  try {
    const res = await getInfoDetail(route.params.id)
    info.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function toggleCollect() {
  if (!info.value) return
  try {
    if (collected.value) {
      await uncollectInfo(info.value.id)
      collected.value = false
    } else {
      await collectInfo(info.value.id)
      collected.value = true
    }
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

onMounted(() => {
  loadInfo()
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
  gap: var(--space-4);
  flex-wrap: wrap;
  font-size: 14px;
}
.meta-item {
  color: var(--text-secondary);
}
.meta-label {
  color: var(--text-muted);
  font-size: 12px;
  margin-right: 4px;
  font-weight: 500;
}

.detail-body {
  padding: var(--space-8);
}
.block-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-3);
}
.source-link {
  display: inline-flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--primary);
  text-decoration: none;
  font-size: 14px;
  transition: all 0.15s;
  max-width: 100%;
  word-break: break-all;
}
.source-link:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}
.link-text {
  flex: 1;
}

.detail-footer {
  padding: var(--space-5) var(--space-8);
  background: var(--bg);
  border-top: 1px solid var(--border);
}
</style>
