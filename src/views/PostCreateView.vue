<template>
  <div class="page-container create-page">
    <div class="page-header">
      <h2>发布新帖</h2>
    </div>

    <div class="card">
      <div class="field">
        <label>标题 *</label>
        <input v-model="form.title" placeholder="一句话描述你的问题或分享" maxlength="120" />
      </div>

      <div class="field">
        <label>内容</label>
        <textarea v-model="form.content" placeholder="详细描述..." rows="8" />
      </div>

      <div class="field">
        <label>场景</label>
        <div class="segmented">
          <button :class="{ active: form.scene === 0 }" @click="form.scene = 0">考研备考</button>
          <button :class="{ active: form.scene === 1 }" @click="form.scene = 1">求职</button>
        </div>
      </div>

      <div class="field">
        <label>标签</label>
        <input v-model="tagInput" placeholder="输入标签，按回车添加" @keyup.enter="addTag" />
        <div v-if="tags.length" class="tag-bar">
          <span v-for="(tag, i) in tags" :key="i" class="tag-chip">
            {{ tag }}
            <button class="tag-remove" @click="tags.splice(i, 1)">&times;</button>
          </span>
        </div>
      </div>

      <div class="field">
        <label>图片</label>
        <div class="upload-zone" @click="fileInput?.click()">
          <input type="file" accept="image/*" multiple @change="handleFileSelect" ref="fileInput" class="file-input" />
          <span class="upload-icon"><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></span>
          <span class="upload-text">点击选择图片，或拖拽到此处</span>
        </div>
        <div v-if="uploading" class="upload-hint">上传中...</div>
        <div v-if="imageUrls.length" class="image-grid">
          <div v-for="(img, i) in imageUrls" :key="i" class="image-thumb">
            <img :src="img" />
            <button class="thumb-remove" @click.stop="removeImage(i)">&times;</button>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary btn-lg" @click="submit" :disabled="!form.title.trim() || submitting">
          {{ submitting ? '发布中...' : '发布帖子' }}
        </button>
        <button class="btn btn-secondary" @click="router.back()">取消</button>
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { createPost, uploadImage } from '../api/community'

const router = useRouter()
const fileInput = ref(null)
const tagInput = ref('')
const tags = ref([])
const imageUrls = ref([])
const uploading = ref(false)
const submitting = ref(false)
const error = ref('')

const form = reactive({
  title: '',
  content: '',
  scene: 0,
  tags: '',
  images: ''
})

function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) {
    tags.value.push(t)
  }
  tagInput.value = ''
}

function removeImage(i) {
  imageUrls.value.splice(i, 1)
}

async function handleFileSelect(e) {
  const files = Array.from(e.target.files)
  if (!files.length) return
  uploading.value = true
  error.value = ''
  try {
    for (const file of files) {
      const res = await uploadImage(file)
      imageUrls.value.push(res.data.url)
    }
  } catch (e) {
    error.value = '图片上传失败: ' + (e.message || '未知错误')
  } finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function submit() {
  error.value = ''
  if (!form.title.trim()) return
  submitting.value = true
  try {
    form.tags = JSON.stringify(tags.value)
    form.images = JSON.stringify(imageUrls.value)
    await createPost(form)
    router.push('/')
  } catch (e) {
    error.value = e.message || '发布失败'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.create-page {
  max-width: 720px;
}

.card {
  padding: var(--space-8);
}

.tag-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-top: var(--space-3);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--primary-light);
  color: var(--primary);
  border-radius: var(--radius-sm);
  font-size: 13px;
  font-weight: 500;
}

.tag-remove {
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  padding: 0 2px;
  opacity: 0.6;
  transition: opacity 0.15s;
}

.tag-remove:hover {
  opacity: 1;
}

.upload-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-8);
  border: 2px dashed var(--border);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: all 0.2s;
  background: var(--bg);
}

.upload-zone:hover {
  border-color: var(--primary);
  background: var(--primary-light);
}

.file-input {
  display: none;
}

.upload-icon {
  font-size: 28px;
  opacity: 0.5;
}

.upload-text {
  font-size: 14px;
  color: var(--text-muted);
}

.upload-hint {
  color: var(--primary);
  font-size: 13px;
  margin-top: var(--space-2);
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--space-3);
  margin-top: var(--space-4);
}

.image-thumb {
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  aspect-ratio: 1;
  border: 1px solid var(--border);
}

.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumb-remove {
  position: absolute;
  top: 6px;
  right: 6px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 14px;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
}

.thumb-remove:hover {
  background: rgba(0, 0, 0, 0.7);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
}

.form-error {
  color: var(--danger);
  margin-top: var(--space-3);
  font-size: 14px;
}
</style>
