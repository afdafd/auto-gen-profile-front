import request from '@/utils/request'

//添加项目
export function addProSet(data) {
  return request({
    url: '/set/add-pro-set',
    method: 'POST',
    data
  })
}

//提交编辑
export function submitEditProSet(data) {
  return request({
    url: '/set/edit-pro-set',
    method: 'PUT',
    data
  })
}

//通过ID获取一条项目数据
export function getProSetById(data) {
  return request({
    url: '/set/get-one-pro-set-by-id',
    method: 'GET',
    params: data
  })
}

//获取项目列表
export function getList(params) {
  return request({
    url: '/set/get-pro-set-list',
    method: 'GET',
    params
  })
}
