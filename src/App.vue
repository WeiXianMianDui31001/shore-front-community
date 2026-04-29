<template>
  <div class="app">
    <nav v-if="showNav" class="navbar">
      <div class="nav-brand">
        <span class="brand-icon">&#9670;</span>
        <span class="brand-text">岸上见 · 社区</span>
      </div>
      <div class="nav-links">
        <router-link to="/" class="nav-link">帖子广场</router-link>
        <router-link to="/resources" class="nav-link">资源大厅</router-link>
        <router-link to="/create" class="nav-link nav-cta">+ 发布</router-link>
        <router-link v-if="userStore.isLoggedIn" to="/points" class="nav-link">
          我的积分
        </router-link>
        <router-link v-if="userStore.isLoggedIn" to="/my-uploads" class="nav-link">
          我的上传
        </router-link>
        <router-link v-if="userStore.isAdmin" to="/admin" class="nav-link nav-admin">
          管理后台
        </router-link>
        <div v-if="userStore.isLoggedIn" class="user-badge">
          <img v-if="userStore.userInfo?.avatarUrl" :src="userStore.userInfo.avatarUrl" class="avatar" />
          <div v-else class="avatar avatar-placeholder">{{ userStore.userInfo?.nickname?.[0] || '?' }}</div>
          <span class="role-tag" :class="roleClass">{{ roleText }}</span>
          <button class="logout-btn" @click="logout">退出</button>
        </div>
      </div>
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './stores/user'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

const showNav = computed(() => route.path !== '/login')

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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Noto Sans SC', -apple-system, BlinkMacSystemFont, sans-serif;
  background: #f7f5f0;
  color: #2c2c2c;
  line-height: 1.6;
}

.app {
  min-height: 100vh;
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 64px;
  background: #fff;
  border-bottom: 1px solid #e8e4dc;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  font-weight: 700;
  color: #1a3a5c;
}

.brand-icon {
  color: #c9a96e;
  font-size: 16px;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 16px;
}

.nav-link {
  text-decoration: none;
  color: #5a5a5a;
  font-size: 15px;
  font-weight: 500;
  transition: color 0.2s;
  padding: 6px 12px;
  border-radius: 8px;
}

.nav-link:hover {
  color: #1a3a5c;
  background: #f0ece4;
}

.nav-cta {
  background: #1a3a5c;
  color: #fff;
}

.nav-cta:hover {
  background: #0f2540;
  color: #fff;
}

.nav-admin {
  background: #fce4ec;
  color: #c2185b;
}

.nav-admin:hover {
  background: #c2185b;
  color: #fff;
}

.user-badge {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e8e4dc;
}

.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a3a5c;
  color: #fff;
  font-size: 14px;
  font-weight: 600;
}

.role-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.role-study { background: #e3f2fd; color: #1565c0; }
.role-job { background: #fff3e0; color: #e65100; }
.role-admin { background: #fce4ec; color: #c2185b; }

.logout-btn {
  background: none;
  border: none;
  color: #999;
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
}

.logout-btn:hover {
  color: #e74c3c;
}

main {
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
}
</style>
