import request from './request'

export function getUserInfo() {
  return request.get('/user/me')
}

export function updateProfile(data) {
  return request.put('/user/me', data)
}

export function uploadAvatar(file) {
  const formData = new FormData()
  formData.append('file', file)
  return request.post('/user/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
}
