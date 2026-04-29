import request from './request'

export function login(data) {
  return request.post('/auth/login', data)
}

export function register(data) {
  return request.post('/auth/register', data)
}

export function getMe() {
  return request.get('/user/me')
}

export function sendVerifyCode(data) {
  return request.post('/auth/verify-code', data)
}
