import request from '@/utils/request'

//获取全部的responses
export function getAllRes(params) {
  return request({
    url: '/res/get-all-ress',
    method: 'GET',
    params
  })
}

//添加response
export function addResponse(data) {
  return request({
    url: '/res/add-proto-msg-response',
    method: 'POST',
    data
  })
}
