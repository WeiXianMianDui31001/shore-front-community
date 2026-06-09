<template>
  <div class="page-container">
    <div class="page-header">
      <h2>讨论室大厅</h2>
      <p class="page-desc">加入讨论室，与同学们实时交流、协作画板</p>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <input v-model="keyword" placeholder="搜索房间..." @keyup.enter="loadRooms" />
        <button class="btn btn-primary btn-sm" @click="loadRooms">搜索</button>
      </div>
      <button class="btn btn-primary" @click="showModal = true">+ 创建房间</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>

    <div v-else class="room-grid">
      <div v-for="room in rooms" :key="room.id" class="room-card" @click="enterRoom(room)">
        <div class="room-header">
          <h4>{{ room.name }} <span v-if="room.hasPassword" class="lock">&#128274;</span></h4>
          <span class="badge" :class="room.onlineCount > 0 ? 'badge-success' : 'badge-neutral'">
            {{ room.onlineCount || 0 }} 人在线
          </span>
        </div>
        <div class="room-meta">
          <span>最大 {{ room.maxMembers }} 人</span>
          <span v-if="room.expireAt">过期 {{ formatTime(room.expireAt) }}</span>
        </div>
      </div>
      <p v-if="rooms.length === 0" class="empty" style="grid-column: 1 / -1;">暂无房间，创建一个吧</p>
    </div>

    <RoomCreateModal :visible="showModal" @close="showModal = false" @created="onRoomCreated" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getRooms, joinRoom } from '../api/room'
import RoomCreateModal from '../components/RoomCreateModal.vue'

const router = useRouter()

const rooms = ref([])
const keyword = ref('')
const showModal = ref(false)
const loading = ref(false)

async function loadRooms() {
  loading.value = true
  try {
    const res = await getRooms({ keyword: keyword.value, page: 1, size: 50 })
    rooms.value = res.data.records || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function onRoomCreated(room) {
  showModal.value = false
  enterRoom(room)
}

async function enterRoom(room) {
  let password = null
  if (room.hasPassword) {
    password = prompt('该房间需要密码：')
    if (password === null) return
  }
  try {
    await joinRoom(room.id, { password })
    router.push({ path: `/room/${room.id}`, query: { name: room.name } })
  } catch (e) {
    alert(e.message || '加入失败')
  }
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

onMounted(loadRooms)
</script>

<style scoped>
.room-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-3);
}

.room-card {
  background: var(--surface-glass);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(226, 232, 240, 0.5);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  cursor: pointer;
  transition: all 0.25s ease;
}

.room-card:hover {
  border-color: var(--border-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.room-header h4 {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}

.lock {
  font-size: 12px;
  margin-left: 4px;
  color: var(--text-muted);
}

.room-meta {
  display: flex;
  gap: var(--space-3);
  font-size: 13px;
  color: var(--text-muted);
}
</style>
