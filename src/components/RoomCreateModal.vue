<template>
  <div v-if="visible" class="modal-overlay" @click.self="close">
    <div class="modal-card">
      <h3>创建讨论室</h3>
      <form @submit.prevent="submit">
        <div class="field">
          <label>房间名称</label>
          <input v-model="form.name" placeholder="例如：高数冲刺组" required />
        </div>
        <div class="field">
          <label>密码（可选）</label>
          <input v-model="form.password" type="password" placeholder="留空即为公开房间" />
        </div>
        <div class="field">
          <label>最大人数</label>
          <input v-model.number="form.maxMembers" type="number" min="2" max="100" required />
        </div>
        <div class="field">
          <label>有效时长（分钟）</label>
          <input v-model.number="form.expireMinutes" type="number" min="10" max="1440" required />
        </div>
        <div class="actions">
          <button type="button" class="btn-secondary" @click="close">取消</button>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? '创建中...' : '创建' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { createRoom } from '../api/room'

const props = defineProps({ visible: Boolean })
const emit = defineEmits(['close', 'created'])

const loading = ref(false)
const form = reactive({
  name: '',
  password: '',
  maxMembers: 50,
  expireMinutes: 120
})

function close() {
  emit('close')
}

async function submit() {
  loading.value = true
  try {
    const res = await createRoom({ ...form })
    emit('created', res.data)
    form.name = ''
    form.password = ''
  } catch (e) {
    alert(e.message || '创建失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal-card {
  width: 400px;
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}
.modal-card h3 {
  margin-bottom: 16px;
  font-size: 18px;
  font-family: 'Noto Serif SC', serif;
  color: var(--primary);
}
.field {
  margin-bottom: 14px;
}
.field label {
  display: block;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 6px;
  font-weight: 500;
}
.field input {
  width: 100%;
  padding: 10px 12px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  outline: none;
  background: var(--bg);
}
.field input:focus {
  border-color: var(--primary);
}
.actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 8px;
}
.btn-secondary {
  padding: 8px 18px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
}
.btn-primary {
  padding: 8px 18px;
  border: none;
  background: var(--primary);
  color: var(--text-on-primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}
.btn-primary:hover:not(:disabled) {
  background: var(--primary-hover);
}
.btn-primary:disabled {
  background: var(--border-hover);
}
</style>
