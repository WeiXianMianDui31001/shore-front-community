<template>
  <div class="page-container">
    <div class="page-header">
      <h2>个人中心</h2>
      <p class="page-desc">管理你的个人资料</p>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="profile-card card" style="max-width: 520px;">
      <div class="avatar-section">
        <label class="avatar-upload-label">
          <img v-if="form.avatarUrl" :src="form.avatarUrl" class="avatar-large" />
          <div v-else class="avatar-large avatar-placeholder">{{ form.nickname?.[0] || '?' }}</div>
          <input type="file" accept="image/*" @change="handleAvatarChange" class="avatar-file-input" />
          <div class="avatar-upload-hint">点击更换头像</div>
        </label>
      </div>

      <div class="form-section">
        <div class="field">
          <label>邮箱</label>
          <input :value="form.email" disabled />
        </div>

        <div class="field">
          <label>昵称</label>
          <input v-model="form.nickname" placeholder="设置你的昵称" maxlength="32" />
        </div>

        <div class="form-row">
          <div class="field">
            <label>身份</label>
            <select v-model="form.role">
              <option :value="0">备考用户</option>
              <option :value="1">求职用户</option>
            </select>
          </div>
          <div class="field">
            <label>当前积分</label>
            <input :value="form.pointsBalance || 0" disabled />
          </div>
        </div>

        <button class="btn btn-primary btn-lg" @click="saveProfile" :disabled="saving">
          {{ saving ? '保存中...' : '保存修改' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getUserInfo, updateProfile, uploadAvatar } from '../api/user'

const userStore = useUserStore()

const form = ref({
  email: '',
  nickname: '',
  avatarUrl: '',
  role: 0,
  pointsBalance: 0
})
const loading = ref(false)
const saving = ref(false)

function roleText(role) {
  if (role === 0) return '备考用户'
  if (role === 1) return '求职用户'
  if (role === 2) return '管理员'
  return ''
}

async function loadProfile() {
  loading.value = true
  try {
    const res = await getUserInfo()
    form.value = res.data || {}
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleAvatarChange(e) {
  const file = e.target.files[0]
  if (!file) return
  try {
    const res = await uploadAvatar(file)
    form.value.avatarUrl = res.data.url
    const updated = { ...userStore.userInfo, avatarUrl: form.value.avatarUrl }
    userStore.setUserInfo(updated)
    alert('头像上传成功')
  } catch (e) {
    alert(e.message || '头像上传失败')
  } finally {
    e.target.value = ''
  }
}

async function saveProfile() {
  saving.value = true
  try {
    await updateProfile({
      nickname: form.value.nickname,
      avatarUrl: form.value.avatarUrl,
      role: form.value.role
    })
    const updated = { ...userStore.userInfo, nickname: form.value.nickname, avatarUrl: form.value.avatarUrl, role: form.value.role }
    userStore.setUserInfo(updated)
    alert('保存成功')
  } catch (e) {
    alert(e.message || '保存失败')
  } finally {
    saving.value = false
  }
}

onMounted(() => {
  loadProfile()
})
</script>

<style scoped>
.profile-card {
  padding: var(--space-8);
}

.avatar-section {
  display: flex;
  justify-content: center;
  margin-bottom: var(--space-6);
}

.avatar-upload-label {
  position: relative;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.avatar-file-input {
  display: none;
}

.avatar-large {
  width: 96px;
  height: 96px;
  border-radius: var(--radius-full);
  object-fit: cover;
  border: 3px solid var(--border);
  transition: opacity 0.2s;
}

.avatar-upload-label:hover .avatar-large {
  opacity: 0.8;
}

.avatar-large.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 36px;
  font-weight: 600;
}

.avatar-upload-hint {
  margin-top: var(--space-2);
  font-size: 12px;
  color: var(--text-muted);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.form-row {
  display: flex;
  gap: var(--space-4);
}

.form-row .field {
  flex: 1;
}
</style>
