<template>
  <div class="page-container">
    <div class="page-header">
      <h2>消息中心</h2>
      <button v-if="unreadCount > 0" class="btn btn-secondary btn-sm" @click="readAll">全部已读</button>
    </div>

    <div class="segmented">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value; page = 1; loadNotifications()"
      >
        {{ tab.label }}
        <span v-if="tab.value === '' && unreadCount > 0" class="nav-badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
      </button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="notifications">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="noti-item"
        :class="{ unread: !n.isRead }"
        @click="handleClick(n)"
      >
        <div class="noti-dot" v-if="!n.isRead"></div>
        <div v-else class="noti-dot-placeholder"></div>
        <div class="noti-main">
          <div class="noti-title">{{ n.title }}</div>
          <div class="noti-content">{{ n.content }}</div>
          <div class="noti-time">{{ formatTime(n.createdAt) }}</div>
        </div>
        <div class="badge" :class="typeBadgeClass(n.type)">{{ typeText(n.type) }}</div>
      </div>
    </div>

    <div v-if="!loading && notifications.length === 0" class="empty">暂无消息</div>

    <div v-if="totalPages > 1" class="pagination">
      <button :disabled="page <= 1" @click="page--; loadNotifications()">上一页</button>
      <span>{{ page }} / {{ totalPages }}</span>
      <button :disabled="page >= totalPages" @click="page++; loadNotifications()">下一页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getNotifications, readNotifications, readAllNotifications } from '../api/notification'

const router = useRouter()

const tabs = [
  { label: '全部', value: '' },
  { label: '互动', value: 1 },
  { label: '积分', value: 2 },
  { label: '系统', value: 0 }
]

const activeTab = ref('')
const notifications = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(15)
const total = ref(0)
const unreadCount = ref(0)

const totalPages = computed(() => Math.ceil(total.value / size.value))

function typeText(type) {
  const map = { 0: '系统', 1: '互动', 2: '积分' }
  return map[type] || '系统'
}

function typeBadgeClass(type) {
  const map = { 0: 'badge-neutral', 1: 'badge-info', 2: 'badge-success' }
  return map[type] || 'badge-neutral'
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function loadNotifications() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (activeTab.value !== '') params.type = activeTab.value
    const res = await getNotifications(params)
    notifications.value = res.data.list || []
    total.value = res.data.pagination?.total || 0
    unreadCount.value = res.data.unreadCount || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function handleClick(n) {
  if (!n.isRead) {
    try {
      await readNotifications([n.id])
      n.isRead = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch (e) {
      console.error(e)
    }
  }
  if (n.targetUrl) {
    router.push(n.targetUrl)
  }
}

async function readAll() {
  try {
    await readAllNotifications()
    unreadCount.value = 0
    notifications.value.forEach(n => n.isRead = true)
  } catch (e) {
    console.error(e)
  }
}

onMounted(() => {
  loadNotifications()
})
</script>

<style scoped>
.segmented {
  margin-bottom: var(--space-4);
}

.segmented button {
  position: relative;
}

.notifications {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.noti-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  background: var(--surface);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}

.noti-item:hover {
  border-color: var(--primary);
  box-shadow: var(--shadow-sm);
}

.noti-item.unread {
  background: var(--bg);
  border-left: 3px solid var(--primary);
}

.noti-dot {
  width: 8px;
  height: 8px;
  background: var(--danger);
  border-radius: var(--radius-full);
  margin-top: 6px;
  flex-shrink: 0;
}

.noti-dot-placeholder {
  width: 8px;
  flex-shrink: 0;
}

.noti-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.noti-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--text);
}

.noti-content {
  font-size: 14px;
  color: var(--text-secondary);
  line-height: 1.5;
}

.noti-time {
  font-size: 12px;
  color: var(--text-muted);
}
</style>
