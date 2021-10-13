<template>
  <div class="app-container">
    <div style="bottom: 10px">
      <el-button type="primary" align="right" @click="dialogFormVisible = true">创建项目</el-button>
    </div>

    <el-table :data="list" border>
      <el-table-column fixed align="center" label="ID" width="95">
        <template slot-scope="scope">
          {{ scope.row.id }}
        </template>
      </el-table-column>
      <el-table-column fixed label="项目名称" width="180">
        <template slot-scope="scope">
          {{ scope.row.pro_name }}
        </template>
      </el-table-column>
      <el-table-column label="项目路径" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.pro_path }}</span>
        </template>
      </el-table-column>
      <el-table-column label="主机名" align="center">
        <template slot-scope="scope">
          {{ scope.row.host_name }}
        </template>
      </el-table-column>
      <el-table-column class-name="status-col" label="用户名" align="center">
        <template slot-scope="scope">
         {{ scope.row.user_name }}
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="创建时间">
        <template slot-scope="scope">
          <span>{{ scope.row.created_at }}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" prop="created_at" label="操作">
        <template slot-scope="scope">
          <el-button type="warning" plain @click="getProSetById(scope.row.id)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 创建proto项目 -->
    <el-dialog title="创建项目" :visible.sync="dialogFormVisible">
      <el-form :model="ruleForm" ref="ruleForm" :rules="rules">
        <el-form-item label="项目名称" :label-width="formLabelWidth" prop="pro_name" required>
          <el-input v-model="ruleForm.pro_name"></el-input>
        </el-form-item>
        <el-form-item label="项目路径" :label-width="formLabelWidth" prop="pro_path" required>
          <el-input v-model="ruleForm.pro_path"></el-input>
        </el-form-item>
        <el-form-item label="主  机" :label-width="formLabelWidth" prop="host_name" required>
          <el-input v-model="ruleForm.host_name" placeholder="例：127.0.0.0:80"></el-input>
        </el-form-item>
        <el-form-item label="用户名称" :label-width="formLabelWidth" prop="user_name" required>
          <el-input v-model="ruleForm.user_name"></el-input>
        </el-form-item>
        <el-form-item label="密  码" :label-width="formLabelWidth" prop="pwd" required>
          <el-input v-model="ruleForm.pwd"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetForm">取 消</el-button>
        <el-button type="primary" @click="addProSet">确 定</el-button>
      </div>
    </el-dialog>

    <!-- 编辑proto项目 -->
    <el-dialog title="编辑项目" :visible.sync="dialogEditFormVisible">
      <el-form :model="ruleForm"  ref="ruleForm" :rules="rules">
        <el-form-item label="项目名称" :label-width="formLabelWidth" prop="pro_name" required>
          <el-input v-model="ruleForm.pro_name"></el-input>
        </el-form-item>
        <el-form-item label="项目路径" :label-width="formLabelWidth" prop="pro_path" required>
          <el-input v-model="ruleForm.pro_path"></el-input>
        </el-form-item>
        <el-form-item label="主  机" :label-width="formLabelWidth" prop="host_name" required>
          <el-input v-model="ruleForm.host_name" placeholder="例：127.0.0.0:80"></el-input>
        </el-form-item>
        <el-form-item label="用户名称" :label-width="formLabelWidth" prop="user_name" required>
          <el-input v-model="ruleForm.user_name"></el-input>
        </el-form-item>
        <el-form-item label="密  码" :label-width="formLabelWidth" prop="pwd" required>
          <el-input v-model="ruleForm.pwd"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetEditForm">取 消</el-button>
        <el-button type="primary" @click="submitEditProSet">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getList, addProSet, getProSetById, submitEditProSet }  from '@/api/pro'
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
      listLoading: true,
      dialogTableVisible: false,
      dialogFormVisible: false,
      dialogEditFormVisible: false,
      ruleForm: {
        pro_name: '',
        pro_path: '',
        host_name: '',
        user_name: '',
        pwd: '',
      },
      formLabelWidth: '110px',
      rules: {
        pro_name: [
          { required: true, message: '请输入项目名称', trigger: 'blur'},
        ],
        pro_path: [
          { required: true, message: '请输入项目路径', trigger: 'change' }
        ],
        host_name: [
          { required: true, message: '请输入主机名', trigger: 'change' }
        ],
        user_name: [
          { required: true, message: '请输入用户名', trigger: 'change' }
        ],
        pwd: [
          { required: true, message: '请输入密码', trigger: 'change' }
        ]
      }
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.listLoading = true
      getList().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    addProSet() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          addProSet(this.ruleForm).then(
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
    getProSetById(id) {
      console.log("id:", id)
      getProSetById({"id": id}).then(
        response => {
          console.log("结果数据", response.data)
          this.ruleForm = response.data
          this.dialogEditFormVisible = true
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
    submitEditProSet() {
      this.$refs['ruleForm'].validate((valid) => {
        if (valid) {
          submitEditProSet(this.ruleForm).then(
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
    resetForm() {
      this.$refs['ruleForm'].resetFields();
      this.dialogFormVisible = false
    },
    resetEditForm() {
      this.$refs['ruleForm'].resetFields();
      this.dialogEditFormVisible = false
    }
  }
}
</script>
