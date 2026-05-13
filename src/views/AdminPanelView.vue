<template>
  <div class="page-container">
    <div class="page-header">
      <h2>管理后台</h2>
      <p class="page-desc">资源审核与帖子加精管理</p>
    </div>

    <div class="segmented">
      <button :class="{ active: activeTab === 'resources' }" @click="activeTab = 'resources'">资源审核</button>
      <button :class="{ active: activeTab === 'info' }" @click="activeTab = 'info'">信息库管理</button>
      <button :class="{ active: activeTab === 'excellent' }" @click="activeTab = 'excellent'">待加精帖子</button>
      <button :class="{ active: activeTab === 'points' }" @click="activeTab = 'points'">积分规则</button>
      <button :class="{ active: activeTab === 'users' }" @click="activeTab = 'users'">账号管理</button>
    </div>

    <!-- 资源审核 -->
    <div v-if="activeTab === 'resources'" class="tab-panel">
      <div class="sub-toolbar">
        <div class="pill-bar">
          <button :class="{ active: resourceStatus === null }" @click="resourceStatus = null; loadResources()">全部</button>
          <button :class="{ active: resourceStatus === 0 }" @click="resourceStatus = 0; loadResources()">待审核</button>
          <button :class="{ active: resourceStatus === 1 }" @click="resourceStatus = 1; loadResources()">已通过</button>
          <button :class="{ active: resourceStatus === 2 }" @click="resourceStatus = 2; loadResources()">已拒绝</button>
        </div>
      </div>

      <div v-if="resourceLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="res in resources" :key="res.id" class="admin-item card">
          <div class="item-main">
            <h4 class="item-title">{{ res.title }}</h4>
            <p class="item-desc">{{ res.description || '暂无简介' }}</p>
            <div class="item-meta">
              <span class="badge badge-info">{{ res.category }}</span>
              <span class="meta-text">上传者：{{ res.uploaderNickname || '用户' + res.uploaderId }}</span>
              <span class="meta-text">{{ formatTime(res.createdAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <span class="badge" :class="statusBadgeClass(res.status)">{{ statusText(res.status) }}</span>
            <button class="btn btn-sm btn-ghost" @click="previewFile(res.id)">预览</button>
            <template v-if="res.status === 0">
              <button class="btn btn-sm" style="background:#dcfce7;color:#16a34a;" @click="auditResource(res.id, 1)">通过</button>
              <button class="btn btn-sm" style="background:var(--danger-bg);color:var(--danger-text);" @click="auditResource(res.id, 2)">拒绝</button>
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
        <div class="pill-bar">
          <button :class="{ active: infoScene === null }" @click="infoScene = null; loadInfoList()">全部</button>
          <button :class="{ active: infoScene === 0 }" @click="infoScene = 0; loadInfoList()">考研</button>
          <button :class="{ active: infoScene === 1 }" @click="infoScene = 1; loadInfoList()">求职</button>
        </div>
        <div class="pill-bar">
          <button :class="{ active: infoStatus === null }" @click="infoStatus = null; loadInfoList()">全部</button>
          <button :class="{ active: infoStatus === 0 }" @click="infoStatus = 0; loadInfoList()">上架</button>
          <button :class="{ active: infoStatus === 1 }" @click="infoStatus = 1; loadInfoList()">下架</button>
        </div>
        <button class="btn btn-primary" @click="openInfoModal()">+ 新增信息</button>
      </div>

      <div v-if="infoLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="item in infoList" :key="item.id" class="admin-item card">
          <div class="item-main">
            <h4 class="item-title">{{ item.title }}</h4>
            <div class="item-meta">
              <span class="badge badge-info">{{ item.category }}</span>
              <span class="meta-text">{{ item.scene === 0 ? '考研' : '求职' }}</span>
              <span class="meta-text">来源：{{ item.sourceName || '-' }}</span>
              <span :class="['badge', item.status === 0 ? 'badge-success' : 'badge-danger']">{{ item.status === 0 ? '上架' : '下架' }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-sm btn-ghost" @click="openInfoModal(item)">编辑</button>
            <button v-if="item.status === 0" class="btn btn-sm" style="background:var(--danger-bg);color:var(--danger-text);" @click="toggleInfoStatus(item, 1)">下架</button>
            <button v-else class="btn btn-sm" style="background:#dcfce7;color:#16a34a;" @click="toggleInfoStatus(item, 0)">上架</button>
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
        <div class="field">
          <label>标题 *</label>
          <input v-model="infoModal.data.title" placeholder="信息标题" />
        </div>
        <div class="form-row">
          <div class="field">
            <label>场景 *</label>
            <select v-model.number="infoModal.data.scene">
              <option :value="0">考研</option>
              <option :value="1">求职</option>
            </select>
          </div>
          <div class="field">
            <label>分类</label>
            <input v-model="infoModal.data.category" placeholder="如：招生简章" />
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>来源名称</label>
            <input v-model="infoModal.data.sourceName" placeholder="如：北京大学研究生院" />
          </div>
          <div class="field">
            <label>来源链接</label>
            <input v-model="infoModal.data.sourceUrl" placeholder="https://..." />
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>更新日期</label>
            <input v-model="infoModal.data.updateTime" type="date" />
          </div>
          <div class="field">
            <label>排序权重</label>
            <input v-model.number="infoModal.data.sortOrder" type="number" />
          </div>
        </div>
        <div class="field">
          <label>标签（JSON数组）</label>
          <input v-model="infoModal.data.tags" placeholder='["北大", "计算机"]' />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="infoModal.show = false">取消</button>
          <button class="btn btn-primary" @click="saveInfo" :disabled="infoModal.loading">{{ infoModal.loading ? '保存中...' : '保存' }}</button>
        </div>
      </div>
    </div>

    <!-- 积分规则 -->
    <div v-if="activeTab === 'points'" class="tab-panel">
      <div class="card" style="max-width:640px">
        <div class="form-row">
          <div class="field">
            <label>下载消耗积分</label>
            <input v-model.number="ruleForm.downloadCost" type="number" min="0" />
          </div>
          <div class="field">
            <label>上传奖励积分</label>
            <input v-model.number="ruleForm.uploadReward" type="number" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>上传者分成比例（0~1）</label>
            <input v-model.number="ruleForm.shareRatio" type="number" min="0" max="1" step="0.01" />
          </div>
          <div class="field">
            <label>每日积分上限</label>
            <input v-model.number="ruleForm.dailyLimit" type="number" min="0" />
          </div>
        </div>
        <div class="form-row">
          <div class="field">
            <label>修改备注</label>
            <input v-model="ruleForm.changeNote" type="text" placeholder="可选" />
          </div>
        </div>
        <button class="btn btn-primary btn-lg" @click="saveRule" :disabled="ruleSaving">{{ ruleSaving ? '保存中...' : '保存修改' }}</button>
      </div>
    </div>

    <!-- 账号管理 -->
    <div v-if="activeTab === 'users'" class="tab-panel">
      <div class="sub-toolbar">
        <div class="search-box">
          <input v-model="userKeyword" placeholder="搜索邮箱或昵称..." @keyup.enter="userPage = 1; loadUsers()" />
          <button class="btn btn-primary btn-sm" @click="userPage = 1; loadUsers()">搜索</button>
        </div>
      </div>

      <div v-if="userLoading" class="loading">加载中...</div>

      <div v-else class="data-table">
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
            <img v-if="u.avatarUrl" :src="u.avatarUrl" class="user-avatar-sm" />
            <div v-else class="user-avatar-sm placeholder">{{ u.nickname?.[0] || '?' }}</div>
            <span>{{ u.nickname || '匿名' }}</span>
          </span>
          <span>{{ u.email }}</span>
          <span>{{ roleText(u.role) }}</span>
          <span>{{ u.pointsBalance || 0 }}</span>
          <span :class="['badge', u.status === 0 ? 'badge-success' : 'badge-danger']">{{ u.status === 0 ? '正常' : '禁用' }}</span>
          <span class="cell-actions">
            <button class="btn btn-sm btn-ghost" @click="toggleUserStatus(u)">{{ u.status === 0 ? '禁用' : '启用' }}</button>
            <button class="btn btn-sm btn-ghost" @click="openResetPassword(u)">重置密码</button>
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
        <p style="color:var(--text-muted);font-size:14px;margin-bottom:var(--space-4)">用户：{{ resetModal.user?.email }}</p>
        <div class="field">
          <input v-model="resetModal.newPassword" type="password" placeholder="输入新密码" />
        </div>
        <div class="modal-actions">
          <button class="btn btn-secondary" @click="resetModal.show = false">取消</button>
          <button class="btn btn-primary" @click="confirmResetPassword" :disabled="resetModal.loading">{{ resetModal.loading ? '处理中...' : '确认' }}</button>
        </div>
      </div>
    </div>

    <!-- 待加精帖子 -->
    <div v-if="activeTab === 'excellent'" class="tab-panel">
      <div v-if="excellentLoading" class="loading">加载中...</div>

      <div v-else class="admin-list">
        <div v-for="post in pendingPosts" :key="post.id" class="admin-item card">
          <div class="item-main">
            <h4 class="item-title">{{ post.title }}</h4>
            <p class="item-desc">{{ excerpt(post.content) }}</p>
            <div class="item-meta">
              <span class="meta-text">作者：{{ post.authorNickname || '用户' + post.authorId }}</span>
              <span class="meta-text">
                <span style="margin-right:4px">&#128077;</span> {{ post.endorseCount || 0 }} 认可
              </span>
              <span class="meta-text">{{ formatTime(post.createdAt) }}</span>
            </div>
          </div>
          <div class="item-actions">
            <button class="btn btn-sm" style="background:#fef3c7;color:#d97706" @click="markExcellent(post.id)">加精</button>
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
import { auditList, auditResource as auditResourceApi, previewResource, getCurrentRule, updateCurrentRule, getUserList, updateUserStatus, resetUserPassword, getAdminInfoList, saveAdminInfo, updateAdminInfo } from '../api/admin'
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

function statusBadgeClass(status) {
  if (status === 0) return 'badge-warning'
  if (status === 1) return 'badge-success'
  if (status === 2) return 'badge-danger'
  return 'badge-neutral'
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
.segmented {
  margin-bottom: var(--space-4);
}

.sub-toolbar {
  margin-bottom: var(--space-4);
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.pill-bar {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.pill-bar button {
  padding: 6px 14px;
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-full);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.15s;
}

.pill-bar button:hover {
  border-color: var(--border-hover);
  color: var(--text);
}

.pill-bar button.active {
  background: var(--primary);
  color: var(--text-on-primary);
  border-color: var(--primary);
}

.admin-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.admin-item {
  display: flex;
  justify-content: space-between;
  gap: var(--space-5);
  padding: var(--space-5) var(--space-6);
  align-items: flex-start;
}

.item-main {
  flex: 1;
  min-width: 0;
}

.item-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text);
  margin-bottom: var(--space-1);
}

.item-desc {
  color: var(--text-secondary);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: var(--space-2);
}

.item-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.meta-text {
  font-size: 13px;
  color: var(--text-muted);
}

.item-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: var(--space-2);
  min-width: 80px;
}

.cell-user {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.user-avatar-sm {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  object-fit: cover;
}

.user-avatar-sm.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--primary);
  color: var(--text-on-primary);
  font-size: 12px;
  font-weight: 600;
}

.cell-actions {
  display: flex;
  gap: var(--space-2);
}
</style>
