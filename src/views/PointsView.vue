<template>
  <div class="points-page">
    <div class="page-header">
      <h2>我的积分</h2>
      <p class="page-desc">积分收支明细，每一笔都清晰可查</p>
    </div>

    <div class="summary-cards">
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

    <div class="transactions-section">
      <div class="section-header">
        <h3 class="section-title">积分流水</h3>
        <div class="filter">
          <select v-model="filterType" @change="page = 1; loadTransactions()">
            <option value="">全部</option>
            <option value="UPLOAD_REWARD">上传奖励</option>
            <option value="DOWNLOAD_COST">下载消耗</option>
            <option value="DOWNLOAD_SHARE">下载分成</option>
            <option value="EXCELLENT_POST">经验帖奖励</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="loading">加载中...</div>

      <div v-else class="transactions">
        <div v-for="tx in transactions" :key="tx.id" class="tx-item">
          <div class="tx-main">
            <div class="tx-type">
              <span class="tx-icon" :class="txIconClass(tx.sourceType)">{{ txIcon(tx.sourceType) }}</span>
              <span class="tx-name">{{ txName(tx.sourceType) }}</span>
            </div>
            <div class="tx-note" v-if="tx.note">{{ tx.note }}</div>
            <div class="tx-time">{{ formatTime(tx.createdAt) }}</div>
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
.page-header {
  margin-bottom: 24px;
}
.page-header h2 {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  color: #1a3a5c;
}
.page-desc {
  color: #888;
  font-size: 14px;
  margin-top: 4px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}
.summary-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #ebe8e0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.summary-card.primary {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}
.summary-label {
  font-size: 13px;
  color: #888;
}
.summary-card.primary .summary-label {
  color: rgba(255,255,255,0.7);
}
.summary-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}
.summary-card.primary .summary-value {
  color: #fff;
}
.summary-value.income {
  color: #2e7d32;
}
.summary-value.expense {
  color: #c62828;
}
.summary-unit {
  font-size: 12px;
  color: rgba(255,255,255,0.6);
}

.transactions-section {
  background: #fff;
  border-radius: 20px;
  padding: 24px;
  border: 1px solid #ebe8e0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  color: #1a3a5c;
}
.filter select {
  padding: 8px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 10px;
  font-size: 14px;
  background: #faf9f7;
  outline: none;
  cursor: pointer;
}

.transactions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.tx-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: #faf9f7;
  border-radius: 12px;
}
.tx-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.tx-type {
  display: flex;
  align-items: center;
  gap: 8px;
}
.tx-icon {
  font-size: 18px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0ece4;
  border-radius: 8px;
}
.tx-icon.icon-reward { background: #e8f5e9; }
.tx-icon.icon-cost { background: #fce4ec; }
.tx-icon.icon-share { background: #e3f2fd; }
.tx-icon.icon-star { background: #fff8e1; }
.tx-name {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}
.tx-note {
  font-size: 13px;
  color: #666;
}
.tx-time {
  font-size: 12px;
  color: #aaa;
}
.tx-amount {
  font-size: 18px;
  font-weight: 700;
}
.tx-amount.income {
  color: #2e7d32;
}
.tx-amount.expense {
  color: #c62828;
}

.loading, .empty {
  text-align: center;
  padding: 40px 0;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 24px;
}
.pagination button {
  padding: 8px 18px;
  border: 1px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
}
.pagination button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
</style>
