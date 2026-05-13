<template>
  <div class="room-detail">
    <header class="room-header-bar">
      <button class="btn btn-secondary btn-sm" @click="goBack">
        <span style="margin-right:4px">&#8592;</span> 返回大厅
      </button>
      <h3>{{ roomName }}</h3>
      <span class="status-badge" :class="wsStatus === 'connected' ? 'badge-success' : wsStatus === 'connecting' ? 'badge-warning' : 'badge-danger'">
        {{ wsStatus === 'connected' ? '已连接' : wsStatus === 'connecting' ? '连接中...' : '已断开' }}
      </span>
    </header>

    <div class="room-body">
      <div class="left">
        <WhiteboardCanvas
          ref="canvasRef"
          :initial-ops="whiteboardOps"
          @draw="onDraw"
        />
      </div>
      <div class="right">
        <ChatPanel
          :messages="messages"
          :current-user-id="currentUserId"
          @send="sendChat"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { getMessages, getWhiteboardOps } from '../api/room'
import WhiteboardCanvas from '../components/WhiteboardCanvas.vue'
import ChatPanel from '../components/ChatPanel.vue'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const roomId = route.params.id
const roomName = ref(route.query.name || '讨论室')
const wsConnected = ref(false)
const wsStatus = ref('connecting')
const messages = ref([])
const whiteboardOps = ref([])
const canvasRef = ref(null)
const currentUserId = ref(userStore.userInfo?.id || 0)

let ws = null
let reconnectTimer = null
let heartbeatTimer = null
let reconnectAttempts = 0
const MAX_RECONNECT = 10
const HEARTBEAT_INTERVAL = 30000
const RECONNECT_BASE_DELAY = 1000

onMounted(() => {
  loadHistory()
  connectWebSocket()
})

onBeforeUnmount(() => {
  clearTimers()
  if (ws) {
    ws.onclose = null
    ws.onerror = null
    ws.close()
    ws = null
  }
})

function clearTimers() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

async function loadHistory() {
  try {
    const [msgRes, wbRes] = await Promise.all([
      getMessages(roomId, { limit: 100 }),
      getWhiteboardOps(roomId, { limit: 500 })
    ])
    messages.value = msgRes.data || []
    whiteboardOps.value = wbRes.data || []
  } catch (e) {
    console.error('Load history failed', e)
  }
}

function connectWebSocket() {
  if (ws) {
    try { ws.close() } catch (_) {}
    ws = null
  }

  const token = userStore.token
  if (!token) {
    wsStatus.value = 'disconnected'
    wsConnected.value = false
    return
  }

  wsStatus.value = 'connecting'
  const protocol = location.protocol === 'https:' ? 'wss' : 'ws'
  const url = `${protocol}://${location.host}/ws/room/${roomId}?token=${token}`

  try {
    ws = new WebSocket(url)
  } catch (e) {
    console.error('Failed to create WebSocket', e)
    scheduleReconnect()
    return
  }

  ws.onopen = () => {
    wsConnected.value = true
    wsStatus.value = 'connected'
    reconnectAttempts = 0
    startHeartbeat()
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.msgType === 'CHAT') {
        messages.value.push(data.payload)
      } else if (data.msgType === 'WHITEBOARD') {
        if (canvasRef.value) {
          canvasRef.value.applyRemoteOp(data.payload)
        }
      }
    } catch (e) {
      console.error('WS message parse error', e)
    }
  }

  ws.onclose = (event) => {
    wsConnected.value = false
    wsStatus.value = 'disconnected'
    clearHeartbeat()
    if (!event.wasClean) {
      scheduleReconnect()
    }
  }

  ws.onerror = (e) => {
    console.error('WS error', e)
    wsConnected.value = false
    wsStatus.value = 'disconnected'
  }
}

function scheduleReconnect() {
  if (reconnectAttempts >= MAX_RECONNECT) {
    wsStatus.value = 'disconnected'
    console.warn('Max reconnect attempts reached')
    return
  }
  reconnectAttempts++
  const delay = Math.min(RECONNECT_BASE_DELAY * Math.pow(2, reconnectAttempts - 1), 30000)
  console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts})`)
  reconnectTimer = setTimeout(() => {
    connectWebSocket()
  }, delay)
}

function startHeartbeat() {
  clearHeartbeat()
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ msgType: 'PING' }))
    }
  }, HEARTBEAT_INTERVAL)
}

function clearHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }
}

function sendChat(content) {
  if (!ws || ws.readyState !== WebSocket.OPEN) {
    alert('连接已断开，请刷新页面重试')
    return
  }
  ws.send(JSON.stringify({
    msgType: 'CHAT',
    content,
    clientMsgId: Date.now().toString()
  }))
}

function onDraw({ opType, opData }) {
  if (!ws || ws.readyState !== WebSocket.OPEN) return
  ws.send(JSON.stringify({
    msgType: 'WHITEBOARD',
    opType,
    opData
  }))
}

function goBack() {
  router.push('/rooms')
}
</script>

<style scoped>
.room-detail {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg);
}
.room-header-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}
.room-header-bar h3 {
  font-size: 16px;
  font-weight: 600;
}
.status-badge {
  font-size: 12px;
  padding: 3px 10px;
}
.room-body {
  display: flex;
  flex: 1;
  gap: 12px;
  padding: 12px;
  overflow: hidden;
}
.left {
  flex: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.right {
  flex: 1;
  min-width: 280px;
  max-width: 380px;
  display: flex;
  flex-direction: column;
}
</style>
