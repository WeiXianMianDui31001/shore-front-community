<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的收藏</h2>
      <p class="page-desc">你关注的帖子和资源，都在这里</p>
    </div>

    <div class="segmented">
      <button :class="{ active: activeTab === 'posts' }" @click="activeTab = 'posts'; load()">帖子</button>
      <button :class="{ active: activeTab === 'resources' }" @click="activeTab = 'resources'; load()">资源</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="activeTab === 'posts'" class="posts">
      <div v-for="post in postList" :key="post.id" class="post-card card card-hover card-clickable" @click="goPost(post.id)">
        <div class="card-header">
          <div class="author">
            <img v-if="post.authorAvatar" :src="post.authorAvatar" class="author-avatar" />
            <div v-else class="author-avatar avatar-placeholder">{{ post.authorNickname?.[0] || '?' }}</div>
            <div class="author-info">
              <span class="author-name">{{ post.authorNickname || '匿名用户' }}</span>
              <span class="author-role" :class="roleClass(post.authorRole)">{{ roleText(post.authorRole) }}</span>
            </div>
          </div>
          <div class="badges">
            <span v-if="post.isPinned" class="badge badge-info">置顶</span>
            <span v-if="post.isExcellent" class="badge badge-warning">经验帖</span>
          </div>
        </div>
        <h3 class="card-title">{{ post.title }}</h3>
        <p class="card-excerpt">{{ excerpt(post.content) }}</p>
        <div v-if="post.tags" class="tag-bar">
          <span v-for="tag in parseTags(post.tags)" :key="tag" class="tag">{{ tag }}</span>
        </div>
        <div class="card-footer">
          <span class="stat"><span class="stat-icon">&#128065;</span> {{ post.viewCount || 0 }}</span>
          <span class="stat"><span class="stat-icon">&#9829;</span> {{ post.likeCount || 0 }}</span>
          <span class="stat"><span class="stat-icon">&#9733;</span> {{ post.collectCount || 0 }}</span>
          <span class="time">{{ formatTime(post.createdAt) }}</span>
        </div>
      </div>
    </div>

    <div v-else-if="activeTab === 'resources'" class="resources">
      <div v-for="r in resourceList" :key="r.id" class="resource-card card card-hover card-clickable" @click="goResource(r.id)">
        <div class="card-header">
          <h3 class="card-title">{{ r.title }}</h3>
          <span class="badge badge-info">{{ r.category }}</span>
        </div>
        <p class="card-excerpt">{{ r.description || '暂无简介' }}</p>
        <div class="card-footer">
          <span class="meta">{{ formatFileSize(r.fileSize) }}</span>
          <span class="meta">{{ r.downloadCount || 0 }} 次下载</span>
          <span class="meta cost">{{ r.pointsCost || 0 }} 积分</span>
        </div>
      </div>
    </div>

    <div v-if="!loading && currentList.length === 0" class="empty-state">
      <span class="empty-icon">&#9734;</span>
      <p>暂无收藏</p>
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; load()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; load()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { myPostCollects } from '../api/community'
import { myResourceCollects } from '../api/resource'

const router = useRouter()

const activeTab = ref('posts')
const postList = ref([])
const resourceList = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)

const currentList = computed(() => activeTab.value === 'posts' ? postList.value : resourceList.value)
const totalPages = computed(() => Math.ceil(total.value / size.value))

function roleText(role) {
  if (role === 0) return '备考'
  if (role === 1) return '求职'
  if (role === 2) return '管理员'
  return ''
}

function roleClass(role) {
  if (role === 0) return 'role-study'
  if (role === 1) return 'role-job'
  if (role === 2) return 'role-admin'
  return ''
}

function parseTags(tagsJson) {
  try { return JSON.parse(tagsJson) } catch { return [] }
}

function excerpt(content) {
  if (!content) return ''
  return content.length > 120 ? content.slice(0, 120) + '...' : content
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getMonth() + 1}月${d.getDate()}日`
}

function formatFileSize(size) {
  if (!size) return '-'
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

function goPost(id) {
  router.push(`/post/${id}`)
}

function goResource(id) {
  router.push(`/resources/${id}`)
}

async function load() {
  loading.value = true
  try {
    if (activeTab.value === 'posts') {
      const res = await myPostCollects({ page: page.value, size: size.value })
      postList.value = res.data.records || []
      total.value = res.data.total || 0
    } else {
      const res = await myResourceCollects({ page: page.value, size: size.value })
      resourceList.value = res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
})
</script>

<style scoped>
.posts, .resources {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.post-card, .resource-card {
  padding: var(--space-5);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.author {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.author-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 13px;
  font-weight: 600;
}

.author-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.author-name {
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
}

.author-role {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
}

.role-study { background: #eff6ff; color: #2563eb; }
.role-job { background: #fff7ed; color: #ea580c; }
.role-admin { background: #fef2f2; color: #dc2626; }

.badges {
  display: flex;
  gap: var(--space-2);
}

.card-title {
  font-size: 17px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.card-excerpt {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: var(--space-3);
}

.tag-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.card-footer {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  color: var(--text-muted);
  font-size: 13px;
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}

.time {
  margin-left: auto;
}

.meta {
  color: var(--text-muted);
}

.meta.cost {
  color: var(--warning);
  font-weight: 600;
}

.empty-state {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: var(--space-2);
}

.empty-state p {
  font-size: 14px;
}
</style>
