<template>
  <div class="app-layout">
    <!-- Sidebar -->
    <aside v-if="showSidebar" class="sidebar">
      <div class="sidebar-brand">
        <span class="brand-icon">&#9670;</span>
        <span class="brand-text">岸上见</span>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-section-title">发现</span>
          <router-link to="/" class="nav-item" :class="{ active: route.path === '/' }">
            <span class="nav-icon">&#128172;</span>
            <span>帖子广场</span>
          </router-link>
          <router-link to="/resources" class="nav-item" :class="{ active: route.path.startsWith('/resources') }">
            <span class="nav-icon">&#128230;</span>
            <span>资源大厅</span>
          </router-link>
          <router-link to="/info" class="nav-item" :class="{ active: route.path.startsWith('/info') }">
            <span class="nav-icon">&#128221;</span>
            <span>信息聚合</span>
          </router-link>
          <router-link to="/rooms" class="nav-item" :class="{ active: route.path.startsWith('/room') }">
            <span class="nav-icon">&#127969;</span>
            <span>讨论室</span>
          </router-link>
        </div>

        <div v-if="userStore.isLoggedIn" class="nav-section">
          <span class="nav-section-title">我的</span>
          <router-link to="/points" class="nav-item" :class="{ active: route.path === '/points' }">
            <span class="nav-icon">&#127941;</span>
            <span>我的积分</span>
          </router-link>
          <router-link to="/collections" class="nav-item" :class="{ active: route.path === '/collections' }">
            <span class="nav-icon">&#11088;</span>
            <span>我的收藏</span>
          </router-link>
          <router-link to="/my-uploads" class="nav-item" :class="{ active: route.path === '/my-uploads' }">
            <span class="nav-icon">&#128194;</span>
            <span>我的上传</span>
          </router-link>
          <router-link to="/notifications" class="nav-item" :class="{ active: route.path === '/notifications' }">
            <span class="nav-icon">&#128276;</span>
            <span>消息中心</span>
            <span v-if="unreadCount > 0" class="nav-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
          </router-link>
          <router-link to="/resume/templates" class="nav-item" :class="{ active: route.path.startsWith('/resume') }">
            <span class="nav-icon">&#128196;</span>
            <span>简历模板</span>
          </router-link>
        </div>

        <div v-if="userStore.isAdmin" class="nav-section">
          <span class="nav-section-title">管理</span>
          <router-link to="/admin" class="nav-item" :class="{ active: route.path === '/admin' }">
            <span class="nav-icon">&#9881;</span>
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
          <span>&#10148;</span> 退出
        </button>
      </div>
    </aside>

    <!-- Main Area -->
    <div class="main-area" :class="{ 'no-sidebar': !showSidebar }">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'
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
  /* Colors */
  --primary: #6366f1;
  --primary-hover: #4f46e5;
  --primary-light: #eef2ff;
  --bg: #f8fafc;
  --surface: #ffffff;
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
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.05);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.08);

  /* Sidebar */
  --sidebar-width: 220px;
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

/* ========== Layout ========== */
.app-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--surface);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  z-index: 100;
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

.brand-icon {
  color: var(--primary);
  font-size: 16px;
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
  letter-spacing: 0.5px;
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
  transition: all 0.15s ease;
  margin-bottom: 2px;
  position: relative;
}

.nav-item:hover {
  background: var(--bg);
  color: var(--text);
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--primary);
}

.nav-icon {
  font-size: 16px;
  width: 20px;
  text-align: center;
  flex-shrink: 0;
}

.nav-badge {
  margin-left: auto;
  background: var(--danger);
  color: var(--text-on-primary);
  font-size: 11px;
  font-weight: 600;
  padding: 1px 6px;
  border-radius: var(--radius-full);
}

.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border);
}

.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background 0.15s;
}

.user-card:hover {
  background: var(--bg);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}

.user-avatar.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 13px;
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
  transition: all 0.15s;
}

.logout-btn:hover {
  color: var(--danger);
  background: var(--danger-bg);
}

.main-area {
  flex: 1;
  margin-left: var(--sidebar-width);
  min-height: 100vh;
}

.main-area.no-sidebar {
  margin-left: 0;
}

/* ========== Utility Classes ========== */
.page-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: var(--space-8) var(--space-6);
}

.page-header {
  margin-bottom: var(--space-6);
}

.page-header h1, .page-header h2 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.3px;
  line-height: 1.3;
}

.page-desc {
  color: var(--text-muted);
  font-size: 14px;
  margin-top: var(--space-1);
}

/* Toolbar */
.toolbar {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  flex-wrap: wrap;
}

/* Search */
.search-box {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 240px;
  max-width: 400px;
  gap: var(--space-2);
}

.search-box input {
  flex: 1;
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: var(--surface);
  transition: all 0.15s;
}

.search-box input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
}

.search-box input::placeholder {
  color: var(--text-muted);
}

/* Buttons */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  white-space: nowrap;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary);
  color: var(--text-on-primary);
  border-color: var(--primary);
}

.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
  border-color: var(--primary-hover);
}

.btn-secondary {
  background: var(--surface);
  color: var(--text-secondary);
  border-color: var(--border);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--bg);
  border-color: var(--border-hover);
}

.btn-ghost {
  background: transparent;
  color: var(--text-secondary);
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background: var(--bg);
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

.btn-sm { padding: 4px 10px; font-size: 13px; }
.btn-lg { padding: 10px 20px; font-size: 15px; }

/* Filter tabs / Segmented control */
.filter-tabs, .segmented {
  display: flex;
  gap: 2px;
  padding: 2px;
  background: var(--bg);
  border-radius: var(--radius-md);
}

.filter-tabs button, .segmented button {
  padding: var(--space-2) var(--space-3);
  border: none;
  background: transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all 0.15s;
}

.filter-tabs button:hover, .segmented button:hover {
  color: var(--text-secondary);
}

.filter-tabs button.active, .segmented button.active {
  background: var(--surface);
  color: var(--text);
  box-shadow: var(--shadow-sm);
}

/* Cards */
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  transition: all 0.2s ease;
}

.card-hover:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
}

.card-clickable {
  cursor: pointer;
}

/* Form elements */
.input, .field input, .field textarea, .field select {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: var(--surface);
  transition: all 0.15s;
  font-family: inherit;
}

.input:focus, .field input:focus, .field textarea:focus, .field select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-light);
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

/* Tags / Badges */
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  background: var(--bg);
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
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.data-table .table-header, .data-table .table-row {
  display: grid;
  align-items: center;
  padding: 12px 20px;
  gap: 12px;
}

.data-table .table-header {
  background: var(--bg);
  font-weight: 600;
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.data-table .table-row {
  border-top: 1px solid var(--border);
  font-size: 14px;
  color: var(--text-secondary);
  transition: background 0.15s;
}

.data-table .table-row:hover {
  background: var(--bg);
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
  padding: var(--space-2) var(--space-4);
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.pagination button:hover:not(:disabled) {
  border-color: var(--border-hover);
  background: var(--bg);
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

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
  padding: var(--space-5);
}

.modal-card {
  background: var(--surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  width: 100%;
  max-width: 400px;
  box-shadow: var(--shadow-lg);
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
