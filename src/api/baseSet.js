import request from '@/utils/request'

//添加包设置
export function addProBaseSet(data) {
  return request({
    url: '/base/add-proto-base-set',
    method: 'POST',
    data
  })
}

//提交编辑
export function submitEditProBaseSet(data) {
  return request({
    url: '/base/edit-proto-base-set',
    method: 'PUT',
    data
  })
}

//通过ID获取一条基础数据
export function getProBaseSetById(data) {
  return request({
    url: '/base/get-one-base-by-id',
    method: 'GET',
    params: data
  })
}

//获取包设置列表
export function getBaseList(params) {
  return request({
    url: '/base/get-base-list',
    method: 'GET',
    params
  })
}

//通过基础设置ID获取service、request、response
export function genAllById(params) {
  return request({
    url: '/base/gen-all-by-id',
    method: 'GET',
    params
  })
}

//生成protofile文件
export function autoCode(data) {
  return request({
    url: '/base/gen-proto-file',
    method: 'POST',
    data
  })
}
