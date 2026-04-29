import request from './request'

export function listResources(params) {
  return request.get('/resources', { params })
}

export function getResource(id) {
  return request.get(`/resources/${id}`)
}

export function prepareResourceUpload(params) {
  return request.post('/resources/upload/prepare', params)
}

export function submitResource(data) {
  return request.post('/resources', data)
}

export function downloadResource(id) {
  return request.post(`/resources/${id}/download`)
}

export function myUploads(params) {
  return request.get('/resources/my', { params })
}

export function getCategories() {
  // 分类列表可以硬编码或从后端获取，暂时硬编码
  return Promise.resolve({ data: ['考研资料', '求职简历', '面试经验', '笔试真题', '课程笔记', '其他'] })
}
