import request from './request'

export function listInfo(params) {
  return request.get('/info', { params })
}

export function getInfoDetail(id) {
  return request.get(`/info/${id}`)
}

export function getInfoCategories(scene) {
  return request.get('/info/categories', { params: { scene } })
}

// 收藏使用通用接口
export function collectInfo(targetId) {
  return request.post('/favorites', { targetType: 'INFO', targetId })
}

export function uncollectInfo(targetId) {
  return request.delete('/favorites', { data: { targetType: 'INFO', targetId } })
}
