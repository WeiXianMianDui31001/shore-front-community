<template>
  <div class="page-container">
    <div class="page-header">
      <h2>我的积分</h2>
      <p class="page-desc">积分收支明细，每一笔都清晰可查</p>
    </div>

    <div class="summary-grid">
      <div class="summary-card primary">
        <span class="summary-label">当前余额</span>
        <span class="summary-value">{{ summary.balance || 0 }}</span>
        <span class="summary-unit">积分</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">今日收入</span>
        <span class="summary-value income">+{{ summary.todayIncome || 0 }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">今日支出</span>
        <span class="summary-value expense">-{{ summary.todayExpense || 0 }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">累计收入</span>
        <span class="summary-value income">{{ summary.totalIncome || 0 }}</span>
      </div>
      <div class="summary-card">
        <span class="summary-label">累计支出</span>
        <span class="summary-value expense">{{ summary.totalExpense || 0 }}</span>
      </div>
    </div>

    <div class="card">
      <div class="section-header">
        <h3 class="section-title">积分流水</h3>
        <select v-model="filterType" @change="page = 1; loadTransactions()" class="filter-select">
          <option value="">全部</option>
          <option value="UPLOAD_REWARD">上传奖励</option>
          <option value="DOWNLOAD_COST">下载消耗</option>
          <option value="DOWNLOAD_SHARE">下载分成</option>
          <option value="EXCELLENT_POST">经验帖奖励</option>
        </select>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="tx-list">
        <div v-for="tx in transactions" :key="tx.id" class="tx-item">
          <div class="tx-icon" :class="txIconClass(tx.sourceType)" v-html="txIcon(tx.sourceType)"></div>
          <div class="tx-main">
            <span class="tx-name">{{ txName(tx.sourceType) }}</span>
            <span v-if="tx.note" class="tx-note">{{ tx.note }}</span>
            <span class="tx-time">{{ formatTime(tx.createdAt) }}</span>
          </div>
          <div class="tx-amount" :class="tx.amount > 0 ? 'income' : 'expense'">
            {{ tx.amount > 0 ? '+' : '' }}{{ tx.amount }}
          </div>
        </div>
      </div>

      <div v-if="!loading && transactions.length === 0" class="empty">暂无流水记录</div>

      <div v-if="totalPages > 1" class="pagination">
        <button :disabled="page <= 1" @click="page--; loadTransactions()">上一页</button>
        <span>{{ page }} / {{ totalPages }}</span>
        <button :disabled="page >= totalPages" @click="page++; loadTransactions()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getPointsSummary, getPointsTransactions } from '../api/points'

const summary = ref({})
const transactions = ref([])
const loading = ref(false)
const page = ref(1)
const size = ref(15)
const total = ref(0)
const filterType = ref('')

const totalPages = computed(() => Math.ceil(total.value / size.value))

function txIcon(sourceType) {
  const map = {
    'UPLOAD_REWARD': '&#127942;',
    'DOWNLOAD_COST': '&#128229;',
    'DOWNLOAD_SHARE': '&#128176;',
    'EXCELLENT_POST': '&#11088;',
    'DAILY_LIMIT': '&#128721;'
  }
  return map[sourceType] || '&#128200;'
}

function txIconClass(sourceType) {
  const map = {
    'UPLOAD_REWARD': 'icon-reward',
    'DOWNLOAD_COST': 'icon-cost',
    'DOWNLOAD_SHARE': 'icon-share',
    'EXCELLENT_POST': 'icon-star'
  }
  return map[sourceType] || ''
}

function txName(sourceType) {
  const map = {
    'UPLOAD_REWARD': '上传奖励',
    'DOWNLOAD_COST': '下载消耗',
    'DOWNLOAD_SHARE': '下载分成',
    'EXCELLENT_POST': '经验帖奖励',
    'DAILY_LIMIT': '单日上限'
  }
  return map[sourceType] || sourceType
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')} ${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`
}

async function loadSummary() {
  try {
    const res = await getPointsSummary()
    summary.value = res.data || {}
  } catch (e) {
    console.error(e)
  }
}

async function loadTransactions() {
  loading.value = true
  try {
    const params = { page: page.value, size: size.value }
    if (filterType.value) params.sourceType = filterType.value
    const res = await getPointsTransactions(params)
    transactions.value = res.data.records || []
    total.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadSummary()
  loadTransactions()
})
</script>

<style scoped>
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.summary-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.summary-card.primary {
  background: var(--primary);
  color: var(--text-on-primary);
  border-color: var(--primary);
}

.summary-label {
  font-size: 13px;
  color: var(--text-muted);
}

.summary-card.primary .summary-label {
  color: rgba(255, 255, 255, 0.7);
}

.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--text);
}

.summary-card.primary .summary-value {
  color: var(--text-on-primary);
}

.summary-value.income {
  color: var(--success);
}

.summary-value.expense {
  color: var(--danger);
}

.summary-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.card {
  padding: var(--space-6);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-5);
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}

.filter-select {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  background: var(--bg);
  outline: none;
  cursor: pointer;
  color: var(--text-secondary);
}

.filter-select:focus {
  border-color: var(--primary);
}

.tx-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.tx-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg);
  border-radius: var(--radius-md);
  transition: background 0.15s;
}

.tx-item:hover {
  background: var(--surface-hover);
}

.tx-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-size: 16px;
  flex-shrink: 0;
  background: var(--surface);
}

.tx-icon.icon-reward { background: #dcfce7; }
.tx-icon.icon-cost { background: var(--danger-bg); }
.tx-icon.icon-share { background: #dbeafe; }
.tx-icon.icon-star { background: #fef3c7; }

.tx-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.tx-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--text);
}

.tx-note {
  font-size: 13px;
  color: var(--text-secondary);
}

.tx-time {
  font-size: 12px;
  color: var(--text-muted);
}

.tx-amount {
  font-size: 16px;
  font-weight: 700;
  flex-shrink: 0;
}

.tx-amount.income {
  color: var(--success);
}

.tx-amount.expense {
  color: var(--danger);
}
</style>
