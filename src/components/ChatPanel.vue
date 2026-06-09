<template>
  <div class="chat-panel">
    <div class="chat-header">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:6px"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      房间群聊
    </div>

    <div class="chat-messages" ref="msgRef">
      <div
        v-for="(msg, idx) in grouped"
        :key="msg.sequenceNo || msg.id || idx"
        class="msg-group"
        :class="{ self: String(msg.senderId) === String(currentUserId) }"
      >
        <!-- 别人发的：头像在左 -->
        <div v-if="String(msg.senderId) !== String(currentUserId)" class="msg-row other">
          <img v-if="msg.senderAvatar" :src="msg.senderAvatar" class="msg-avatar" />
          <div v-else class="msg-avatar avatar-placeholder">{{ msg.senderNickname?.[0] || '?' }}</div>
          <div class="msg-body">
            <div class="msg-sender">{{ msg.senderNickname || `用户${msg.senderId}` }}</div>
            <div class="msg-bubble">{{ msg.content }}</div>
          </div>
        </div>

        <!-- 自己发的：头像在右 -->
        <div v-else class="msg-row self">
          <div class="msg-body">
            <div class="msg-bubble self-bubble">{{ msg.content }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input v-model="text" placeholder="输入消息..." @keyup.enter="send" />
      <button class="send-btn" @click="send" :disabled="!text.trim()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps({
  messages: { type: Array, default: () => [] },
  currentUserId: { type: [String, Number], default: '0' }
})
const emit = defineEmits(['send'])

const text = ref('')
const msgRef = ref(null)

// 直接用 messages，不做合并（保持每条消息独立显示）
const grouped = computed(() => props.messages)

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
  background: rgba(248,250,252,0.4);
  backdrop-filter: blur(18px) saturate(150%);
  -webkit-backdrop-filter: blur(18px) saturate(150%);
  border: 1px solid rgba(255,255,255,0.5);
  border-bottom-color: rgba(226,232,240,0.3);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.chat-header {
  padding: 12px 16px;
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
  border-bottom: 1px solid rgba(226,232,240,0.35);
  background: rgba(255,255,255,0.3);
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ---- 消息组 ---- */
.msg-group {
  display: flex;
  flex-direction: column;
  max-width: 100%;
}

/* ---- 单条消息行 ---- */
.msg-row {
  display: flex;
  align-items: flex-start;
  gap: 10px;
}
.msg-row.other {
  justify-content: flex-start;
}
.msg-row.self {
  justify-content: flex-end;
}

.msg-avatar {
  width: 34px;
  height: 34px;
  border-radius: var(--radius-full);
  object-fit: cover;
  flex-shrink: 0;
  margin-top: 2px;
}
.msg-avatar.avatar-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--primary), var(--accent, #8b5cf6));
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  flex-shrink: 0;
}

.msg-body {
  display: flex;
  flex-direction: column;
  max-width: 75%;
}
.msg-row.self .msg-body {
  align-items: flex-end;
}

.msg-sender {
  font-size: 11px;
  color: var(--text-muted);
  margin-bottom: 3px;
  padding-left: 2px;
}

.msg-bubble {
  padding: 10px 14px;
  border-radius: 16px;
  border-top-left-radius: 4px;
  background: rgba(255,255,255,0.7);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(226,232,240,0.3);
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;
  color: var(--text);
  overflow-wrap: break-word;
}

.msg-bubble.self-bubble {
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: #fff;
  border: none;
  border-radius: 16px;
  border-top-right-radius: 4px;
  box-shadow: 0 2px 10px rgba(99,102,241,0.2);
}

/* ---- 输入区 ---- */
.chat-input {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-top: 1px solid rgba(226,232,240,0.35);
  background: rgba(255,255,255,0.3);
  flex-shrink: 0;
}

.chat-input input {
  flex: 1;
  height: 38px;
  padding: 0 14px;
  border: 1px solid rgba(226,232,240,0.5);
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  background: rgba(248,250,252,0.6);
  backdrop-filter: blur(6px);
  transition: all 0.25s;
}
.chat-input input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
}

.send-btn {
  width: 38px;
  height: 38px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--primary-hover));
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(99,102,241,0.2);
}
.send-btn:hover:not(:disabled) {
  transform: scale(1.08);
  box-shadow: 0 4px 16px rgba(99,102,241,0.3);
}
.send-btn:disabled {
  background: var(--border-hover);
  box-shadow: none;
  cursor: not-allowed;
}
</style>
