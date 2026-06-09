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
        <button :class="{ active: mode === 'recommend' }" @click="switchMode('recommend')">智能推荐</button>
        <button :class="{ active: mode === 'latest' }" @click="switchMode('latest')">最新</button>
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

        <div v-if="post.images" class="post-images" @click.stop>
          <div class="images-grid" :class="{ single: parseImages(post.images).length === 1 }">
            <div v-for="(img, i) in parseImages(post.images).slice(0, 4)" :key="i" class="image-thumb">
              <img :src="img" :alt="'图片' + (i+1)" loading="lazy" />
              <div v-if="i === 3 && parseImages(post.images).length > 4" class="image-more">
                +{{ parseImages(post.images).length - 4 }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="post.tags" class="tags">
          <span v-for="tag in parseTags(post.tags)" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="post-footer">
          <span class="stat">
            <span class="stat-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></span> {{ post.viewCount || 0 }}
          </span>
          <span class="stat">
            <span class="stat-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></span> {{ post.likeCount || 0 }}
          </span>
          <span class="stat">
            <span class="stat-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span> {{ post.collectCount || 0 }}
          </span>
          <span class="stat">
            <span class="stat-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg></span> {{ post.endorseCount || 0 }}
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

function parseImages(imagesJson) {
  try {
    return JSON.parse(imagesJson)
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

function switchMode(m) {
  mode.value = m
  page.value = 1
  loadPosts()
}

async function loadPosts() {
  loading.value = true
  try {
    let res
    if (mode.value === 'recommend') {
      res = await recommendPosts({ keyword: searchKeyword.value || undefined, page: page.value, size: size.value })
    } else {
      res = await listPosts({ keyword: searchKeyword.value || undefined, page: page.value, size: size.value })
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

/* 帖子图片预览 */
.post-images {
  margin-bottom: var(--space-3);
}
.images-grid {
  display: grid;
  gap: 6px;
  border-radius: var(--radius-md);
  overflow: hidden;
}
.images-grid.single {
  grid-template-columns: 1fr;
  max-height: 200px;
}
.images-grid:not(.single) {
  grid-template-columns: repeat(3, 1fr);
  max-height: 180px;
}
.images-grid:not(.single):has(:nth-child(2):last-child) {
  grid-template-columns: repeat(2, 1fr);
}
.image-thumb {
  position: relative;
  overflow: hidden;
  background: var(--bg);
  cursor: default;
}
.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}
.image-thumb:hover img {
  transform: scale(1.05);
}
.image-more {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,0,0,0.5);
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
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
