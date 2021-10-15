import request from '@/utils/request'

//添加项目
export function getAllReqs(params) {
  return request({
    url: '/req/get-all-reqs',
    method: 'GET',
    params
  })
}

export function addRequest(data) {
  return request({
    url: '/req/add-proto-msg-request',
    method: 'POST',
    data
  })
}
