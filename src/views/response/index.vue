<template>
  <div class="app-container">
    <div style="bottom: 10px">
      <el-button type="primary" align="right" @click="dialogFormVisible = true">添加Response</el-button>
    </div>

    <el-table :data="list" border>
      <el-table-column fixed align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column fixed label="response名称" width="180">
        <template slot-scope="scope">
          <el-button type="text" @click="getResponseFields(scope.row.id)">{{ scope.row.res_name }}</el-button>
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

    <!-- 创建/编辑 response -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules">
        <el-form-item label="respone名称" :label-width="formLabelWidth" prop="res_name" required>
          <el-input v-model="ruleForm.res_name" placeholder="例：AgentResponse" style="width: 70%"></el-input>
        </el-form-item>
        <el-form-item label="关联服务方法" :label-width="formLabelWidth" prop="base_set_id" required>
          <el-cascader clearable @change="selectPro" placeholder="请选择需要关联的服务方法"
                       v-model="ruleForm.base_set_id"
                       :options="pro_and_baseSet_List"
                       style="width: 35%;">
          </el-cascader>
        </el-form-item>
        <el-form-item :label-width="formLabelWidth"
                      v-for="(val, index) in ruleForm.res_values"
                      :label="'字段/类型' + (index+1)"
                      :prop="'res_values.' + index + '.field'"
                      :rules="{required: true, message: '字段名不能为空', trigger: 'blur'}"
                      required>
          <el-input v-model="val.field" placeholder="例：username" style="width: 30%"></el-input>
          <el-select v-model="val.type" placeholder="请选择字段类型">
            <el-option clearable filterable
                       v-for="item in proto_type"
                       :value="item.value">
            </el-option>
          </el-select>
          <el-button @click.prevent="removeMethod(val)" v-if="index > 0">删除</el-button>
          <el-button @click="addMethod" v-if="index <= 0">新增</el-button>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取 消</el-button>
        <el-button type="primary" v-if="ruleForm.id === 0 " @click="addResponse">确 定</el-button>
        <el-button type="primary" v-else-if="ruleForm.id > 0  " @click="submitEditService">提 交</el-button>
      </div>
    </el-dialog>

    <!-- 选项卡 -->
    <el-dialog :visible.sync="isShowTabs">
      <el-table :data="res_fields">
        <el-table-column fixed align="center" label="字段名称">
          <template slot-scope="scope">{{ scope.row.field }}</template>
        </el-table-column>
        <el-table-column fixed align="center" label="字段类型">
          <template slot-scope="scope">{{ scope.row.type }}</template>
        </el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
  import { Message } from 'element-ui'
  import { addProBaseSet, submitEditProBaseSet, getBaseList, genAllById, autoCode }  from '@/api/baseSet'
  import { getAllRes, addResponse }  from '@/api/response'
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
        title: "添加Response",
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
        res_fields:null,
        reqs:[],
        ress:[],
        ruleForm: {
          id: 0,
          res_name: '',
          base_set_id: '',
          res_values: [{
            'field': '',
            'type': '',
          }]
        },
        proto_type: [
          {'value':'int32'},
          {'value':'int64'},
          {'value':'uint32'},
          {'value':'uint64'},
          {'value':'string'},
          {'value':'array'},
          {'value':'bool'},
          {'value':'float32'},
          {'value':'float64'},
          {'value':'[]byte'},
          {'value':'singular'},
          {'value':'enum'},
          {'value':'message_request'},
        ],
        pro_and_baseSet_List: [
          {
            value: '11',
            label: '第一',
            children: [
              {
                value: '22',
                label: '第二',
                children: [
                  {
                    value: '33',
                    label: '第三'
                  }
                ]
              }
            ]
          }
        ],
        value: '',
        formLabelWidth: '110px',
        rules: {
          res_name: [
            { required: true, message: '请输入Response名称', trigger: 'blur'},
          ],
          base_set_id: [
            { required: true, message: '请选择基础包', trigger: 'change' }
          ]
        }
      }
    },
    created() {
      this.getAllRes()
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
                  let sers = [];
                  if (ite.proto_service != "") {
                    ite.proto_service.find(ser => {
                      if (ser.ser_methods == "" || ser.ser_methods == null) {
                      } else {
                        let methods = []
                        ser.ser_methods.find(me => {
                          methods.push({"value": me.id, "label": me.method_name})
                        })
                        sers.push({"value": ser.id, "label":ser.ser_name, "children": methods})
                      }
                    })
                    obs.push({"value": ite.id, "label":ite.package_name, "children": sers})
                  }
                }))
                obj.push({"value": item.id, "label": item.pro_name, "children": obs})
              }
            })

            this.pro_and_baseSet_List = obj
          }

          this.listLoading = false
        })
      },
      selectPro(proBaseId) {
        let obj = {};
        obj = this.pro_and_baseSet_List.filter((item) => {
          item.children.filter((chi) => {
            if (chi.id === proBaseId) {
              this.ruleForm.base_set_id = chi.id
            }
          })
        });
      },
      addResponse() {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            addResponse({
              "base_set_id": this.ruleForm.base_set_id[1],
              "ser_method_id":this.ruleForm.base_set_id[3],
              "res_name": this.ruleForm.res_name,
              "res_value": this.ruleForm.res_values
            }).then(
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
            console.log("添加Response失败")
            return false
          }
        })
      },
      getAllRes() {
        getAllRes().then(
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
            this.ruleForm.res_values.filter((ser_method) => {
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
      getResponseFields(id) {
        this.res_fields = null
        this.list.filter((value) => {
          if (id === value.id) {
            this.res_fields = value.Fields
          }
        })

        this.isShowTabs = true
      },
      addMethod() {
        this.ruleForm.res_values.push({'field': '', 'type': ''});
      },
      removeMethod(item) {
        let index = this.ruleForm.res_values.indexOf(item)
        if (index !== -1) {
          this.ruleForm.res_values.splice(index, 1)
        }
      },
      resetForm() {
        this.$refs['ruleForm'].resetFields();
        this.ruleForm.res_values = [{'field': '', 'type': ''}]
        this.dialogFormVisible = false
        this.title = '添加Response';
      }
    }
  }
</script>
