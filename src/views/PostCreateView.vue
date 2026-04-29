<template>
  <div class="create-page">
    <h2 class="page-title">发布新帖</h2>

    <div class="form">
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
        <div class="scene-options">
          <button :class="{ active: form.scene === 0 }" @click="form.scene = 0">考研备考</button>
          <button :class="{ active: form.scene === 1 }" @click="form.scene = 1">求职</button>
        </div>
      </div>

      <div class="field">
        <label>标签</label>
        <input v-model="tagInput" placeholder="输入标签，按回车添加" @keyup.enter="addTag" />
        <div class="tag-list">
          <span v-for="(tag, i) in tags" :key="i" class="tag">
            {{ tag }}
            <button class="tag-remove" @click="tags.splice(i, 1)">&times;</button>
          </span>
        </div>
      </div>

      <div class="field">
        <label>图片</label>
        <div class="image-upload">
          <input type="file" accept="image/*" multiple @change="handleFileSelect" ref="fileInput" class="file-input" />
          <button class="upload-btn" @click="fileInput?.click()">+ 选择图片</button>
        </div>
        <div v-if="uploading" class="upload-progress">上传中...</div>
        <div class="image-preview">
          <div v-for="(img, i) in imageUrls" :key="i" class="preview-item">
            <img :src="img" />
            <button class="remove-img" @click="removeImage(i)">&times;</button>
          </div>
        </div>
      </div>

      <div class="actions">
        <button class="btn-submit" @click="submit" :disabled="!form.title.trim() || submitting">
          {{ submitting ? '发布中...' : '发布帖子' }}
        </button>
        <button class="btn-cancel" @click="router.back()">取消</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
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
  margin: 0 auto;
}
.page-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 26px;
  color: #1a3a5c;
  margin-bottom: 24px;
}

.form {
  background: #fff;
  border-radius: 20px;
  padding: 32px;
  border: 1px solid #ebe8e0;
}

.field {
  margin-bottom: 22px;
}
.field label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #444;
  margin-bottom: 8px;
}
.field input,
.field textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 12px;
  font-size: 15px;
  outline: none;
  font-family: inherit;
  background: #faf9f7;
}
.field input:focus,
.field textarea:focus {
  border-color: #c9a96e;
}

.scene-options {
  display: flex;
  gap: 12px;
}
.scene-options button {
  padding: 10px 24px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}
.scene-options button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}

.tag-list {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
}
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  background: #f0ece4;
  color: #5a5a5a;
  border-radius: 10px;
  font-size: 13px;
}
.tag-remove {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.image-upload {
  margin-bottom: 10px;
}
.file-input {
  display: none;
}
.upload-btn {
  padding: 10px 20px;
  border: 1.5px dashed #c9a96e;
  background: #fffaf0;
  color: #8a6d3b;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
}
.upload-progress {
  color: #c9a96e;
  font-size: 13px;
  margin-bottom: 8px;
}
.image-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 10px;
}
.preview-item {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  aspect-ratio: 1;
}
.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.remove-img {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  border: none;
  background: rgba(0,0,0,0.5);
  color: #fff;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}
.btn-submit {
  padding: 12px 32px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-cancel {
  padding: 12px 32px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  color: #555;
  border-radius: 12px;
  cursor: pointer;
  font-size: 15px;
}
.error {
  color: #c0392b;
  margin-top: 14px;
  font-size: 14px;
}
</style>
