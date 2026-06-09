<template>
  <div class="page-container post-detail-page">
    <button class="btn btn-ghost btn-sm" style="margin-bottom:var(--space-4)" @click="router.back()">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px"><polyline points="15 18 9 12 15 6"/></svg> 返回
    </button>

    <div v-if="loading" class="loading">加载中...</div>

    <template v-else-if="post">
      <div class="card" style="margin-bottom:var(--space-4)">
        <div class="post-header">
          <div class="author">
            <img v-if="post.authorAvatar" :src="post.authorAvatar" class="author-avatar" />
            <div v-else class="author-avatar avatar-placeholder">{{ post.authorNickname?.[0] || '?' }}</div>
            <div class="author-info">
              <span class="author-name">{{ post.authorNickname || '匿名用户' }}</span>
              <span class="author-role" :class="roleClass(post.authorRole)">{{ roleText(post.authorRole) }}</span>
            </div>
          </div>
          <span class="post-time">{{ formatTime(post.createdAt) }}</span>
        </div>

        <div class="title-row">
          <h1 class="post-title">{{ post.title }}</h1>
          <span v-if="post.isExcellent" class="badge badge-warning">
            <span style="margin-right:4px">&#9733;</span> 经验帖
          </span>
        </div>

        <div class="post-content">{{ post.content }}</div>

        <div v-if="post.images" class="images">
          <img v-for="(img, i) in parseImages(post.images)" :key="i" :src="img" class="post-image" @click="previewImage(img)" />
        </div>

        <div v-if="post.tags" class="tag-bar">
          <span v-for="tag in parseTags(post.tags)" :key="tag" class="tag">{{ tag }}</span>
        </div>

        <div class="actions">
          <button class="action-pill" :class="{ active: post.liked }" @click="toggleLike">
            <span style="margin-right:4px">&#9829;</span>
            <span>{{ post.liked ? '已赞' : '点赞' }}</span>
            <span style="margin-left:4px;font-weight:600">{{ post.likeCount || 0 }}</span>
          </button>
          <button class="action-pill" :class="{ active: post.collected }" @click="toggleCollect">
            <span style="margin-right:4px">&#9733;</span>
            <span>{{ post.collected ? '已收藏' : '收藏' }}</span>
            <span style="margin-left:4px;font-weight:600">{{ post.collectCount || 0 }}</span>
          </button>
          <button class="action-pill" :class="{ active: post.endorsed }" @click="toggleEndorse">
            <span style="margin-right:4px">&#128077;</span>
            <span>{{ post.endorsed ? '已认可' : '认可' }}</span>
            <span style="margin-left:4px;font-weight:600">{{ post.endorseCount || 0 }}</span>
          </button>
          <span class="view-count">
            <span style="margin-right:4px">&#128065;</span> {{ post.viewCount || 0 }} 浏览
          </span>
        </div>

        <div v-if="userStore.isAdmin" class="admin-bar">
          <button class="btn btn-sm btn-secondary" @click="togglePostStatus">
            {{ post.status === 2 ? '上架帖子' : '下架帖子' }}
          </button>
        </div>
      </div>

      <div class="card">
        <h3 class="comments-title">
          评论
          <span v-if="userStore.isAdmin" style="font-size:12px;color:var(--text-muted);font-weight:400">管理员可管理评论状态</span>
        </h3>

        <div class="comment-composer">
          <textarea
            v-model="commentContent"
            placeholder="写下你的评论..."
            rows="3"
          ></textarea>
          <div class="composer-toolbar">
            <div class="composer-left">
              <input type="file" accept="image/*" multiple @change="handleCommentFileSelect" ref="commentFileInput" class="file-input" />
              <button class="btn btn-sm btn-ghost" @click="commentFileInput?.click()">
                <span style="margin-right:4px">&#128247;</span> 添加图片
              </button>
              <span v-if="commentUploading" style="font-size:13px;color:var(--text-muted)">上传中...</span>
            </div>
            <button class="btn btn-primary btn-sm" @click="submitComment" :disabled="!commentContent.trim() && commentImageUrls.length === 0">发表评论</button>
          </div>
          <div v-if="commentImageUrls.length" class="image-preview-bar">
            <div v-for="(img, i) in commentImageUrls" :key="i" class="preview-thumb">
              <img :src="img" />
              <button class="thumb-remove" @click="removeCommentImage(i)">&#10005;</button>
            </div>
          </div>
        </div>

        <div class="comments-list">
          <div v-for="c in comments" :key="c.id" class="comment-item">
            <div class="comment-main">
              <img v-if="c.authorAvatar" :src="c.authorAvatar" class="comment-avatar" />
              <div v-else class="comment-avatar avatar-placeholder">{{ c.authorNickname?.[0] || '?' }}</div>
              <div class="comment-body">
                <div class="comment-header-line">
                  <span class="comment-author">{{ c.authorNickname || '匿名用户' }}</span>
                  <span v-if="c.authorRole === 2" class="badge badge-danger" style="font-size:10px">管理员</span>
                  <span class="comment-time">{{ formatTime(c.createdAt) }}</span>
                </div>
                <p v-if="c.content" class="comment-text">{{ c.content }}</p>
                <div v-if="c.images" class="comment-images">
                  <img v-for="(img, i) in parseImages(c.images)" :key="i" :src="img" class="comment-image" @click="previewImage(img)" />
                </div>
              </div>
            </div>
            <div v-if="userStore.isAdmin" class="comment-admin">
              <button class="btn btn-sm btn-ghost" @click="toggleCommentStatus(c)">
                {{ c.status === 1 ? '恢复' : '删除' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="comments.length === 0" class="empty-state">
          <span style="font-size:32px;display:block;margin-bottom:var(--space-2)">&#128172;</span>
          <p>暂无评论，来抢沙发吧</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  getPost, likePost, unlikePost, collectPost, uncollectPost,
  getComments, addComment, updatePostStatus, updateCommentStatus,
  uploadImage, endorsePost, unendorsePost
} from '../api/community'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const post = ref(null)
const comments = ref([])
const loading = ref(false)
const commentContent = ref('')
const commentImageUrls = ref([])
const commentFileInput = ref(null)
const commentUploading = ref(false)

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

function parseImages(imagesJson) {
  try { return JSON.parse(imagesJson) } catch { return [] }
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

function previewImage(url) {
  window.open(url, '_blank')
}

function removeCommentImage(i) {
  commentImageUrls.value.splice(i, 1)
}

async function handleCommentFileSelect(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return
  commentUploading.value = true
  try {
    for (const file of files) {
      const res = await uploadImage(file)
      commentImageUrls.value.push(res.data.url)
    }
  } catch (e) {
    alert('评论图片上传失败: ' + (e.message || '未知错误'))
  } finally {
    commentUploading.value = false
    if (commentFileInput.value) commentFileInput.value.value = ''
  }
}

async function loadPost() {
  loading.value = true
  try {
    const res = await getPost(route.params.id)
    post.value = res.data
    const cres = await getComments(route.params.id)
    comments.value = cres.data || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function toggleLike() {
  if (!post.value) return
  if (post.value.liked) {
    await unlikePost(post.value.id)
    post.value.liked = false
    post.value.likeCount = Math.max((post.value.likeCount || 0) - 1, 0)
  } else {
    await likePost(post.value.id)
    post.value.liked = true
    post.value.likeCount = (post.value.likeCount || 0) + 1
  }
}

async function toggleCollect() {
  if (!post.value) return
  if (post.value.collected) {
    await uncollectPost(post.value.id)
    post.value.collected = false
    post.value.collectCount = Math.max((post.value.collectCount || 0) - 1, 0)
  } else {
    await collectPost(post.value.id)
    post.value.collected = true
    post.value.collectCount = (post.value.collectCount || 0) + 1
  }
}

async function toggleEndorse() {
  if (!post.value) return
  try {
    if (post.value.endorsed) {
      await unendorsePost(post.value.id)
      post.value.endorsed = false
      post.value.endorseCount = Math.max((post.value.endorseCount || 0) - 1, 0)
    } else {
      await endorsePost(post.value.id)
      post.value.endorsed = true
      post.value.endorseCount = (post.value.endorseCount || 0) + 1
    }
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

async function submitComment() {
  if (!commentContent.value.trim() && commentImageUrls.value.length === 0) return
  await addComment(post.value.id, {
    content: commentContent.value.trim(),
    images: commentImageUrls.value
  })
  commentContent.value = ''
  commentImageUrls.value = []
  const cres = await getComments(post.value.id)
  comments.value = cres.data || []
}

async function togglePostStatus() {
  if (!post.value) return
  const newStatus = post.value.status === 2 ? 0 : 2
  await updatePostStatus(post.value.id, newStatus)
  post.value.status = newStatus
}

async function toggleCommentStatus(comment) {
  const newStatus = comment.status === 1 ? 0 : 1
  await updateCommentStatus(comment.id, newStatus)
  comment.status = newStatus
}

onMounted(() => {
  loadPost()
})
</script>

<style scoped>
.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}
.author {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 18px;
  font-weight: 600;
}
.author-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.author-name {
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
}
.author-role {
  font-size: 11px;
  padding: 1px 8px;
  border-radius: var(--radius-full);
  font-weight: 500;
  width: fit-content;
}
.role-study { background: #eff6ff; color: #2563eb; }
.role-job { background: #fff7ed; color: #ea580c; }
.role-admin { background: #fef2f2; color: #dc2626; }
.post-time {
  color: var(--text-muted);
  font-size: 13px;
}

.title-row {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.post-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
  line-height: 1.35;
  letter-spacing: -0.3px;
  flex: 1;
}

.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: var(--text-secondary);
  white-space: pre-wrap;
  margin-bottom: var(--space-5);
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: var(--space-3);
  margin-bottom: var(--space-5);
}
.post-image {
  width: 100%;
  border-radius: var(--radius-md);
  cursor: zoom-in;
  object-fit: cover;
  aspect-ratio: 4/3;
  border: 1px solid var(--border);
  transition: transform 0.2s;
}
.post-image:hover {
  transform: scale(1.02);
}

.tag-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.actions {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}
.action-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.15s;
  font-weight: 500;
}
.action-pill:hover {
  border-color: var(--border-hover);
  background: var(--bg);
}
.action-pill.active {
  background: var(--danger-bg);
  border-color: #fca5a5;
  color: var(--danger-text);
}
.view-count {
  margin-left: auto;
  color: var(--text-muted);
  font-size: 14px;
  display: flex;
  align-items: center;
}

.admin-bar {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px dashed var(--border);
}

.comments-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: var(--space-5);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.comment-composer {
  margin-bottom: var(--space-5);
}
.comment-composer textarea {
  width: 100%;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 15px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  background: var(--bg);
  transition: all 0.15s;
  margin-bottom: var(--space-3);
}
.comment-composer textarea:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
  background: var(--surface);
}
.composer-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.composer-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}
.file-input {
  display: none;
}
.image-preview-bar {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-3);
  flex-wrap: wrap;
}
.preview-thumb {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
}
.preview-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.thumb-remove {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0,0,0,0.6);
  color: #fff;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}
.comment-item {
  padding: var(--space-4) 0;
  border-bottom: 1px solid var(--border);
}
.comment-item:last-child {
  border-bottom: none;
}
.comment-main {
  display: flex;
  gap: var(--space-3);
}
.comment-avatar {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}
.comment-avatar.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 14px;
  font-weight: 600;
}
.comment-body {
  flex: 1;
  min-width: 0;
}
.comment-header-line {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: 6px;
}
.comment-author {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
}
.comment-time {
  font-size: 12px;
  color: var(--text-muted);
  margin-left: auto;
}
.comment-text {
  font-size: 15px;
  color: var(--text-secondary);
  line-height: 1.7;
  white-space: pre-wrap;
}
.comment-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: var(--space-2);
  margin-top: var(--space-2);
}
.comment-image {
  width: 100%;
  border-radius: var(--radius-md);
  cursor: zoom-in;
  object-fit: cover;
  aspect-ratio: 4/3;
  border: 1px solid var(--border);
}
.comment-admin {
  margin-top: var(--space-2);
  padding-left: calc(36px + var(--space-3));
}

.empty-state {
  text-align: center;
  padding: 48px 0;
  color: var(--text-muted);
}
.empty-state p {
  font-size: 14px;
}
</style>
