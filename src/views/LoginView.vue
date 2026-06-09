<template>
  <div class="login-page">
    <!-- 动态粒子网格背景 -->
    <canvas ref="bgCanvas" class="bg-canvas" />

    <!-- 浮动光球 -->
    <div class="orb orb-1" />
    <div class="orb orb-2" />
    <div class="orb orb-3" />

    <!-- 登录卡片 -->
    <div class="login-card">
      <div class="brand">
        <div class="brand-mark">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2l7 7-7 7-7-7z" class="diamond-top"/>
            <path d="M12 9l7 7-7 7-7-7z" class="diamond-bot"/>
          </svg>
        </div>
        <h1>岸上见</h1>
        <p class="brand-tagline">SHORE · 备考求职 终将上岸</p>
      </div>

      <div class="tabs">
        <button
          v-for="tab in ['login', 'register']"
          :key="tab"
          :class="{ active: activeTab === tab }"
          @click="activeTab = tab"
        >
          <span class="tab-label">{{ tab === 'login' ? '登 录' : '注 册' }}</span>
          <span v-if="activeTab === tab" class="tab-underline" />
        </button>
      </div>

      <form @submit.prevent="handleSubmit">
        <div class="field">
          <div class="input-glass">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            <input v-model="form.email" type="email" placeholder="your@email.com" required />
          </div>
        </div>

        <div v-if="activeTab === 'register'" class="field">
          <div class="verify-row">
            <div class="input-glass" style="flex:1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input v-model="form.verifyCode" placeholder="验证码" required />
            </div>
            <button type="button" class="btn-code" @click="sendCode" :disabled="countdown > 0">
              {{ countdown > 0 ? `${countdown}s` : '获取' }}
            </button>
          </div>
        </div>

        <div class="field">
          <div class="input-glass">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            <input v-model="form.password" type="password" placeholder="密码" required />
          </div>
        </div>

        <div v-if="activeTab === 'register'" class="field">
          <div class="input-glass">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <select v-model="form.role" required>
              <option :value="0">考研备考</option>
              <option :value="1">求职</option>
            </select>
          </div>
        </div>

        <button type="submit" class="btn-submit" :disabled="loading">
          <span v-if="loading" class="spinner" />
          <span class="submit-text">{{ loading ? '处理中...' : (activeTab === 'login' ? '登 录' : '注 册') }}</span>
          <div v-if="!loading" class="btn-shine" />
        </button>
      </form>

      <p v-if="error" class="error-msg">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { login, register, getMe, sendVerifyCode } from '../api/auth'

const router = useRouter()
const userStore = useUserStore()

const activeTab = ref('login')
const loading = ref(false)
const error = ref('')
const countdown = ref(0)
const bgCanvas = ref(null)

const form = reactive({
  email: '',
  password: '',
  verifyCode: '',
  role: 0
})

/* ---- 粒子背景 ---- */
let animId = null
let particles = []
let mouse = { x: -1000, y: -1000 }

function initCanvas() {
  const c = bgCanvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  const dpr = window.devicePixelRatio || 1
  const setSize = () => {
    c.width = window.innerWidth * dpr
    c.height = window.innerHeight * dpr
    c.style.width = window.innerWidth + 'px'
    c.style.height = window.innerHeight + 'px'
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(dpr, dpr)
    initParticles()
  }

  function initParticles() {
    const count = Math.floor((window.innerWidth * window.innerHeight) / 6000)
    particles = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.6 + 0.4,
      o: Math.random() * 0.5 + 0.2
    }))
  }

  function draw() {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)

    // 连线
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      p.x += p.vx
      p.y += p.vy
      if (p.x < 0) p.x = window.innerWidth
      if (p.x > window.innerWidth) p.x = 0
      if (p.y < 0) p.y = window.innerHeight
      if (p.y > window.innerHeight) p.y = 0

      ctx.beginPath()
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(99,102,241,${p.o})`
      ctx.fill()

      // 鼠标引力
      const dx = mouse.x - p.x
      const dy = mouse.y - p.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist < 150) {
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(mouse.x, mouse.y)
        const alpha = (1 - dist / 150) * 0.12
        ctx.strokeStyle = `rgba(99,102,241,${alpha})`
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // 近邻连线
      for (let j = i + 1; j < particles.length; j++) {
        const q = particles[j]
        const d = Math.sqrt((p.x - q.x) ** 2 + (p.y - q.y) ** 2)
        if (d < 80) {
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(q.x, q.y)
          ctx.strokeStyle = `rgba(148,163,184,${(1 - d / 80) * 0.07})`
          ctx.lineWidth = 0.4
          ctx.stroke()
        }
      }
    }

    animId = requestAnimationFrame(draw)
  }

  window.addEventListener('resize', setSize)
  setSize()
  draw()

  return () => {
    cancelAnimationFrame(animId)
    window.removeEventListener('resize', setSize)
  }
}

function onMouseMove(e) {
  mouse.x = e.clientX
  mouse.y = e.clientY
}

onMounted(() => {
  window.addEventListener('mousemove', onMouseMove)
  const cleanup = initCanvas()
  onUnmounted(() => {
    window.removeEventListener('mousemove', onMouseMove)
    if (cleanup) cleanup()
  })
})

/* ---- 业务逻辑 ---- */
async function sendCode() {
  if (!form.email) { error.value = '请先填写邮箱'; return }
  error.value = ''
  try {
    await sendVerifyCode({ email: form.email, scene: 'REGISTER' })
    countdown.value = 60
    const timer = setInterval(() => { countdown.value--; if (countdown.value <= 0) clearInterval(timer) }, 1000)
  } catch (e) { error.value = e.message || '发送失败' }
}

async function handleSubmit() {
  error.value = ''
  loading.value = true
  try {
    let res
    if (activeTab.value === 'login') {
      res = await login({ email: form.email, password: form.password })
    } else {
      res = await register({ email: form.email, password: form.password, verifyCode: form.verifyCode, role: form.role })
    }
    const data = res.data
    userStore.setToken(data.accessToken)
    const meRes = await getMe()
    userStore.setUserInfo(meRes.data)
    router.push('/')
  } catch (e) { error.value = e.message || '请求失败' }
  finally { loading.value = false }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: radial-gradient(ellipse at 50% 0%, #e8ecf5 0%, #eef1f7 40%, #f1f5f9 100%);
}

/* ---- Canvas 粒子 ---- */
.bg-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* ---- 背景图片 ---- */
.login-page::before {
  content: '';
  position: absolute;
  inset: -10%;
  background: url('/pic/bg.png') no-repeat center center / cover;
  opacity: 0.1;
  pointer-events: none;
  z-index: 0;
  transform: translate(calc(var(--mx, 0) * 1px), calc(var(--my, 0) * 1px)) scale(1.1);
  transition: transform 0.4s cubic-bezier(0.33, 0.66, 0.55, 0.99);
}

/* ---- 浮动光球 ---- */
.orb {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  animation: orbFloat 10s ease-in-out infinite;
}
.orb-1 {
  width: 520px; height: 520px;
  top: -15%; right: -8%;
  background: radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%);
  animation-delay: 0s;
}
.orb-2 {
  width: 380px; height: 380px;
  bottom: -10%; left: -5%;
  background: radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%);
  animation-delay: 5s;
}
.orb-3 {
  width: 300px; height: 300px;
  top: 45%; left: 55%;
  background: radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%);
  animation-delay: 2.5s;
}
@keyframes orbFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%  { transform: translate(40px, -30px) scale(1.12); }
  50%  { transform: translate(-20px, 25px) scale(0.95); }
  75%  { transform: translate(-35px, -15px) scale(1.06); }
}

/* ---- 卡片 ---- */
.login-card {
  position: relative;
  z-index: 1;
  width: 420px;
  padding: 44px 36px 36px;
  background: rgba(248,250,252,0.38);
  backdrop-filter: blur(32px) saturate(180%);
  -webkit-backdrop-filter: blur(32px) saturate(180%);
  border-radius: 22px;
  border: 1px solid rgba(255,255,255,0.55);
  border-bottom-color: rgba(226,232,240,0.3);
  box-shadow:
    0 20px 60px rgba(99,102,241,0.07),
    0 4px 16px rgba(0,0,0,0.04),
    inset 0 1px 0 rgba(255,255,255,0.45);
  animation: cardIn 0.7s cubic-bezier(0.22, 0.61, 0.36, 1);
  overflow: hidden;
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(30px) scale(0.94); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

/* ---- 品牌 ---- */
.brand {
  text-align: center;
  margin-bottom: 28px;
}
.brand-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px; height: 56px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1));
  border: 1px solid rgba(99,102,241,0.15);
  margin-bottom: 14px;
  animation: iconPulse 3s ease-in-out infinite;
}
.brand-mark svg { color: var(--primary); }
.diamond-top { opacity: 0.9; }
.diamond-bot { opacity: 0.35; }
@keyframes iconPulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0.2); }
  50% { box-shadow: 0 0 0 12px rgba(99,102,241,0); }
}
h1 {
  font-size: 32px;
  font-weight: 700;
  letter-spacing: 1px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #6366f1);
  background-size: 200% 100%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: textShine 3s ease-in-out infinite;
}
@keyframes textShine {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.brand-tagline {
  font-size: 11px;
  color: var(--text-muted);
  letter-spacing: 3px;
  text-transform: uppercase;
  margin-top: 4px;
}

/* ---- 标签切换 ---- */
.tabs {
  display: flex;
  gap: 0;
  margin-bottom: 28px;
  border-bottom: 1px solid rgba(226,232,240,0.5);
}
.tabs button {
  flex: 1;
  position: relative;
  padding: 10px 0 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color 0.3s;
}
.tabs button:hover { color: var(--text-secondary); }
.tabs button.active { color: var(--primary); font-weight: 600; }
.tab-underline {
  position: absolute;
  bottom: -1px;
  left: 15%; right: 15%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  border-radius: 1px;
  animation: underlineIn 0.3s ease;
}
@keyframes underlineIn {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}

/* ---- 输入框 ---- */
.field { margin-bottom: 16px; }
.input-glass {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  background: rgba(248,250,252,0.55);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(226,232,240,0.5);
  border-radius: 12px;
  transition: all 0.3s;
}
.input-glass:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 4px rgba(99,102,241,0.08), 0 0 20px rgba(99,102,241,0.06);
  background: rgba(255,255,255,0.75);
}
.input-glass svg { color: var(--text-muted); flex-shrink: 0; transition: color 0.3s; }
.input-glass:focus-within svg { color: var(--primary); }
.input-glass input,
.input-glass select {
  flex: 1;
  padding: 13px 0;
  border: none;
  background: transparent;
  font-size: 14px;
  outline: none;
  color: var(--text);
  font-family: inherit;
}
.input-glass input::placeholder { color: var(--text-muted); }

.verify-row {
  display: flex;
  gap: 10px;
  align-items: center;
}
.btn-code {
  height: 46px;
  padding: 0 16px;
  border: 1px solid rgba(99,102,241,0.2);
  background: rgba(99,102,241,0.08);
  border-radius: 12px;
  color: var(--primary);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;
}
.btn-code:hover:not(:disabled) {
  background: rgba(99,102,241,0.15);
  border-color: var(--primary);
}
.btn-code:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ---- 提交按钮 ---- */
.btn-submit {
  position: relative;
  width: 100%;
  height: 48px;
  margin-top: 24px;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #6366f1, #4f46e5, #6366f1);
  background-size: 200% 100%;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 3px;
  cursor: pointer;
  transition: all 0.3s;
  overflow: hidden;
  animation: btnBgShift 4s ease-in-out infinite;
}
.btn-submit:hover:not(:disabled) {
  box-shadow: 0 8px 30px rgba(99,102,241,0.35);
  transform: translateY(-1px);
}
.btn-submit:active:not(:disabled) { transform: translateY(0); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; animation: none; }
@keyframes btnBgShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}
.submit-text { position: relative; z-index: 1; }
.btn-shine {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  animation: shine 2.5s ease-in-out infinite;
}
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}
.spinner {
  display: inline-block;
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin-right: 6px;
  vertical-align: middle;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ---- 错误 ---- */
.error-msg {
  color: var(--danger);
  text-align: center;
  font-size: 13px;
  margin-top: 16px;
  padding: 10px 14px;
  background: rgba(239,68,68,0.06);
  border-radius: 10px;
  border: 1px solid rgba(239,68,68,0.1);
}
</style>
