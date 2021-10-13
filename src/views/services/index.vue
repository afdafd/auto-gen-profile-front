<template>
  <div class="app-container">
    <div style="bottom: 10px">
      <el-button type="primary" align="right" @click="dialogFormVisible = true">添加服务</el-button>
    </div>

    <el-table :data="list" border>
      <el-table-column fixed align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column fixed label="服务名称" width="180">
        <template slot-scope="scope">
          <el-button type="text" @click="getServiceMethod(scope.row.id)">{{ scope.row.ser_name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作">
        <template slot-scope="scope">
          <el-button type="warning" plain @click="getOneServiceById(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑 服务 -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules">
        <el-form-item label="服务名称" :label-width="formLabelWidth" prop="ser_name" required>
          <el-input v-model="ruleForm.ser_name" placeholder="例：Agent" style="width: 70%"></el-input>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth"
                      v-for="(val, index) in ruleForm.ser_methods"
                      :label="'服务方法' + (index+1)"
                      :prop="'ser_methods.' + index + '.value'"
                      :rules="{
                        required: true, message: '服务方法名不能为空', trigger: 'blur'
                      }"
                      required>
          <el-input v-model="val.value" placeholder="例：getAgentInfoByAgentId" style="width: 60%"></el-input>
          <el-button @click.prevent="removeMethod(val)" v-if="index > 0">删除</el-button>
          <el-button @click="addMethod" v-if="index <= 0">新增</el-button>
        </el-form-item>
        <el-form-item label="关联包" :label-width="formLabelWidth" prop="base_set_id" required>
          <el-cascader clearable @change="selectPro"
                       v-model="ruleForm.base_set_id"
                       :options="pro_and_baseSet_List"
                       :show-all-levels="false"></el-cascader>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取 消</el-button>
        <el-button type="primary" v-if="ruleForm.id === 0 " @click="addService">确 定</el-button>
        <el-button type="primary" v-else-if="ruleForm.id > 0  " @click="submitEditService">提 交</el-button>
      </div>
    </el-dialog>

    <!-- 选项卡 -->
    <el-dialog :visible.sync="isShowTabs">
      <el-table :data="ser_methods">
        <el-table-column fixed align="center" label="服务方法">
          <template slot-scope="scope">{{ scope.row.method_name }}</template>
        </el-table-column>
        <el-table-column fixed align="center" label="请求体名称">
          <template slot-scope="scope">{{ scope.row.request_name }}</template>
        </el-table-column>
        <el-table-column fixed align="center" label="响应体名称">
          <template slot-scope="scope">{{ scope.row.response_name }}</template>
        </el-table-column>
        <el-table-column fixed align="center" label="创建时间">
          <template slot-scope="scope"> {{scope.row.created_at }} </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <el-drawer title="服务方法列表"
               :visible.sync="drawer"
               :destroy-on-close="true"
               :with-header="true"
               :direction="direction"
               :append-to-body="true"
               size="35%">
      <el-table :data="ser_methods" border>
        <el-table-column fixed align="center" label="方法名称">
          <template slot-scope="scope"> {{ scope.row.method_name }} </template>
        </el-table-column>
        <el-table-column fixed align="center" label="请求体名称">
          <template slot-scope="scope"> {{ scope.row.request_name }} </template>
        </el-table-column>
        <el-table-column fixed align="center" label="响应体名称">
          <template slot-scope="scope"> {{ scope.row.response_name }} </template>
        </el-table-column>
      </el-table>
    </el-drawer>
  </div>
</template>

<script>
  import { Message } from 'element-ui'
  import { addProBaseSet, submitEditProBaseSet, getBaseList, genAllById, autoCode }  from '@/api/baseSet'
  import { getList }  from '@/api/pro'
  import { addService, getAllServiceList, getOneServiceById, editProtoService}  from '@/api/services'

  export default {
    filters: {
      statusFilter(status) {
        const statusMap = {
          published: 'success',
          draft: 'gray',
          deleted: 'danger'
        }
        return statusMap[status]
      }
    },
    inject:['reload'],

    data() {
      return {
        list: null,
        title: "添加服务",
        listLoading: true,
        dialogTableVisible: false,
        dialogFormVisible: false,
        dialogEditFormVisible: false,
        isShowTabs: false,
        tabPosition: 'left',
        drawer: false,
        direction: 'ltr',
        activeName: 'first',
        sers:[],
        ser_methods:null,
        reqs:[],
        ress:[],
        ruleForm: {
          id: 0,
          ser_name: '',
          base_set_id: '',
          ser_methods: [{
            'value': ''
          }]
        },
        pro_and_baseSet_List: [
          {
            value: '',
            label: '',
            children: [
              {
                value: '',
                label: ''
              }
            ]
          }
        ],
        formLabelWidth: '110px',
        rules: {
          ser_name: [
            { required: true, message: '请输入服务名称', trigger: 'blur'},
          ],
          base_set_id: [
            { required: true, message: '请选择基础包', trigger: 'change' }
          ]
        }
      }
    },
    created() {
      this.getAllServiceList()
      this.getProList()
    },
    methods: {
      getProList() {
        this.listLoading = true
        getList().then( response => {
          if (response.data != "") {
            let obj = []

            response.data.find((item) => {
              let obs = []
              if (item.base_sets != "") {
                item.base_sets.find((ite => {
                  obs.push({"value": ite.id, "label":ite.package_name})
                }))

                obj.push({"value": item.id, "label": item.pro_name, "children": obs})
              }
            })

            this.pro_and_baseSet_List = obj
          }

          this.listLoading = false
        })
      },
      selectPro(proBaseId){
        let obj = {};
        obj = this.pro_and_baseSet_List.filter((item) => {
          item.children.filter((chi) => {
            if (chi.id === proBaseId) {
              this.ruleForm.base_set_id = chi.id
            }
          })
        });
      },
      addService() {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {

            let baseSetId = this.ruleForm.base_set_id[1]

            let serMethods = []
            this.ruleForm.ser_methods.filter((ser_method) => {
              serMethods.push(ser_method.value)
            })

            addService({"base_set_id": baseSetId, "ser_name": this.ruleForm.ser_name, "ser_methods": serMethods}).then(
              response => {
                Message({
                  message: '创建成功',
                  type: 'success',
                  duration: 2 * 1000
                })
                this.dialogFormVisible = false
                this.reload()
              },
              error => {
                Message({
                  message: error.message,
                  type: 'error',
                  duration: 4 * 1000
                })
              }
            )
          } else {
            console.log("添加项目失败")
            return false
          }
        })
      },
      getAllServiceList() {
        getAllServiceList().then(
          response => {
            this.list = response.data
          },
          error => {
            Message({
              message: error.message,
              type: 'error',
              duration: 4 * 1000
            })
          }
        )
      },
      submitEditService() {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            let baseSetId = 0
            if( Array.isArray(this.ruleForm.base_set_id)) {
              baseSetId = this.ruleForm.base_set_id[1];
            } else {
              baseSetId = this.ruleForm.base_set_id;
            }

            console.log(baseSetId)

            let serMethods = []
            this.ruleForm.ser_methods.filter((ser_method) => {
              serMethods.push(ser_method.value)
            })

            editProtoService({"id": this.ruleForm.id, "base_set_id": baseSetId, "ser_name": this.ruleForm.ser_name, "ser_methods": serMethods}).then(
              response => {
                Message({
                  message: '编辑成功',
                  type: 'success',
                  duration: 2 * 1000
                })
                this.dialogEditFormVisible = false
                this.reload()
              },
              error => {
                Message({
                  message: error.message,
                  type: 'error',
                  duration: 4 * 1000
                })
              }
            )
          } else {
            console.log("编辑失败")
            return false
          }
        })
      },
      getOneServiceById(id) {
        getOneServiceById({'id':id}).then(
          response => {
            this.ruleForm = response.data

            if (response.data.ser_methods == null) {
              this.ruleForm.ser_methods = [{ 'value': '' }]
            } else {
              let methods = []
              response.data.ser_methods.filter((method)=> {
                methods.push({"value": method.method_name})
              })
              this.ruleForm.ser_methods = methods
            }

            this.title = '编辑服务';
            this.dialogFormVisible = true
          },
          error => {
            Message({
              message: error.message,
              type: 'error',
              duration: 4 * 1000
            })
          }
        )
      },
      getServiceMethod(id) {
        this.ser_methods = null
        this.list.filter((value) => {
          if (id === value.id) {
            this.ser_methods = value.ser_methods
          }
        })

        this.isShowTabs = true
      },
      addMethod() {
        this.ruleForm.ser_methods.push({
          value: ''
        });
      },
      removeMethod(item) {
        let index = this.ruleForm.ser_methods.indexOf(item)
        if (index !== -1) {
          this.ruleForm.ser_methods.splice(index, 1)
        }
      },
      autoCode(id) {
        autoCode.then(
          response => {

          },
          error => {

          }
        )},
      resetForm() {
        this.$refs['ruleForm'].resetFields();
        this.ruleForm.ser_methods = [{ 'value': '' }]
        this.dialogFormVisible = false
        this.title = '添加服务';
      }
    }
  }
</script>
