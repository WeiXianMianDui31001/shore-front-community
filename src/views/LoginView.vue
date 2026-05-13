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
            <button type="button" class="btn btn-primary btn-sm" @click="sendCode" :disabled="countdown > 0">
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

        <button type="submit" class="btn btn-primary btn-lg" :disabled="loading" style="width: 100%; margin-top: var(--space-3);">
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
  background: var(--bg);
}

.login-card {
  width: 400px;
  padding: var(--space-8);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.brand {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-bottom: 4px;
}

.brand-icon {
  color: var(--primary);
  font-size: 22px;
}

h1 {
  text-align: center;
  font-size: 28px;
  color: var(--primary);
  font-weight: 700;
}

.subtitle {
  text-align: center;
  color: var(--text-muted);
  font-size: 14px;
  margin-bottom: var(--space-6);
}

.tabs {
  display: flex;
  gap: var(--space-1);
  margin-bottom: var(--space-5);
  padding: var(--space-1);
  background: var(--bg);
  border-radius: var(--radius-md);
}

.tabs button {
  flex: 1;
  padding: var(--space-2);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.15s;
}

.tabs button:hover {
  color: var(--text-secondary);
}

.tabs button.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-sm);
}

.verify-row {
  display: flex;
  gap: var(--space-2);
}

.verify-row input {
  flex: 1;
}

.error {
  color: var(--danger);
  text-align: center;
  font-size: 13px;
  margin-top: var(--space-3);
}
</style>
