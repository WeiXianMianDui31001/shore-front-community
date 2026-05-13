import request from './request'

export function getNotifications(params) {
  return request.get('/notifications', { params })
}

export function getUnreadCount() {
  return request.get('/notifications/unread-count')
}

export function readNotifications(ids) {
  return request.put('/notifications/read', { ids })
}

export function readAllNotifications() {
  return request.put('/notifications/read-all')
}
