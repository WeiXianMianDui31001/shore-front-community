<template>
  <div class="page-container upload-page">
    <div class="page-header">
      <h2>上传资源</h2>
    </div>

    <div class="card">
      <div class="field">
        <label>标题 *</label>
        <input v-model="form.title" placeholder="给资源起个清晰的标题" maxlength="120" />
      </div>

      <div class="field">
        <label>分类 *</label>
        <div class="category-pills">
          <button v-for="cat in categories" :key="cat" :class="{ active: form.category === cat }" @click="form.category = cat">
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="field">
        <label>简介</label>
        <textarea v-model="form.description" placeholder="简要描述资源内容..." rows="4" />
      </div>

      <div class="field">
        <label>文件 *</label>
        <div class="upload-zone" v-if="!selectedFile" @click="fileInput?.click()">
          <input type="file" @change="handleFileSelect" ref="fileInput" class="file-input" />
          <span class="upload-icon">&#128193;</span>
          <span class="upload-text">点击选择文件</span>
          <span class="upload-hint">支持 PDF、Word、PPT、ZIP 等格式</span>
        </div>
        <div v-else class="file-selected">
          <div class="file-info">
            <span class="file-name">{{ selectedFile.name }}</span>
            <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
          </div>
          <button class="btn btn-secondary btn-sm" @click.stop="removeFile">更换</button>
        </div>
        <div v-if="fileUploading" class="upload-progress">上传中... {{ uploadProgress }}%</div>
      </div>

      <div class="points-tip">
        <span class="tip-label">下载积分定价：</span>
        <span class="tip-value">按当前规则自动计算</span>
        <span class="tip-hint">（管理员审核通过后生效）</span>
      </div>

      <div class="form-actions">
        <button class="btn btn-primary btn-lg" @click="submit" :disabled="!canSubmit || submitting">
          {{ submitting ? '提交中...' : '提交审核' }}
        </button>
        <button class="btn btn-secondary" @click="router.back()">取消</button>
      </div>

      <p v-if="error" class="form-error">{{ error }}</p>
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
  uploadId: ''
})

const canSubmit = computed(() => {
  return form.title.trim() && form.category && form.uploadId
})

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
}

.card {
  padding: var(--space-8);
}

.category-pills {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.category-pills button {
  padding: 8px 16px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.category-pills button:hover {
  border-color: var(--border-hover);
}

.category-pills button.active {
  background: var(--primary);
  color: var(--text-on-primary);
  border-color: var(--primary);
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
  font-size: 32px;
  opacity: 0.4;
}

.upload-text {
  font-size: 15px;
  color: var(--text-secondary);
}

.upload-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.file-name {
  font-weight: 500;
  font-size: 14px;
  color: var(--text);
}

.file-size {
  font-size: 12px;
  color: var(--text-muted);
}

.upload-progress {
  margin-top: var(--space-2);
  color: var(--primary);
  font-size: 13px;
}

.points-tip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-4) var(--space-5);
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-5);
}

.tip-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.tip-value {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.tip-hint {
  font-size: 12px;
  color: var(--text-muted);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
}

.form-error {
  color: var(--danger);
  margin-top: var(--space-3);
  font-size: 14px;
}
</style>
