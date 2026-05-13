import request from './request'

export function listPosts(params) {
  return request.get('/posts', { params })
}

export function recommendPosts(params) {
  return request.get('/posts/recommend', { params })
}

export function getPost(id) {
  return request.get(`/posts/${id}`)
}

export function createPost(data) {
  return request.post('/posts', data)
}

export function likePost(id) {
  return request.post(`/posts/${id}/like`)
}

export function unlikePost(id) {
  return request.delete(`/posts/${id}/like`)
}

export function collectPost(id) {
  return request.post(`/posts/${id}/collect`)
}

export function uncollectPost(id) {
  return request.delete(`/posts/${id}/collect`)
}

export function myPostCollects(params) {
  return request.get('/posts/my-collects', { params })
}

export function uploadImage(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/posts/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}

// 兼容旧接口，保留但不再使用
export function prepareImageUpload(params) {
  return request.post('/posts/images/prepare-upload', null, { params })
}

export function getComments(postId) {
  return request.get(`/posts/${postId}/comments`)
}

export function addComment(postId, data) {
  return request.post(`/posts/${postId}/comments`, data)
}

export function resolvePost(id) {
  return request.put(`/posts/${id}/resolve`)
}

export function updatePostStatus(id, status) {
  return request.put(`/admin/community/posts/${id}/status`, null, { params: { status } })
}

export function updateCommentStatus(id, status) {
  return request.put(`/admin/community/comments/${id}/status`, null, { params: { status } })
}

export function pinPost(id, pinned) {
  return request.put(`/admin/community/posts/${id}/pin`, null, { params: { pinned } })
}

export function endorsePost(id) {
  return request.post(`/posts/${id}/endorse`)
}

export function unendorsePost(id) {
  return request.delete(`/posts/${id}/endorse`)
}

export function getPendingExcellentPosts(params) {
  return request.get('/admin/community/posts/pending-excellent', { params })
}

export function excellentPost(id) {
  return request.post(`/admin/community/posts/${id}/excellent`)
}
