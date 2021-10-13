import request from '@/utils/request'

//添加项目
export function addService(data) {
  return request({
    url: '/ser/add-proto-service',
    method: 'POST',
    data
  })
}

export function getAllServiceList(params) {
  return request({
    url: '/ser/get-all-service-list',
    method: 'GET',
    params
  })
}

export function getOneServiceById(params) {
  return request({
    url: '/ser/get-one-service-by-id',
    method: 'GET',
    params: params
  })
}

export function editProtoService(data) {
  return request({
    url: '/ser/edit-proto-service',
    method: 'PUT',
    data
  })
}
