<template>
  <div class="post-detail-page">
    <button class="back-btn" @click="router.back()">&#8592; 返回</button>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else-if="post" class="post-detail">
      <div class="post-header">
        <div class="author">
          <img v-if="post.authorAvatar" :src="post.authorAvatar" class="author-avatar" />
          <div v-else class="author-avatar avatar-placeholder">{{ post.authorNickname?.[0] || '?' }}</div>
          <div class="author-meta">
            <span class="author-name">{{ post.authorNickname || '匿名用户' }}</span>
            <span class="author-role" :class="roleClass(post.authorRole)">{{ roleText(post.authorRole) }}</span>
          </div>
        </div>
        <span class="post-time">{{ formatTime(post.createdAt) }}</span>
      </div>

      <div class="title-row">
        <h1 class="post-title">{{ post.title }}</h1>
        <span v-if="post.isExcellent" class="excellent-badge">经验帖</span>
      </div>
      <div class="post-content">{{ post.content }}</div>

      <div v-if="post.images" class="images">
        <img v-for="(img, i) in parseImages(post.images)" :key="i" :src="img" class="post-image" @click="previewImage(img)" />
      </div>

      <div v-if="post.tags" class="tags">
        <span v-for="tag in parseTags(post.tags)" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="actions">
        <button class="action-btn" :class="{ active: post.liked }" @click="toggleLike">
          <span class="action-icon">&#9829;</span> {{ post.liked ? '已赞' : '点赞' }} {{ post.likeCount || 0 }}
        </button>
        <button class="action-btn" :class="{ active: post.collected }" @click="toggleCollect">
          <span class="action-icon">&#9733;</span> {{ post.collected ? '已收藏' : '收藏' }} {{ post.collectCount || 0 }}
        </button>
        <button class="action-btn" :class="{ active: post.endorsed }" @click="toggleEndorse">
          <span class="action-icon">&#128077;</span> {{ post.endorsed ? '已认可' : '认可' }} {{ post.endorseCount || 0 }}
        </button>
        <span class="view-count">
          <span class="action-icon">&#128065;</span> {{ post.viewCount || 0 }} 浏览
        </span>
      </div>

      <div v-if="userStore.isAdmin" class="admin-actions">
        <button class="admin-btn" @click="togglePostStatus">
          {{ post.status === 2 ? '上架帖子' : '下架帖子' }}
        </button>
      </div>
    </div>

    <div class="comments-section" v-if="post">
      <h3 class="section-title">
        评论
        <span v-if="userStore.isAdmin" class="admin-hint">（管理员可管理评论状态）</span>
      </h3>

      <div class="comment-form">
        <textarea v-model="commentContent" placeholder="写下你的评论..." rows="3"></textarea>
        <div class="comment-image-upload">
          <input type="file" accept="image/*" multiple @change="handleCommentFileSelect" ref="commentFileInput" class="file-input" />
          <button class="upload-btn" @click="commentFileInput?.click()">+ 添加图片</button>
          <span v-if="commentUploading" class="upload-progress">上传中...</span>
        </div>
        <div v-if="commentImageUrls.length" class="comment-image-preview">
          <div v-for="(img, i) in commentImageUrls" :key="i" class="preview-item">
            <img :src="img" />
            <button class="remove-img" @click="removeCommentImage(i)">×</button>
          </div>
        </div>
        <button class="submit-btn" @click="submitComment" :disabled="!commentContent.trim() && commentImageUrls.length === 0">发表评论</button>
      </div>

      <div class="comments">
        <div v-for="c in comments" :key="c.id" class="comment-item">
          <div class="comment-header">
            <div class="comment-author-info">
              <img v-if="c.authorAvatar" :src="c.authorAvatar" class="comment-author-avatar" />
              <div v-else class="comment-author-avatar avatar-placeholder">{{ c.authorNickname?.[0] || '?' }}</div>
              <span class="comment-author-name">{{ c.authorNickname || '匿名用户' }}</span>
              <span v-if="c.authorRole === 2" class="comment-author-role role-admin">管理员</span>
            </div>
            <span class="comment-time">{{ formatTime(c.createdAt) }}</span>
          </div>
          <p v-if="c.content" class="comment-content">{{ c.content }}</p>
          <div v-if="c.images" class="comment-images">
            <img v-for="(img, i) in parseImages(c.images)" :key="i" :src="img" class="comment-image" @click="previewImage(img)" />
          </div>
          <div v-if="userStore.isAdmin" class="comment-admin">
            <button class="admin-btn small" @click="toggleCommentStatus(c)">
              {{ c.status === 1 ? '恢复' : '删除' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="comments.length === 0" class="empty">暂无评论，来抢沙发吧</div>
    </div>
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
.post-detail-page {
  padding-bottom: 40px;
}
.back-btn {
  margin-bottom: 16px;
  padding: 8px 16px;
  border: none;
  background: transparent;
  color: #1a3a5c;
  font-size: 14px;
  cursor: pointer;
  font-weight: 500;
}
.back-btn:hover {
  text-decoration: underline;
}

.post-detail {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #ebe8e0;
  margin-bottom: 24px;
}

.post-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.author {
  display: flex;
  align-items: center;
  gap: 12px;
}
.author-avatar {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
}
.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a3a5c;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.author-name {
  font-weight: 600;
  font-size: 15px;
  color: #333;
}
.author-role {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 500;
  margin-left: 6px;
}
.role-study { background: #e3f2fd; color: #1565c0; }
.role-job { background: #fff3e0; color: #e65100; }
.role-admin { background: #fce4ec; color: #c2185b; }
.post-time {
  color: #aaa;
  font-size: 13px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}
.post-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
}
.excellent-badge {
  font-size: 13px;
  padding: 5px 12px;
  background: #fff8e1;
  color: #e65100;
  border-radius: 8px;
  font-weight: 600;
  white-space: nowrap;
}
.post-content {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  white-space: pre-wrap;
  margin-bottom: 20px;
}

.images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.post-image {
  width: 100%;
  border-radius: 12px;
  cursor: zoom-in;
  object-fit: cover;
  aspect-ratio: 4/3;
  border: 1px solid #eee;
}

.tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 20px;
}
.tag {
  font-size: 13px;
  padding: 5px 12px;
  background: #f0ece4;
  color: #5a5a5a;
  border-radius: 10px;
}

.actions {
  display: flex;
  gap: 16px;
  align-items: center;
  padding-top: 20px;
  border-top: 1px solid #f0ece4;
}
.action-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
  transition: all 0.2s;
}
.action-btn:hover {
  border-color: #c9a96e;
}
.action-btn.active {
  background: #fff0f0;
  border-color: #e57373;
  color: #c62828;
}
.action-icon {
  font-size: 16px;
}
.view-count {
  margin-left: auto;
  color: #888;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.admin-actions {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed #e0ddd5;
}

.comments-section {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #ebe8e0;
}
.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  margin-bottom: 20px;
  color: #1a3a5c;
}
.admin-hint {
  font-size: 12px;
  color: #c9a96e;
  font-weight: normal;
  margin-left: 8px;
}

.comment-form {
  margin-bottom: 24px;
}
.comment-form textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 12px;
  font-size: 14px;
  outline: none;
  resize: vertical;
  font-family: inherit;
  margin-bottom: 10px;
}
.comment-form textarea:focus {
  border-color: #c9a96e;
}
.submit-btn {
  padding: 10px 24px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}
.submit-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.comments {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.comment-item {
  padding: 16px;
  background: #faf9f7;
  border-radius: 12px;
}
.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.comment-author-info {
  display: flex;
  align-items: center;
  gap: 8px;
}
.comment-author-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}
.comment-author-avatar.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a3a5c;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}
.comment-author-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.comment-author-role {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 8px;
  font-weight: 500;
}
.comment-time {
  font-size: 12px;
  color: #aaa;
}
.comment-content {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
}
.comment-admin {
  margin-top: 8px;
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
.admin-btn.small {
  padding: 4px 10px;
  font-size: 12px;
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

.comment-image-upload {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}
.comment-image-upload .file-input {
  display: none;
}
.comment-image-upload .upload-btn {
  padding: 6px 14px;
  border: 1.5px dashed #c9a96e;
  background: #fffaf0;
  color: #8a6d3b;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
}
.comment-image-upload .upload-progress {
  color: #c9a96e;
  font-size: 13px;
}
.comment-image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
  margin-bottom: 12px;
}
.comment-image-preview .preview-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
}
.comment-image-preview .preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.comment-image-preview .remove-img {
  position: absolute;
  top: 3px;
  right: 3px;
  width: 20px;
  height: 20px;
  border: none;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
}
.comment-images {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 8px;
}
.comment-image {
  width: 100%;
  border-radius: 8px;
  cursor: zoom-in;
  object-fit: cover;
  aspect-ratio: 4/3;
  border: 1px solid #eee;
}
</style>