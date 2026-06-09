<template>
  <div class="page-container">
    <div class="page-header">
      <h2>帖子广场</h2>
      <p class="page-desc">发现备考与求职路上的同行者</p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input v-model="searchKeyword" placeholder="搜索帖子标题或内容..." @keyup.enter="doSearch" />
        <button class="btn btn-primary btn-sm" @click="doSearch">搜索</button>
      </div>
      <div class="segmented">
        <button :class="{ active: mode === 'recommend' }" @click="mode = 'recommend'; loadPosts()">智能推荐</button>
        <button :class="{ active: mode === 'latest' }" @click="mode = 'latest'; loadPosts()">最新</button>
      </div>
      <router-link to="/create" class="btn btn-primary">+ 发布帖子</router-link>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="posts">
      <div v-for="post in posts" :key="post.id" class="post-card" @click="goDetail(post.id)">
        <div class="post-header">
          <div class="author">
            <img v-if="post.authorAvatar" :src="post.authorAvatar" class="author-avatar" />
            <div v-else class="author-avatar avatar-placeholder">{{ post.authorNickname?.[0] || '?' }}</div>
            <div class="author-meta">
              <span class="author-name">{{ post.authorNickname || '匿名用户' }}</span>
              <span class="author-role" :class="roleClass(post.authorRole)">{{ roleText(post.authorRole) }}</span>
            </div>
          </div>
          <div class="badges">
            <span v-if="post.isPinned" class="badge badge-info">置顶</span>
            <span v-if="post.isExcellent" class="badge badge-warning">经验帖</span>
          </div>
        </div>

        <h3 class="post-title">{{ post.title }}</h3>
        <p class="post-excerpt">{{ excerpt(post.content) }}</p>

        <div v-if="post.tags" class="tags">
          <span v-for="tag in parseTags(post.tags)" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="post-footer">
          <span class="stat">
            <span class="stat-icon">&#128065;</span> {{ post.viewCount || 0 }}
          </span>
          <span class="stat">
            <span class="stat-icon">&#9829;</span> {{ post.likeCount || 0 }}
          </span>
          <span class="stat">
            <span class="stat-icon">&#9733;</span> {{ post.collectCount || 0 }}
          </span>
          <span class="stat">
            <span class="stat-icon">&#128077;</span> {{ post.endorseCount || 0 }}
          </span>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>

        <div v-if="userStore.isAdmin" class="admin-actions" @click.stop>
          <button class="btn btn-sm btn-secondary" @click="togglePostStatus(post)">
            {{ post.status === 2 ? '上架' : '下架' }}
          </button>
          <button class="btn btn-sm btn-secondary" @click="togglePin(post)">
            {{ post.isPinned ? '取消置顶' : '置顶' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!loading && posts.length === 0" class="empty">暂无帖子</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; loadPosts()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadPosts()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { listPosts, recommendPosts, updatePostStatus, pinPost } from '../api/community'

const router = useRouter()
const userStore = useUserStore()

const posts = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(10)
const total = ref(0)
const mode = ref('recommend')
const searchKeyword = ref('')

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
  try {
    return JSON.parse(tagsJson)
  } catch {
    return []
  }
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

async function loadPosts() {
  loading.value = true
  try {
    let res
    if (searchKeyword.value) {
      res = await listPosts({ keyword: searchKeyword.value, page: page.value, size: size.value })
    } else if (mode.value === 'recommend') {
      res = await recommendPosts({ page: page.value, size: size.value })
    } else {
      res = await listPosts({ page: page.value, size: size.value })
    }
    posts.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function doSearch() {
  page.value = 1
  loadPosts()
}

function goDetail(id) {
  router.push(`/post/${id}`)
}

async function togglePostStatus(post) {
  const newStatus = post.status === 2 ? 0 : 2
  await updatePostStatus(post.id, newStatus)
  post.status = newStatus
}

async function togglePin(post) {
  await pinPost(post.id, !post.isPinned)
  post.isPinned = !post.isPinned
}

onMounted(() => {
  loadPosts()
})
</script>

<style scoped>
.posts {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.post-card {
  background: var(--surface-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  cursor: pointer;
  transition: all 0.25s ease;
}

.post-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.post-header {
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

.author-meta {
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
  padding: 1px 6px;
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

.post-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--space-2);
  line-height: 1.4;
}

.post-excerpt {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: var(--space-3);
}

.tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-3);
}

.post-footer {
  display: flex;
  gap: var(--space-4);
  align-items: center;
  color: var(--text-muted);
  font-size: 13px;
}

.stat {
  display: flex;
  align-items: center;
  gap: 4px;
}

.stat-icon {
  font-size: 14px;
}

.post-time {
  margin-left: auto;
}

.admin-actions {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border);
}
</style>
