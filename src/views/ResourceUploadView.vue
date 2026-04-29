<template>
  <div class="upload-page">
    <button class="back-btn" @click="router.back()">&#8592; 返回</button>
    <h2 class="page-title">上传资源</h2>

    <div class="form">
      <div class="field">
        <label>标题 *</label>
        <input v-model="form.title" placeholder="给资源起个清晰的标题" maxlength="120" />
      </div>

      <div class="field">
        <label>分类 *</label>
        <div class="category-options">
          <button v-for="cat in categories" :key="cat" :class="{ active: form.category === cat }" @click="form.category = cat">
            {{ cat }}
          </button>
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
        <label>简介</label>
        <textarea v-model="form.description" placeholder="简要描述资源内容..." rows="4" />
      </div>

      <div class="field">
        <label>文件 *</label>
        <div class="file-upload-area" v-if="!selectedFile">
          <input type="file" @change="handleFileSelect" ref="fileInput" class="file-input" />
          <button class="upload-trigger" @click="fileInput?.click()">
            <span class="upload-icon">&#128193;</span>
            <span>点击选择文件</span>
            <span class="upload-hint">支持 PDF、Word、PPT、ZIP 等格式</span>
          </button>
        </div>
        <div v-else class="file-selected">
          <div class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button class="file-remove" @click="removeFile">更换</button>
        </div>
        <div v-if="fileUploading" class="upload-progress">上传中... {{ uploadProgress }}%</div>
      </div>

      <div class="points-info">
        <span class="points-label">下载积分定价：</span>
        <span class="points-value">按当前规则自动计算</span>
        <span class="points-hint">（管理员审核通过后生效）</span>
      </div>

      <div class="actions">
        <button class="btn-submit" @click="submit" :disabled="!canSubmit || submitting">
          {{ submitting ? '提交中...' : '提交审核' }}
        </button>
        <button class="btn-cancel" @click="router.back()">取消</button>
      </div>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { prepareResourceUpload, submitResource } from '../api/resource'
import { getCategories } from '../api/resource'

const router = useRouter()
const fileInput = ref(null)
const tagInput = ref('')
const tags = ref([])
const selectedFile = ref(null)
const fileUploading = ref(false)
const uploadProgress = ref(0)
const submitting = ref(false)
const error = ref('')
const categories = ref([])

const form = reactive({
  title: '',
  category: '',
  description: '',
  tags: '',
  uploadId: ''
})

const canSubmit = computed(() => {
  return form.title.trim() && form.category && form.uploadId
})

function addTag() {
  const t = tagInput.value.trim()
  if (t && !tags.value.includes(t)) {
    tags.value.push(t)
  }
  tagInput.value = ''
}

function formatFileSize(size) {
  if (size < 1024) return size + ' B'
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB'
  return (size / (1024 * 1024)).toFixed(1) + ' MB'
}

function removeFile() {
  selectedFile.value = null
  form.uploadId = ''
  if (fileInput.value) fileInput.value.value = ''
}

async function handleFileSelect(e) {
  const file = e.target.files[0]
  if (!file) return
  selectedFile.value = file
  error.value = ''
  fileUploading.value = true
  uploadProgress.value = 0

  try {
    const res = await prepareResourceUpload({
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream'
    })
    const { preSignedUrl, uploadId } = res.data

    const blob = new Blob([await file.arrayBuffer()])
    const uploadRes = await fetch(preSignedUrl, {
      method: 'PUT',
      body: blob
    })
    if (!uploadRes.ok) {
      throw new Error(`OSS 上传失败 (${uploadRes.status})`)
    }

    form.uploadId = uploadId
    uploadProgress.value = 100
  } catch (e) {
    error.value = '文件上传失败: ' + (e.message || '未知错误')
    selectedFile.value = null
    form.uploadId = ''
  } finally {
    fileUploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}

async function submit() {
  error.value = ''
  if (!form.title.trim()) {
    error.value = '请填写标题'
    return
  }
  if (!form.category) {
    error.value = '请选择分类'
    return
  }
  if (!form.uploadId) {
    error.value = '请上传文件'
    return
  }

  submitting.value = true
  try {
    form.tags = JSON.stringify(tags.value)
    await submitResource(form)
    router.push('/resources')
  } catch (e) {
    error.value = e.message || '提交失败'
  } finally {
    submitting.value = false
  }
}

getCategories().then(res => {
  categories.value = res.data || []
})
</script>

<style scoped>
.upload-page {
  max-width: 720px;
  margin: 0 auto;
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

.category-options {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
.category-options button {
  padding: 10px 20px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  color: #555;
}
.category-options button.active {
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

.file-input {
  display: none;
}
.file-upload-area {
  border: 2px dashed #e0ddd5;
  border-radius: 12px;
  overflow: hidden;
}
.upload-trigger {
  width: 100%;
  padding: 40px 20px;
  border: none;
  background: #faf9f7;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #666;
  font-size: 14px;
}
.upload-trigger:hover {
  background: #f5f3ee;
}
.upload-icon {
  font-size: 32px;
}
.upload-hint {
  font-size: 12px;
  color: #aaa;
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  background: #e8f5e9;
  border-radius: 12px;
}
.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.file-name {
  font-weight: 500;
  font-size: 14px;
  color: #333;
}
.file-size {
  font-size: 12px;
  color: #666;
}
.file-remove {
  padding: 6px 14px;
  border: 1px solid #c9a96e;
  background: #fff;
  color: #8a6d3b;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
}

.upload-progress {
  margin-top: 8px;
  color: #c9a96e;
  font-size: 13px;
}

.points-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 18px;
  background: #fff8e1;
  border-radius: 12px;
  margin-bottom: 22px;
}
.points-label {
  font-size: 14px;
  color: #555;
}
.points-value {
  font-size: 16px;
  font-weight: 700;
  color: #e65100;
}
.points-hint {
  font-size: 12px;
  color: #888;
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
