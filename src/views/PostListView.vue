<template>
  <div class="post-list-page">
    <div class="page-header">
      <h2>帖子广场</h2>
      <p class="page-desc">发现备考与求职路上的同行者</p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input v-model="searchKeyword" placeholder="搜索帖子标题或内容..." @keyup.enter="doSearch" />
        <button class="search-btn" @click="doSearch">搜索</button>
      </div>
      <div class="filter-tabs">
        <button :class="{ active: mode === 'recommend' }" @click="mode = 'recommend'; loadPosts()">智能推荐</button>
        <button :class="{ active: mode === 'latest' }" @click="mode = 'latest'; loadPosts()">最新</button>
      </div>
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
            <span v-if="post.isPinned" class="pin-badge">置顶</span>
            <span v-if="post.isExcellent" class="excellent-badge">经验帖</span>
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
          <button class="admin-btn" @click="togglePostStatus(post)">
            {{ post.status === 2 ? '上架' : '下架' }}
          </button>
          <button class="admin-btn" @click="togglePin(post)">
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
.filter-tabs {
  display: flex;
  gap: 8px;
}
.filter-tabs button {
  padding: 8px 16px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
}
.filter-tabs button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}

.posts {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.post-card {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #ebe8e0;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.post-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(26, 58, 92, 0.08);
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.author {
  display: flex;
  align-items: center;
  gap: 10px;
}
.author-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a3a5c;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.author-meta {
  display: flex;
  align-items: center;
  gap: 8px;
}
.author-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.author-role {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
}
.role-study { background: #e3f2fd; color: #1565c0; }
.role-job { background: #fff3e0; color: #e65100; }
.role-admin { background: #fce4ec; color: #c2185b; }
.badges {
  display: flex;
  gap: 8px;
}
.pin-badge {
  font-size: 12px;
  padding: 4px 10px;
  background: #c9a96e;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
}
.excellent-badge {
  font-size: 12px;
  padding: 4px 10px;
  background: #fff8e1;
  color: #e65100;
  border-radius: 8px;
  font-weight: 600;
}

.post-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 8px;
  line-height: 1.4;
}
.post-excerpt {
  color: #555;
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}
.tag {
  font-size: 12px;
  padding: 4px 10px;
  background: #f0ece4;
  color: #5a5a5a;
  border-radius: 8px;
}

.post-footer {
  display: flex;
  gap: 16px;
  align-items: center;
  color: #888;
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
  color: #aaa;
}

.admin-actions {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px dashed #e0ddd5;
}
.admin-btn {
  padding: 6px 12px;
  border: 1px solid #c9a96e;
  background: #fffaf0;
  color: #8a6d3b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}
.admin-btn:hover {
  background: #c9a96e;
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
