<template>
  <div class="login-page">
    <div class="login-card">
      <div class="brand">
        <span class="brand-icon">&#9670;</span>
        <h1>岸上见</h1>
      </div>
      <p class="subtitle">社区 Demo</p>

      <div class="tabs">
        <button
          v-for="tab in ['login', 'register']"
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          {{ tab === 'login' ? '登录' : '注册' }}
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <label>邮箱</label>
          <input v-model="form.email" type="email" placeholder="your@email.com" required />
        </div>

        <div v-if="activeTab === 'register'" class="field">
          <label>验证码</label>
          <div class="verify-row">
            <input v-model="form.verifyCode" placeholder="123456" required />
            <button type="button" class="btn-small" @click="sendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取验证码' }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>密码</label>
          <input v-model="form.password" type="password" placeholder="******" required />
        </div>

        <div v-if="activeTab === 'register'" class="field">
          <label>身份</label>
          <select v-model="form.role" required>
            <option :value="0">考研备考</option>
            <option :value="1">求职</option>
          </select>
        </div>

        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? '处理中...' : (activeTab === 'login' ? '登录' : '注册') }}
        </button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { login, register, getMe, sendVerifyCode } from '../api/auth'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const error = ref('')
const countdown = ref(0)

const form = reactive({
  email: '',
  password: '',
  verifyCode: '',
  role: 0
})

async function sendCode() {
  if (!form.email) {
    error.value = '请先填写邮箱'
    return
  }
  error.value = ''
  try {
    await sendVerifyCode({ email: form.email, scene: 'REGISTER' })
    countdown.value = 60
    const timer = setInterval(() => {
      countdown.value--
      if (countdown.value <= 0) clearInterval(timer)
    }, 1000)
  } catch (e) {
    error.value = e.message || '发送失败'
  }
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    let res
    if (activeTab.value === 'login') {
      res = await login({ email: form.email, password: form.password })
    } else {
      res = await register({
        email: form.email,
        password: form.password,
        verifyCode: form.verifyCode,
        role: form.role
      })
    }
    const data = res.data
    userStore.setToken(data.accessToken)
    const meRes = await getMe()
    userStore.setUserInfo(meRes.data)
    router.push('/')
  } catch (e) {
    error.value = e.message || '请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(160deg, #1a3a5c 0%, #2d5a87 40%, #c9a96e 100%);
}
.login-card {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.25);
}
.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 4px;
}
.brand-icon {
  color: #c9a96e;
  font-size: 22px;
}
h1 {
  font-family: 'Noto Serif SC', serif;
  text-align: center;
  font-size: 28px;
  color: #1a3a5c;
}
.subtitle {
  text-align: center;
  color: #999;
  font-size: 14px;
  margin-bottom: 28px;
}
.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.tabs button {
  flex: 1;
  padding: 10px;
  border: none;
  background: #f5f3ef;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  font-weight: 500;
  color: #666;
}
.tabs button.active {
  background: #1a3a5c;
  color: #fff;
}
.field {
  margin-bottom: 16px;
}
.field label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 6px;
  font-weight: 500;
}
.field input,
.field select {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid #e8e4dc;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: border 0.2s;
  background: #faf9f7;
}
.field input:focus,
.field select:focus {
  border-color: #c9a96e;
}
.verify-row {
  display: flex;
  gap: 8px;
}
.verify-row input {
  flex: 1;
}
.btn-small {
  padding: 0 16px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  white-space: nowrap;
  transition: opacity 0.2s;
}
.btn-small:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn-primary {
  width: 100%;
  padding: 13px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 10px;
  font-size: 15px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.2s;
  font-weight: 600;
}
.btn-primary:hover {
  background: #0f2540;
}
.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.error {
  color: #c0392b;
  text-align: center;
  font-size: 13px;
  margin-top: 14px;
}
</style>
