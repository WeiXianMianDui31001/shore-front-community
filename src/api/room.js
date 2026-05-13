import request from './request'

export function getRooms(params) {
  return request.get('/rooms', { params })
}

export function createRoom(data) {
  return request.post('/rooms', data)
}

export function joinRoom(id, data) {
  return request.post(`/rooms/${id}/join`, data)
}

export function closeRoom(id) {
  return request.post(`/rooms/${id}/close`)
}

export function getMessages(id, params) {
  return request.get(`/rooms/${id}/messages`, { params })
}

export function getWhiteboardOps(id, params) {
  return request.get(`/rooms/${id}/whiteboard`, { params })
}
