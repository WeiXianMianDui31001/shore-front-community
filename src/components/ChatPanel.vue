<template>
  <div class="page-container chat-panel">
    <div class="chat-header">房间群聊</div>
    <div class="chat-messages" ref="msgRef">
      <div v-for="msg in messages" :key="msg.sequenceNo || msg.id" class="msg-row"
        :class="{ self: String(msg.senderId) === String(currentUserId) }"
      >
        <img v-if="msg.senderAvatar" :src="msg.senderAvatar" class="msg-avatar" />
        <div v-else class="msg-avatar avatar-placeholder">{{ msg.senderNickname?.[0] || '?' }}</div>
        <div class="msg-bubble">
          <div class="msg-sender">{{ String(msg.senderId) === String(currentUserId) ? '我' : (msg.senderNickname || `用户${msg.senderId}`) }}</div>
          <div class="msg-content">{{ msg.content }}</div>
        </div>
      </div>
    </div>
    <div class="chat-input">
      <input v-model="text" placeholder="输入消息..." @keyup.enter="send" />
      <button @click="send" :disabled="!text.trim()">发送</button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  currentUserId: { type: [String, Number], default: '0' }
})
const emit = defineEmits(['send'])

const text = ref('')
const msgRef = ref(null)

watch(() => props.messages.length, () => {
  nextTick(() => {
    if (msgRef.value) msgRef.value.scrollTop = msgRef.value.scrollHeight
  })
})

function send() {
  const content = text.value.trim()
  if (!content) return
  emit('send', content)
  text.value = ''
}
</script>

<style scoped>
.chat-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--surface);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
}
.chat-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 15px;
  border-bottom: 1px solid var(--border);
  background: var(--bg);
}
.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.msg-row.self {
  justify-content: flex-end;
  flex-direction: row-reverse;
}
.msg-avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
}
.msg-avatar.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}
.msg-bubble {
  max-width: 80%;
  padding: 8px 12px;
  border-radius: var(--radius-md);
  background: #f0f0f0;
}
.msg-row.self .msg-bubble {
  background: var(--primary);
  color: var(--text-on-primary);
}
.msg-sender {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 2px;
}
.msg-row.self .msg-sender {
  color: rgba(255,255,255,0.8);
}
.msg-content {
  font-size: 14px;
  line-height: 1.4;
  word-break: break-word;
}
.chat-input {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
  border-top: 1px solid var(--border);
  background: var(--bg);
}
.chat-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-hover);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
}
.chat-input button {
  padding: 0 16px;
  border: none;
  background: var(--primary);
  color: var(--text-on-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
}
.chat-input button:disabled {
  background: var(--border-hover);
}
</style>