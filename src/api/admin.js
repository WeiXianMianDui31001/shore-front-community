import request from './request'

export function auditList(params) {
  return request.get('/admin/resources/audit', { params })
}

export function auditResource(id, action, reason) {
  return request.post(`/admin/resources/${id}/audit`, { action, reason })
}

export function previewResource(id) {
  return request.get(`/admin/resources/${id}/preview`)
}
