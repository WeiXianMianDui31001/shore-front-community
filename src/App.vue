<template>
  <div class="app-layout" :style="{ '--mx': mx, '--my': my }">
    <!-- Sidebar -->
    <aside v-if="showSidebar" class="sidebar">
      <div class="sidebar-brand">
        <svg class="brand-icon-svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2l7 7-7 7-7-7z"/>
          <path d="M12 9l7 7-7 7-7-7z" opacity="0.35"/>
        </svg>
        <span class="brand-text">岸上见</span>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">发现</span>
          <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span>帖子广场</span>
          </router-link>
          <router-link to="/resources" class="nav-item" :class="{ active: route.path.startsWith('/resources') }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
            <span>资源大厅</span>
          </router-link>
          <router-link to="/info" class="nav-item" :class="{ active: route.path.startsWith('/info') }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>信息聚合</span>
          </router-link>
          <router-link to="/rooms" class="nav-item" :class="{ active: route.path.startsWith('/room') }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>讨论室</span>
          </router-link>
        </div>

        <div v-if="userStore.isLoggedIn" class="nav-section">
          <span class="nav-section-title">我的</span>
          <router-link to="/points" class="nav-item" :class="{ active: route.path === '/points' }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/></svg>
            <span>我的积分</span>
          </router-link>
          <router-link to="/collections" class="nav-item" :class="{ active: route.path === '/collections' }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            <span>我的收藏</span>
          </router-link>
          <router-link to="/my-uploads" class="nav-item" :class="{ active: route.path === '/my-uploads' }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            <span>我的上传</span>
          </router-link>
          <router-link to="/notifications" class="nav-item" :class="{ active: route.path === '/notifications' }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
            <span>消息中心</span>
            <span v-if="unreadCount > 0" class="nav-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </router-link>
          <router-link to="/resume/templates" class="nav-item" :class="{ active: route.path.startsWith('/resume') }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            <span>简历模板</span>
          </router-link>
        </div>

        <div v-if="userStore.isAdmin" class="nav-section">
          <span class="nav-section-title">管理</span>
          <router-link to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
            <svg class="nav-icon-svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            <span>管理后台</span>
          </router-link>
        </div>
      </nav>

      <div v-if="userStore.isLoggedIn" class="sidebar-footer">
        <div class="user-card" @click="router.push('/profile')">
          <img v-if="userStore.userInfo?.avatarUrl" :src="userStore.userInfo.avatarUrl" class="user-avatar" />
          <div v-else class="user-avatar avatar-placeholder">{{ userStore.userInfo?.nickname?.[0] || '?' }}</div>
          <div class="user-info">
            <span class="user-name">{{ userStore.userInfo?.nickname || '用户' }}</span>
            <span class="user-role" :class="roleClass">{{ roleText }}</span>
          </div>
        </div>
        <button class="logout-btn" @click.stop="logout">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          退出
        </button>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area" :class="{ 'no-sidebar': !showSidebar }">
      <div class="ambient-orb ambient-a" />
      <div class="ambient-orb ambient-b" />
      <div class="ambient-orb ambient-c" />
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

/* ---- 鼠标视差 ---- */
const mx = ref(0)
const my = ref(0)
function onMouseMove(e) {
  mx.value = ((e.clientX / window.innerWidth) - 0.5) * 80
  my.value = ((e.clientY / window.innerHeight) - 0.5) * 60
}
onMounted(() => window.addEventListener('mousemove', onMouseMove))
onUnmounted(() => window.removeEventListener('mousemove', onMouseMove))
import { getUnreadCount } from './api/notification'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const showSidebar = computed(() => route.path !== '/login')
const unreadCount = ref(0)
let pollTimer = null

async function fetchUnreadCount() {
  if (!userStore.isLoggedIn) return
  try {
    const res = await getUnreadCount()
    unreadCount.value = res.data?.count || 0
  } catch (e) {
    // ignore
  }
}

onMounted(() => {
  fetchUnreadCount()
  pollTimer = setInterval(fetchUnreadCount, 5000)
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

const roleText = computed(() => {
  const r = userStore.userInfo?.role
  if (r === 0) return '备考'
  if (r === 1) return '求职'
  if (r === 2) return '管理员'
  return ''
})

const roleClass = computed(() => {
  const r = userStore.userInfo?.role
  if (r === 0) return 'role-study'
  if (r === 1) return 'role-job'
  if (r === 2) return 'role-admin'
  return ''
})

function logout() {
  userStore.logout()
  router.push('/login')
}
</script>

<style>
/* ========== CSS Variables ========== */
:root {
  /* Colors — refined palette */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #eef2ff;
  --primary-glow: rgba(99, 102, 241, 0.15);
  --accent: #8b5cf6;
  --bg: #f1f5f9;
  --bg-glass: rgba(248, 250, 252, 0.72);
  --surface: #ffffff;
  --surface-glass: rgba(255, 255, 255, 0.78);
  --surface-hover: #f8fafc;
  --border: #e2e8f0;
  --border-hover: #cbd5e1;
  --text: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --text-on-primary: #ffffff;
  --success: #22c55e;
  --warning: #f59e0b;
  --danger: #ef4444;
  --danger-bg: #fef2f2;
  --danger-text: #dc2626;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;

  /* Radius */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 18px;
  --radius-full: 9999px;

  /* Shadows — deeper, more layered */
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.04), 0 1px 2px rgba(0,0,0,0.03);
  --shadow-md: 0 4px 16px rgba(0,0,0,0.06), 0 1px 4px rgba(0,0,0,0.04);
  --shadow-lg: 0 12px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04);
  --shadow-glow: 0 0 20px var(--primary-glow);

  /* Sidebar */
  --sidebar-width: 220px;
}

/* ========== Keyframe Animations ========== */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes fadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@keyframes bgFloat {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25%      { transform: translate(1%, 0.5%) scale(1.005); }
  50%      { transform: translate(0.5%, -0.3%) scale(1.008); }
  75%      { transform: translate(-0.3%, 0.8%) scale(1.004); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes glowPulse {
  0%, 100% { box-shadow: 0 0 8px var(--primary-glow); }
  50%      { box-shadow: 0 0 24px rgba(99,102,241,0.25); }
}

/* ========== Global Reset ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* Full-page animated background */
body::before {
  content: '';
  position: fixed;
  inset: -12%;
  z-index: 0;
  background: url('/pic/bg.png') no-repeat center center / cover;
  opacity: 0.14;
  animation: bgFloat 30s ease-in-out infinite;
  pointer-events: none;
  transform: translate(calc(var(--mx, 0) * 1px), calc(var(--my, 0) * 1px)) scale(1.1);
  transition: transform 0.4s cubic-bezier(0.33, 0.66, 0.55, 0.99);
}

body::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 0;
  background:
    radial-gradient(ellipse at 30% 20%, rgba(99,102,241,0.04) 0%, transparent 55%),
    radial-gradient(ellipse at 70% 60%, rgba(139,92,246,0.03) 0%, transparent 55%),
    radial-gradient(ellipse at 50% 90%, rgba(6,182,212,0.03) 0%, transparent 50%);
  pointer-events: none;
}

/* ========== Layout ========== */
.app-layout {
  display: flex;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

/* Glassmorphism sidebar */
/* Fluent Acrylic: 侧边栏 — 深度亚克力 */
.sidebar {
  width: var(--sidebar-width);
  background: rgba(248,250,252,0.4);
  backdrop-filter: blur(28px) saturate(170%);
  -webkit-backdrop-filter: blur(28px) saturate(170%);
  border-right: 1px solid rgba(255,255,255,0.5);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
  box-shadow: 1px 0 0 rgba(0,0,0,0.03), 4px 0 20px rgba(0,0,0,0.03);
}

.sidebar-brand {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-5) var(--space-5) var(--space-4);
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.3px;
}

.brand-icon-svg {
  color: var(--primary);
  flex-shrink: 0;
  filter: drop-shadow(0 2px 6px rgba(99,102,241,0.35));
}

.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  padding: 0 var(--space-3);
}

.nav-section {
  margin-bottom: var(--space-5);
}

.nav-section-title {
  display: block;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--text-muted);
  padding: 0 var(--space-3);
  margin-bottom: var(--space-2);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s ease;
  margin-bottom: 2px;
  position: relative;
}

.nav-item:hover {
  background: rgba(99, 102, 241, 0.06);
  color: var(--text);
  transform: translateX(2px);
}

.nav-item.active {
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  color: var(--primary);
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04), inset 0 0 0 1px rgba(99,102,241,0.08);
}

.nav-icon-svg {
  width: 20px;
  text-align: center;
  flex-shrink: 0;
  transition: transform 0.2s;
}
.nav-item:hover .nav-icon-svg {
  transform: translateX(1px);
}

.nav-badge {
  margin-left: auto;
  background: var(--danger);
  color: var(--text-on-primary);
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full);
  animation: glowPulse 2s ease-in-out infinite;
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid rgba(226, 232, 240, 0.5);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.2s;
}

.user-card:hover {
  background: rgba(99, 102, 241, 0.06);
}

.user-avatar {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.user-avatar.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: var(--text-on-primary);
  font-size: 14px;
  font-weight: 600;
}

.user-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
}

.user-role.role-study { color: #2563eb; }
.user-role.role-job { color: #ea580c; }
.user-role.role-admin { color: #dc2626; }

.logout-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  margin-top: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 13px;
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: all 0.2s;
}

.logout-btn:hover {
  color: var(--danger);
  background: var(--danger-bg);
}

.main-area {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
  position: relative;
  z-index: 1;
  overflow: hidden;
}

.main-area.no-sidebar {
  margin-left: 0;
}

/* ---- Fluent Design 环境微动光球 ---- */
.ambient-orb {
  position: fixed;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(80px);
  will-change: transform;
}
.ambient-a {
  width: 500px; height: 500px;
  top: -10%; right: -5%;
  background: rgba(99,102,241,0.06);
  animation: ambientDriftA 18s ease-in-out infinite;
}
.ambient-b {
  width: 400px; height: 400px;
  bottom: -8%; left: -3%;
  background: rgba(139,92,246,0.05);
  animation: ambientDriftB 22s ease-in-out infinite;
}
.ambient-c {
  width: 300px; height: 300px;
  top: 50%; left: 60%;
  background: rgba(6,182,212,0.04);
  animation: ambientDriftC 20s ease-in-out infinite;
}
@keyframes ambientDriftA {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(60px, -40px); }
  66% { transform: translate(-30px, 30px); }
}
@keyframes ambientDriftB {
  0%, 100% { transform: translate(0, 0); }
  33% { transform: translate(-50px, -30px); }
  66% { transform: translate(40px, 20px); }
}
@keyframes ambientDriftC {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-40px, -50px); }
}

/* ========== Utility Classes ========== */
.page-container {
  max-width: 1120px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
  animation: fadeUp 0.5s ease;
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-header h1, .page-header h2 {
  font-size: 26px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.4px;
  line-height: 1.3;
}

.page-desc {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: var(--space-1);
}

/* Toolbar — unified alignment */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  row-gap: var(--space-3);
  margin-bottom: var(--space-5);
  flex-wrap: wrap;
}

.toolbar .category-bar,
.toolbar .segmented {
  margin-left: 0;
}

.toolbar > .btn-primary {
  margin-left: auto;
  flex-shrink: 0;
}

/* 工具栏内所有子元素统一 36px 高度 + 清除自带 margin */
.toolbar .category-bar {
  margin-bottom: 0;
}

.toolbar .category-bar button {
  height: 34px;
}

.toolbar .segmented {
  margin-bottom: 0;
}

.toolbar .segmented button {
  height: 28px;
}

.toolbar .search-box {
  margin-bottom: 0;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 180px;
  max-width: 300px;
  gap: var(--space-2);
}

.search-box .btn {
  height: 36px;
  flex-shrink: 0;
}

.search-box input {
  flex: 1;
  height: 36px;
  padding: 0 var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: var(--surface-glass);
  backdrop-filter: blur(8px);
  transition: all 0.2s;
}

.search-box input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.search-box input::placeholder {
  color: var(--text-muted);
}

/* Buttons — refined */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  height: 36px;
  padding: 0 var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
  letter-spacing: 0.1px;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: var(--text-on-primary);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(99,102,241,0.25);
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, var(--primary-hover), #4338ca);
  box-shadow: 0 4px 16px rgba(99,102,241,0.35);
  transform: translateY(-1px);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(99,102,241,0.2);
}

.btn-secondary {
  background: var(--surface-glass);
  backdrop-filter: blur(8px);
  color: var(--text-secondary);
  border-color: var(--border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--border-hover);
  box-shadow: var(--shadow-sm);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: rgba(99,102,241,0.06);
  color: var(--text);
}

.btn-danger {
  background: var(--danger-bg);
  color: var(--danger-text);
  border-color: transparent;
}

.btn-danger:hover:not(:disabled) {
  background: var(--danger);
  color: var(--text-on-primary);
}

.btn-sm { height: 30px; padding: 0 10px; font-size: 13px; }
.btn-lg { height: 42px; padding: 0 22px; font-size: 15px; }

.search-box .btn-sm,
.search-box .btn { height: 36px; }

/* Filter tabs / Segmented control — polished pill style */
.filter-tabs, .segmented {
  display: inline-flex;
  gap: 2px;
  padding: 3px;
  background: rgba(241,245,249,0.5);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.5);
  border-bottom-color: rgba(226,232,240,0.3);
  border-radius: var(--radius-md);
  flex-shrink: 0;
}

.filter-tabs button, .segmented button {
  padding: 5px 14px;
  border: none;
  background: transparent;
  border-radius: calc(var(--radius-md) - 2px);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.3s cubic-bezier(0.33, 0.66, 0.55, 0.99);
  height: 30px;
  white-space: nowrap;
}

.filter-tabs button:hover, .segmented button:hover {
  color: var(--text-secondary);
  background: rgba(255,255,255,0.45);
}

.filter-tabs button.active, .segmented button.active {
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(6px);
  color: var(--text);
  font-weight: 600;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}

/* Category bar — unified pill style */
.category-bar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
}

.category-bar button {
  padding: 5px 14px;
  border: 1px solid var(--border);
  background: var(--surface-glass);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.2s;
  height: 30px;
  white-space: nowrap;
}

.category-bar button:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
}

.category-bar button.active {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: var(--text-on-primary);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(99,102,241,0.2);
}

/* Cards — glassmorphism */
/* Fluent Acrylic: 卡片 — 中层亚克力 + 微呼吸 */
.card {
  background: rgba(255,255,255,0.5);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid rgba(255,255,255,0.55);
  border-bottom-color: rgba(226,232,240,0.35);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: all 0.35s cubic-bezier(0.33, 0.66, 0.55, 0.99);
}

.card-hover:hover {
  border-color: rgba(255,255,255,0.7);
  box-shadow:
    0 8px 32px rgba(99,102,241,0.06),
    0 2px 8px rgba(0,0,0,0.04);
  transform: translateY(-2px);
}

.card-clickable {
  cursor: pointer;
}

/* Form elements */
.input, .field input, .field textarea, .field select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid rgba(226,232,240,0.6);
  border-bottom-color: rgba(226,232,240,0.4);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: rgba(248,250,252,0.55);
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.33, 0.66, 0.55, 0.99);
  font-family: inherit;
}

.input:focus, .field input:focus, .field textarea:focus, .field select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-glow);
}

.input::placeholder, .field input::placeholder, .field textarea::placeholder {
  color: var(--text-muted);
}

.field {
  margin-bottom: var(--space-4);
}

.field label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.form-row {
  display: flex;
  gap: var(--space-4);
}

.form-row .field {
  flex: 1;
  margin-bottom: 0;
}

/* Tags / Badges */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: var(--bg-glass);
  backdrop-filter: blur(4px);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 500;
}

.badge-success { background: #dcfce7; color: #16a34a; }
.badge-warning { background: #fef3c7; color: #d97706; }
.badge-danger { background: var(--danger-bg); color: var(--danger-text); }
.badge-info { background: #dbeafe; color: #2563eb; }
.badge-neutral { background: var(--bg); color: var(--text-muted); }

/* Tables */
.data-table {
  background: rgba(255,255,255,0.45);
  backdrop-filter: blur(16px) saturate(150%);
  -webkit-backdrop-filter: blur(16px) saturate(150%);
  border: 1px solid rgba(255,255,255,0.5);
  border-bottom-color: rgba(226,232,240,0.3);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 16px rgba(99,102,241,0.03);
}

.data-table .table-header, .data-table .table-row {
  display: grid;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
}

.data-table .table-header {
  background: rgba(241, 245, 249, 0.6);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.data-table .table-row {
  border-top: 1px solid rgba(226, 232, 240, 0.4);
  font-size: 14px;
  color: var(--text-secondary);
  transition: background 0.2s;
}

.data-table .table-row:hover {
  background: rgba(99, 102, 241, 0.04);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-6);
}

.pagination button {
  height: 34px;
  padding: 0 var(--space-4);
  border: 1px solid var(--border);
  background: var(--surface-glass);
  backdrop-filter: blur(8px);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.2s;
}

.pagination button:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: 0 2px 8px rgba(99,102,241,0.1);
}

.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pagination span {
  font-size: 14px;
  color: var(--text-muted);
  padding: 0 var(--space-2);
}

/* Empty / Loading */
.empty, .loading {
  text-align: center;
  padding: 60px 0;
  color: var(--text-muted);
  font-size: 14px;
}

.loading {
  position: relative;
}
.loading::after {
  content: '';
  display: block;
  width: 32px;
  height: 3px;
  margin: 16px auto 0;
  background: linear-gradient(90deg, transparent, var(--primary), transparent);
  background-size: 200% 100%;
  border-radius: 2px;
  animation: shimmer 1.5s ease-in-out infinite;
}

/* Modal — glassmorphism */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--space-5);
  animation: fadeIn 0.2s ease;
}

.modal-card {
  background: rgba(248,250,252,0.42);
  backdrop-filter: blur(28px) saturate(170%);
  -webkit-backdrop-filter: blur(28px) saturate(170%);
  border: 1px solid rgba(255,255,255,0.55);
  border-bottom-color: rgba(226,232,240,0.3);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  width: 100%;
  max-width: 400px;
  box-shadow: 0 16px 48px rgba(99,102,241,0.06), 0 4px 12px rgba(0,0,0,0.05);
  animation: fadeUp 0.35s cubic-bezier(0.33, 0.66, 0.55, 0.99);
}

.modal-card.wide {
  max-width: 560px;
}

.modal-actions {
  display: flex;
  gap: var(--space-3);
  justify-content: flex-end;
  margin-top: var(--space-5);
}

/* Room fullscreen */
.room-fullscreen {
  margin-left: 0 !important;
  height: 100vh;
}
</style>
