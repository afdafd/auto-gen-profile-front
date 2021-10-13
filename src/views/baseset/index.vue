<template>
  <div class="app-container">
    <div style="bottom: 10px">
      <el-button type="primary" align="right" @click="dialogFormVisible = true">添加基础包</el-button>
    </div>

    <el-table :data="list" border>
      <el-table-column fixed align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column fixed label="包名称" width="180">
        <template slot-scope="scope">
          <el-button type="text" @click="getAllByBaseId(scope.row.id)">{{ scope.row.package_name }}</el-button>
        </template>
      </el-table-column>
      <el-table-column label="类名称" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.class_name }}</span>
        </template>
      </el-table-column>
      <el-table-column label="是否自动生成代码" align="center">
        <template slot-scope="scope">
            {{ scope.row.is_auto_gen_code == 1 ? "是": "否" }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作">
        <template slot-scope="scope">
          <el-button type="primary" plain @click="autoCode(scope.row.id)">生成proto文件</el-button>
          <el-button type="warning" plain @click="getProBaseSetById(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建/编辑 包基础 -->
    <el-dialog :title="title" :visible.sync="dialogFormVisible">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules">
        <el-form-item label="包名称" :label-width="formLabelWidth" prop="package_name" required>
          <el-input v-model="ruleForm.package_name" placeholder="例：carUserCenter"></el-input>
        </el-form-item>
        <el-form-item label="类名称" :label-width="formLabelWidth" prop="class_name" required>
          <el-input v-model="ruleForm.class_name" placeholder="例：agent (最后生成的类名就是 agent.php)"></el-input>
        </el-form-item>
        <el-form-item label="项目名" :label-width="formLabelWidth" prop="set_id" required>
          <el-select @change="selectPro" v-model="ruleForm.set_id" clearable filterable placeholder="请选择" >
            <el-option v-for="item in proList" :key="item.id" :label="item.pro_name" :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="自动生成代码" :label-width="formLabelWidth" prop="is_auto_gen_code" required>
          <el-radio v-model="ruleForm.is_auto_gen_code" label=1>是</el-radio>
          <el-radio v-model="ruleForm.is_auto_gen_code" label=0>否</el-radio>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取 消</el-button>
        <el-button type="primary" v-if="ruleForm.id === 0 " @click="addProBaseSet">确 定</el-button>
        <el-button type="primary" v-else-if="ruleForm.id > 0  " @click="submitEditProBaseSet">提 交</el-button>
      </div>
    </el-dialog>

    <!-- 选项卡 -->
    <el-dialog :visible.sync="isShowTabs">
      <el-tabs v-model="activeName">
        <el-tab-pane label="Service" name="first">
          <el-table :data="sers">
            <el-table-column fixed align="center" label="服务名称">
              <template slot-scope="scope">
                <el-button type="text" @click="getServiceMethod(scope.row.id)">{{ scope.row.ser_name }}</el-button>
              </template>
            </el-table-column>
            <el-table-column fixed align="center" label="创建时间">
              <template slot-scope="scope"> {{scope.row.created_at }} </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="Request" name="second">
          2
        </el-tab-pane>
        <el-tab-pane label="Response" name="third">
          3
        </el-tab-pane>
      </el-tabs>
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
  import { addProBaseSet, submitEditProBaseSet, getProBaseSetById, getBaseList, genAllById, autoCode }  from '@/api/baseSet'
  import { getList }  from '@/api/pro'
  import { Message } from 'element-ui'

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
        proList:[],
        title: "添加基础包",
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
          package_name: '',
          class_name: '',
          is_auto_gen_code: '0',
          set_id: ''
        },
        formLabelWidth: '110px',
        rules: {
          package_name: [
            { required: true, message: '请输入包名称', trigger: 'blur'},
          ],
          class_name: [
            { required: true, message: '请输类名称', trigger: 'change' }
          ],
          set_id: [
            { required: true, message: '请选择项目', trigger: 'change' }
          ],
          is_auto_gen_code: [
            { required: true, message: '请选择是否自动生成代码', trigger: 'change' }
          ]
        }
      }
    },
    created() {
      this.fetchData()
      this.getProList()
      this.$refs['ruleForm'].resetFields()
    },
    methods: {
      fetchData() {
        this.listLoading = true
        getBaseList().then(response => {
          this.list = response.data
          this.listLoading = false
        })
      },
      getProList() {
        this.listLoading = true
        getList().then( response => {
          this.proList = response.data
          this.listLoading = false
        })
      },
      selectPro(proId){
        let obj = {};
        obj = this.proList.find((item) => {
          return item.id === proId;
        });

        this.ruleForm.set_id = obj.id
      },
      addProBaseSet() {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            addProBaseSet(this.ruleForm).then(
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
      getProBaseSetById(id) {
        getProBaseSetById({"id": id}).then(
          response => {
            this.title = "编辑基础包"
            this.ruleForm = response.data
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
      submitEditProBaseSet() {
        this.$refs['ruleForm'].validate((valid) => {
          if (valid) {
            submitEditProBaseSet(this.ruleForm).then(
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
      getAllByBaseId(id) {
        genAllById({'id':id}).then(
          response => {
            this.sers = response.data.sers
            this.reqs = response.data.reqs
            this.ress = response.data.ress
            this.isShowTabs = true
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
        this.sers.filter((value) => {
          if (id === value.id) {
            this.ser_methods = value.ser_methods
          }
        })

        this.drawer = true
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
        this.dialogFormVisible = false
      }
    }
  }
</script>
