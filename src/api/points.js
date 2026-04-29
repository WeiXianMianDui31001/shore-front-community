import request from './request'

export function getPointsSummary() {
  return request.get('/user/points/summary')
}

export function getPointsTransactions(params) {
  return request.get('/user/points/transactions', { params })
}
