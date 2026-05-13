import request from './request'

export function auditList(params) {
  return request.get('/admin/resources/audit', { params })
}

export function getAdminInfoList(params) {
  return request.get('/admin/info', { params })
}

export function saveAdminInfo(data) {
  return request.post('/admin/info', data)
}

export function updateAdminInfo(id, data) {
  return request.put(`/admin/info/${id}`, data)
}

export function batchOfflineInfo(ids) {
  return request.put('/admin/info/batch-offline', { ids })
}

export function auditResource(id, action, reason) {
  return request.post(`/admin/resources/${id}/audit`, { action, reason })
}

export function previewResource(id) {
  return request.get(`/admin/resources/${id}/preview`)
}

export function getCurrentRule() {
  return request.get('/admin/points-rule/current')
}

export function updateCurrentRule(data) {
  return request.put('/admin/points-rule/current', data)
}

export function getUserList(params) {
  return request.get('/admin/users', { params })
}

export function updateUserStatus(id, status, reason) {
  return request.put(`/admin/users/${id}/status`, { status, reason })
}

export function resetUserPassword(id, newPassword) {
  return request.put(`/admin/users/${id}/password`, { newPassword })
}
