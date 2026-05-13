<template>
  <div class="admin-page">
    <div class="page-header">
      <h2>管理后台</h2>
      <p class="page-desc">资源审核与帖子加精管理</p>
    </div>

    <div class="admin-tabs">
      <button :class="{ active: activeTab === 'resources' }" @click="activeTab = 'resources'">资源审核</button>
      <button :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">信息库管理</button>
      <button :class="{ active: activeTab === 'excellent' }" @click="activeTab = 'excellent'">待加精帖子</button>
      <button :class="{ active: activeTab === 'points' }" @click="activeTab = 'points'">积分规则</button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">账号管理</button>
    </div>

    <!-- 资源审核 -->
    <div v-if="activeTab === 'resources'" class="tab-panel">
      <div class="sub-toolbar">
        <div class="status-filter">
          <button :class="{ active: resourceStatus === null }" @click="resourceStatus = null; loadResources()">全部</button>
          <button :class="{ active: resourceStatus === 0 }" @click="resourceStatus = 0; loadResources()">待审核</button>
          <button :class="{ active: resourceStatus === 1 }" @click="resourceStatus = 1; loadResources()">已通过</button>
          <button :class="{ active: resourceStatus === 2 }" @click="resourceStatus = 2; loadResources()">已拒绝</button>
        </div>
      </div>

      <div v-if="resourceLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="res in resources" :key="res.id" class="admin-item">
          <div class="item-main">
            <h4 class="item-title">{{ res.title }}</h4>
            <p class="item-desc">{{ res.description || '暂无简介' }}</p>
            <div class="item-meta">
              <span class="category-tag">{{ res.category }}</span>
              <span class="meta-text">上传者：{{ res.uploaderNickname || '用户' + res.uploaderId }}</span>
              <span class="meta-text">{{ formatTime(res.createdAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <span class="status-badge" :class="statusClass(res.status)">{{ statusText(res.status) }}</span>
            <button class="action-btn preview" @click="previewFile(res.id)">&#128269; 预览</button>
            <template v-if="res.status === 0">
              <button class="action-btn approve" @click="auditResource(res.id, 1)">通过</button>
              <button class="action-btn reject" @click="auditResource(res.id, 2)">拒绝</button>
            </template>
          </div>
        </div>
      </div>

      <div v-if="!resourceLoading && resources.length === 0" class="empty">暂无资源</div>

      <div v-if="resourceTotalPages > 1" class="pagination">
        <button :disabled="resourcePage <= 1" @click="resourcePage--; loadResources()">上一页</button>
        <span>{{ resourcePage }} / {{ resourceTotalPages }}</span>
        <button :disabled="resourcePage >= resourceTotalPages" @click="resourcePage++; loadResources()">下一页</button>
      </div>
    </div>

    <!-- 信息库管理 -->
    <div v-if="activeTab === 'info'" class="tab-panel">
      <div class="sub-toolbar">
        <div class="scene-filter">
          <button :class="{ active: infoScene === null }" @click="infoScene = null; loadInfoList()">全部</button>
          <button :class="{ active: infoScene === 0 }" @click="infoScene = 0; loadInfoList()">考研</button>
          <button :class="{ active: infoScene === 1 }" @click="infoScene = 1; loadInfoList()">求职</button>
        </div>
        <div class="status-filter">
          <button :class="{ active: infoStatus === null }" @click="infoStatus = null; loadInfoList()">全部</button>
          <button :class="{ active: infoStatus === 0 }" @click="infoStatus = 0; loadInfoList()">上架</button>
          <button :class="{ active: infoStatus === 1 }" @click="infoStatus = 1; loadInfoList()">下架</button>
        </div>
        <button class="btn-create" @click="openInfoModal()">+ 新增信息</button>
      </div>

      <div v-if="infoLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="item in infoList" :key="item.id" class="admin-item">
          <div class="item-main">
            <h4 class="item-title">{{ item.title }}</h4>
            <div class="item-meta">
              <span class="category-tag">{{ item.category }}</span>
              <span class="meta-text">{{ item.scene === 0 ? '考研' : '求职' }}</span>
              <span class="meta-text">来源：{{ item.sourceName || '-' }}</span>
              <span :class="['status-text', item.status === 0 ? 'normal' : 'disabled']">{{ item.status === 0 ? '上架' : '下架' }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="action-btn small" @click="openInfoModal(item)">编辑</button>
            <button v-if="item.status === 0" class="action-btn reject" @click="toggleInfoStatus(item, 1)">下架</button>
            <button v-else class="action-btn approve" @click="toggleInfoStatus(item, 0)">上架</button>
          </div>
        </div>
      </div>

      <div v-if="!infoLoading && infoList.length === 0" class="empty">暂无信息</div>

      <div v-if="infoTotalPages > 1" class="pagination">
        <button :disabled="infoPage <= 1" @click="infoPage--; loadInfoList()">上一页</button>
        <span>{{ infoPage }} / {{ infoTotalPages }}</span>
        <button :disabled="infoPage >= infoTotalPages" @click="infoPage++; loadInfoList()">下一页</button>
      </div>
    </div>

    <!-- 信息库编辑弹窗 -->
    <div v-if="infoModal.show" class="modal-overlay" @click.self="infoModal.show = false">
      <div class="modal-card wide">
        <h3>{{ infoModal.isEdit ? '编辑信息' : '新增信息' }}</h3>
        <div class="form-field">
          <label>标题 *</label>
          <input v-model="infoModal.data.title" placeholder="信息标题" />
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>场景 *</label>
            <select v-model.number="infoModal.data.scene">
              <option :value="0">考研</option>
              <option :value="1">求职</option>
            </select>
          </div>
          <div class="form-field">
            <label>分类</label>
            <input v-model="infoModal.data.category" placeholder="如：招生简章" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>来源名称</label>
            <input v-model="infoModal.data.sourceName" placeholder="如：北京大学研究生院" />
          </div>
          <div class="form-field">
            <label>来源链接</label>
            <input v-model="infoModal.data.sourceUrl" placeholder="https://..." />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>更新日期</label>
            <input v-model="infoModal.data.updateTime" type="date" />
          </div>
          <div class="form-field">
            <label>排序权重</label>
            <input v-model.number="infoModal.data.sortOrder" type="number" />
          </div>
        </div>
        <div class="form-field">
          <label>标签（JSON数组）</label>
          <input v-model="infoModal.data.tags" placeholder='["北大", "计算机"]' />
        </div>
        <div class="modal-actions">
          <button class="cancel" @click="infoModal.show = false">取消</button>
          <button class="confirm" @click="saveInfo" :disabled="infoModal.loading">{{ infoModal.loading ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 积分规则 -->
    <div v-if="activeTab === 'points'" class="tab-panel">
      <div class="rule-form">
        <div class="form-row">
          <div class="form-field">
            <label>下载消耗积分</label>
            <input v-model.number="ruleForm.downloadCost" type="number" min="0" />
          </div>
          <div class="form-field">
            <label>上传奖励积分</label>
            <input v-model.number="ruleForm.uploadReward" type="number" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field">
            <label>上传者分成比例（0~1）</label>
            <input v-model.number="ruleForm.shareRatio" type="number" min="0" max="1" step="0.01" />
          </div>
          <div class="form-field">
            <label>每日积分上限</label>
            <input v-model.number="ruleForm.dailyLimit" type="number" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-field full">
            <label>修改备注</label>
            <input v-model="ruleForm.changeNote" type="text" placeholder="可选" />
          </div>
        </div>
        <button class="save-btn" @click="saveRule" :disabled="ruleSaving">{{ ruleSaving ? '保存中...' : '保存修改' }}</button>
      </div>
    </div>

    <!-- 账号管理 -->
    <div v-if="activeTab === 'users'" class="tab-panel">
      <div class="sub-toolbar">
        <div class="search-box">
          <input v-model="userKeyword" placeholder="搜索邮箱或昵称..." @keyup.enter="userPage = 1; loadUsers()" />
          <button class="search-btn" @click="userPage = 1; loadUsers()">搜索</button>
        </div>
      </div>

      <div v-if="userLoading" class="loading">加载中...</div>

      <div v-else class="user-table">
        <div class="table-header">
          <span>用户</span>
          <span>邮箱</span>
          <span>身份</span>
          <span>积分</span>
          <span>状态</span>
          <span>操作</span>
        </div>
        <div v-for="u in users" :key="u.id" class="table-row">
          <span class="cell-user">
            <img v-if="u.avatarUrl" :src="u.avatarUrl" class="user-avatar" />
            <div v-else class="user-avatar placeholder">{{ u.nickname?.[0] || '?' }}</div>
            <span>{{ u.nickname || '匿名' }}</span>
          </span>
          <span>{{ u.email }}</span>
          <span>{{ roleText(u.role) }}</span>
          <span>{{ u.pointsBalance || 0 }}</span>
          <span :class="['status-text', u.status === 0 ? 'normal' : 'disabled']">{{ u.status === 0 ? '正常' : '禁用' }}</span>
          <span class="cell-actions">
            <button class="action-btn small" @click="toggleUserStatus(u)">{{ u.status === 0 ? '禁用' : '启用' }}</button>
            <button class="action-btn small" @click="openResetPassword(u)">重置密码</button>
          </span>
        </div>
      </div>

      <div v-if="!userLoading && users.length === 0" class="empty">暂无用户</div>

      <div v-if="userTotalPages > 1" class="pagination">
        <button :disabled="userPage <= 1" @click="userPage--; loadUsers()">上一页</button>
        <span>{{ userPage }} / {{ userTotalPages }}</span>
        <button :disabled="userPage >= userTotalPages" @click="userPage++; loadUsers()">下一页</button>
      </div>
    </div>

    <!-- 重置密码弹窗 -->
    <div v-if="resetModal.show" class="modal-overlay" @click.self="resetModal.show = false">
      <div class="modal-card">
        <h3>重置密码</h3>
        <p>用户：{{ resetModal.user?.email }}</p>
        <input v-model="resetModal.newPassword" type="password" placeholder="输入新密码" />
        <div class="modal-actions">
          <button class="cancel" @click="resetModal.show = false">取消</button>
          <button class="confirm" @click="confirmResetPassword" :disabled="resetModal.loading">{{ resetModal.loading ? '处理中...' : '确认' }}</button>
        </div>
      </div>
    </div>

    <!-- 待加精帖子 -->
    <div v-if="activeTab === 'excellent'" class="tab-panel">
      <div v-if="excellentLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="post in pendingPosts" :key="post.id" class="admin-item">
          <div class="item-main">
            <h4 class="item-title">{{ post.title }}</h4>
            <p class="item-desc">{{ excerpt(post.content) }}</p>
            <div class="item-meta">
              <span class="meta-text">作者：{{ post.authorNickname || '用户' + post.authorId }}</span>
              <span class="meta-text endorse-count">
                <span class="endorse-icon">&#128077;</span> {{ post.endorseCount || 0 }} 认可
              </span>
              <span class="meta-text">{{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="action-btn excellent" @click="markExcellent(post.id)">加精</button>
          </div>
        </div>
      </div>

      <div v-if="!excellentLoading && pendingPosts.length === 0" class="empty">暂无待加精帖子</div>

      <div v-if="excellentTotalPages > 1" class="pagination">
        <button :disabled="excellentPage <= 1" @click="excellentPage--; loadPendingPosts()">上一页</button>
        <span>{{ excellentPage }} / {{ excellentTotalPages }}</span>
        <button :disabled="excellentPage >= excellentTotalPages" @click="excellentPage++; loadPendingPosts()">下一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { auditList, auditResource as auditResourceApi, previewResource, getCurrentRule, updateCurrentRule, getUserList, updateUserStatus, resetUserPassword, getAdminInfoList, saveAdminInfo, updateAdminInfo, batchOfflineInfo } from '../api/admin'
import { getPendingExcellentPosts, excellentPost } from '../api/community'

const activeTab = ref('resources')

// Resources
const resources = ref([])
const resourceLoading = ref(false)
const resourcePage = ref(1)
const resourceSize = ref(10)
const resourceTotal = ref(0)
const resourceStatus = ref(null)

const resourceTotalPages = computed(() => Math.ceil(resourceTotal.value / resourceSize.value))

// Excellent posts
const pendingPosts = ref([])
const excellentLoading = ref(false)
const excellentPage = ref(1)
const excellentSize = ref(10)
const excellentTotal = ref(0)

const excellentTotalPages = computed(() => Math.ceil(excellentTotal.value / excellentSize.value))

// Points rule
const ruleForm = ref({ downloadCost: 5, uploadReward: 10, shareRatio: 0.3, dailyLimit: 50, changeNote: '' })
const ruleSaving = ref(false)

// Users
const users = ref([])
const userLoading = ref(false)
const userPage = ref(1)
const userSize = ref(10)
const userTotal = ref(0)
const userKeyword = ref('')

const userTotalPages = computed(() => Math.ceil(userTotal.value / userSize.value))

// Info management
const infoList = ref([])
const infoLoading = ref(false)
const infoPage = ref(1)
const infoSize = ref(10)
const infoTotal = ref(0)
const infoScene = ref(null)
const infoStatus = ref(null)

const infoTotalPages = computed(() => Math.ceil(infoTotal.value / infoSize.value))

const infoModal = ref({
  show: false,
  isEdit: false,
  loading: false,
  data: {
    title: '',
    scene: 0,
    category: '',
    sourceName: '',
    sourceUrl: '',
    updateTime: '',
    sortOrder: 0,
    tags: '[]'
  }
})

const resetModal = ref({ show: false, user: null, newPassword: '', loading: false })

function roleText(role) {
  if (role === 0) return '备考'
  if (role === 1) return '求职'
  if (role === 2) return '管理员'
  return ''
}

function statusText(status) {
  if (status === 0) return '待审核'
  if (status === 1) return '已通过'
  if (status === 2) return '已拒绝'
  return '未知'
}

function statusClass(status) {
  if (status === 0) return 'status-pending'
  if (status === 1) return 'status-approved'
  if (status === 2) return 'status-rejected'
  return ''
}

function excerpt(content) {
  if (!content) return ''
  return content.length > 120 ? content.slice(0, 120) + '...' : content
}

function formatTime(t) {
  if (!t) return ''
  const d = new Date(t)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

async function loadResources() {
  resourceLoading.value = true
  try {
    const params = { page: resourcePage.value, size: resourceSize.value }
    if (resourceStatus.value !== null) params.status = resourceStatus.value
    const res = await auditList(params)
    resources.value = res.data.records || []
    resourceTotal.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    resourceLoading.value = false
  }
}

async function loadPendingPosts() {
  excellentLoading.value = true
  try {
    const res = await getPendingExcellentPosts({
      page: excellentPage.value,
      size: excellentSize.value
    })
    pendingPosts.value = res.data.records || []
    excellentTotal.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    excellentLoading.value = false
  }
}

async function previewFile(id) {
  try {
    const res = await previewResource(id)
    const url = res.data
    if (url) {
      window.open(url, '_blank')
    }
  } catch (e) {
    alert(e.message || '预览失败')
  }
}

async function auditResource(id, action) {
  const reason = action === 2 ? prompt('请输入拒绝原因：') || '' : ''
  try {
    await auditResourceApi(id, action, reason)
    loadResources()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

async function markExcellent(id) {
  if (!confirm('确认将该帖子加精为经验帖？')) return
  try {
    await excellentPost(id)
    loadPendingPosts()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

async function loadRule() {
  try {
    const res = await getCurrentRule()
    const r = res.data
    if (r) {
      ruleForm.value = {
        downloadCost: r.downloadCost ?? 5,
        uploadReward: r.uploadReward ?? 10,
        shareRatio: r.shareRatio ?? 0.3,
        dailyLimit: r.dailyLimit ?? 50,
        changeNote: ''
      }
    }
  } catch (e) {
    console.error(e)
  }
}

async function saveRule() {
  ruleSaving.value = true
  try {
    await updateCurrentRule(ruleForm.value)
    alert('保存成功')
  } catch (e) {
    alert(e.message || '保存失败')
  } finally {
    ruleSaving.value = false
  }
}

async function loadUsers() {
  userLoading.value = true
  try {
    const params = { page: userPage.value, size: userSize.value }
    if (userKeyword.value) params.keyword = userKeyword.value
    const res = await getUserList(params)
    users.value = res.data.records || []
    userTotal.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    userLoading.value = false
  }
}

async function toggleUserStatus(u) {
  const newStatus = u.status === 0 ? 1 : 0
  const reason = newStatus === 1 ? '管理员禁用' : '管理员启用'
  try {
    await updateUserStatus(u.id, newStatus, reason)
    u.status = newStatus
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

function openResetPassword(u) {
  resetModal.value = { show: true, user: u, newPassword: '', loading: false }
}

async function confirmResetPassword() {
  if (!resetModal.value.newPassword) {
    alert('请输入新密码')
    return
  }
  resetModal.value.loading = true
  try {
    await resetUserPassword(resetModal.value.user.id, resetModal.value.newPassword)
    alert('密码重置成功')
    resetModal.value.show = false
  } catch (e) {
    alert(e.message || '操作失败')
  } finally {
    resetModal.value.loading = false
  }
}

async function loadInfoList() {
  infoLoading.value = true
  try {
    const params = { page: infoPage.value, size: infoSize.value }
    if (infoScene.value !== null) params.scene = infoScene.value
    if (infoStatus.value !== null) params.status = infoStatus.value
    const res = await getAdminInfoList(params)
    infoList.value = res.data.records || []
    infoTotal.value = res.data.total || 0
  } catch (e) {
    console.error(e)
  } finally {
    infoLoading.value = false
  }
}

function openInfoModal(item = null) {
  if (item) {
    infoModal.value = {
      show: true,
      isEdit: true,
      loading: false,
      data: {
        id: item.id,
        title: item.title,
        scene: item.scene,
        category: item.category || '',
        sourceName: item.sourceName || '',
        sourceUrl: item.sourceUrl || '',
        updateTime: item.updateTime || '',
        sortOrder: item.sortOrder || 0,
        tags: item.tags || '[]'
      }
    }
  } else {
    infoModal.value = {
      show: true,
      isEdit: false,
      loading: false,
      data: {
        title: '',
        scene: 0,
        category: '',
        sourceName: '',
        sourceUrl: '',
        updateTime: '',
        sortOrder: 0,
        tags: '[]'
      }
    }
  }
}

async function saveInfo() {
  const data = { ...infoModal.value.data }
  if (!data.title) {
    alert('请填写标题')
    return
  }
  infoModal.value.loading = true
  try {
    if (infoModal.value.isEdit) {
      await updateAdminInfo(data.id, data)
    } else {
      await saveAdminInfo(data)
    }
    infoModal.value.show = false
    loadInfoList()
  } catch (e) {
    alert(e.message || '保存失败')
  } finally {
    infoModal.value.loading = false
  }
}

async function toggleInfoStatus(item, newStatus) {
  const actionName = newStatus === 0 ? '上架' : '下架'
  if (!confirm(`确认${actionName}《${item.title}》？`)) return
  try {
    await updateAdminInfo(item.id, { status: newStatus })
    loadInfoList()
  } catch (e) {
    alert(e.message || '操作失败')
  }
}

watch(activeTab, (tab) => {
  if (tab === 'resources') loadResources()
  if (tab === 'info') loadInfoList()
  if (tab === 'excellent') loadPendingPosts()
  if (tab === 'points') loadRule()
  if (tab === 'users') loadUsers()
})

onMounted(() => {
  loadResources()
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

.admin-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
}
.admin-tabs button {
  padding: 10px 24px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  color: #555;
}
.admin-tabs button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}

.sub-toolbar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.status-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.status-filter button {
  padding: 8px 14px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}
.status-filter button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}
.scene-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.scene-filter button {
  padding: 8px 14px;
  border: 1.5px solid #e0ddd5;
  background: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 13px;
  color: #555;
}
.scene-filter button.active {
  background: #1a3a5c;
  color: #fff;
  border-color: #1a3a5c;
}
.btn-create {
  padding: 10px 20px;
  border: none;
  background: #c9a96e;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  margin-left: auto;
}
.btn-create:hover {
  background: #b8985a;
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.admin-item {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  border: 1px solid #ebe8e0;
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
}
.item-main {
  flex: 1;
  min-width: 0;
}
.item-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 6px;
}
.item-desc {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 10px;
}
.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.category-tag {
  font-size: 12px;
  padding: 3px 8px;
  background: #e3f2fd;
  color: #1565c0;
  border-radius: 6px;
}
.meta-text {
  font-size: 13px;
  color: #888;
}
.endorse-count {
  display: flex;
  align-items: center;
  gap: 4px;
}
.endorse-icon {
  font-size: 14px;
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  min-width: 80px;
}
.status-badge {
  font-size: 12px;
  padding: 3px 8px;
  border-radius: 6px;
  font-weight: 500;
}
.status-pending { background: #fff3e0; color: #e65100; }
.status-approved { background: #e8f5e9; color: #2e7d32; }
.status-rejected { background: #fce4ec; color: #c2185b; }

.action-btn {
  padding: 6px 14px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
}
.action-btn.approve {
  background: #e8f5e9;
  color: #2e7d32;
}
.action-btn.approve:hover {
  background: #2e7d32;
  color: #fff;
}
.action-btn.reject {
  background: #fce4ec;
  color: #c2185b;
}
.action-btn.reject:hover {
  background: #c2185b;
  color: #fff;
}
.action-btn.preview {
  background: #e3f2fd;
  color: #1565c0;
}
.action-btn.preview:hover {
  background: #1565c0;
  color: #fff;
}
.action-btn.excellent {
  background: #fff8e1;
  color: #e65100;
}
.action-btn.excellent:hover {
  background: #e65100;
  color: #fff;
}

.loading, .empty {
  text-align: center;
  padding: 60px 0;
  color: #999;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-top: 32px;
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

.rule-form {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  border: 1px solid #ebe8e0;
  max-width: 600px;
}
.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}
.form-field {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-field.full {
  flex: 1 1 100%;
}
.form-field label {
  font-size: 13px;
  color: #666;
  font-weight: 500;
}
.form-field input {
  padding: 10px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #faf9f7;
}
.form-field input:focus {
  border-color: #c9a96e;
}
.form-field select {
  padding: 10px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #faf9f7;
  width: 100%;
}
.save-btn {
  margin-top: 8px;
  padding: 12px 32px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 600;
}
.save-btn:hover:not(:disabled) {
  background: #0f2540;
}
.save-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.user-table {
  background: #fff;
  border-radius: 16px;
  border: 1px solid #ebe8e0;
  overflow: hidden;
}
.table-header, .table-row {
  display: grid;
  grid-template-columns: 1.5fr 2fr 0.8fr 0.8fr 0.8fr 1.5fr;
  align-items: center;
  padding: 14px 20px;
  gap: 12px;
}
.table-header {
  background: #faf9f7;
  font-weight: 600;
  font-size: 14px;
  color: #555;
}
.table-row {
  border-top: 1px solid #f0ece4;
  font-size: 14px;
  color: #333;
}
.cell-user {
  display: flex;
  align-items: center;
  gap: 8px;
}
.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}
.user-avatar.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #1a3a5c;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
}
.status-text.normal { color: #2e7d32; }
.status-text.disabled { color: #c2185b; }
.cell-actions {
  display: flex;
  gap: 8px;
}
.action-btn.small {
  padding: 4px 10px;
  font-size: 12px;
}

.search-box {
  display: flex;
  gap: 8px;
}
.search-box input {
  padding: 10px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  background: #fff;
  width: 260px;
}
.search-btn {
  padding: 10px 20px;
  border: none;
  background: #1a3a5c;
  color: #fff;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 200;
}
.modal-card {
  background: #fff;
  border-radius: 16px;
  padding: 28px;
  width: 360px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.2);
}
.modal-card.wide {
  width: 520px;
}
.modal-card h3 {
  font-family: 'Noto Serif SC', serif;
  font-size: 20px;
  color: #1a3a5c;
  margin-bottom: 8px;
}
.modal-card p {
  color: #888;
  font-size: 14px;
  margin-bottom: 16px;
}
.modal-card input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e0ddd5;
  border-radius: 10px;
  font-size: 14px;
  margin-bottom: 20px;
}
.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
.modal-actions button {
  padding: 8px 20px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  border: none;
}
.modal-actions .cancel {
  background: #f5f3ef;
  color: #555;
}
.modal-actions .confirm {
  background: #1a3a5c;
  color: #fff;
}
</style>
