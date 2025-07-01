<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import UserAddForm from '@/components/UserAddForm.vue'
import { fetchUsers, deleteUser, updateUser } from '@/utils/interceptor/request'

const users = ref([])
const total = ref(0)
const loading = ref(false)
const pageSize = ref(5)
const currentPage = ref(1)
const username = ref('')
const showDialog = ref(false)
const isEdit = ref(false)
const editingUser = ref(null)

async function loadUsers() {
  loading.value = true
  try {
    const res = await fetchUsers(currentPage.value, pageSize.value, username.value)
    if (res.code === 200 && res.data) {
      users.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载用户列表失败')
    }
  } catch {
    ElMessage.error('加载用户列表失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page) {
  currentPage.value = page
  loadUsers()
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadUsers()
}

function openAdd() {
  isEdit.value = false
  editingUser.value = { username: '', name: '', phone: '', role: '', college: '', gender: '', password: '' }
  showDialog.value = true
}

function openEdit(row) {
  isEdit.value = true
  editingUser.value = { ...row }
  showDialog.value = true
}

function handleDelete(row) {
  ElMessageBox.confirm(
    `确认要删除用户 “${row.username}”-“${row.name}” 吗？`,
    '删除确认',
    { type: 'warning' }
  ).then(async () => {
    try {
      await deleteUser(row.id)
      ElMessage.success('删除成功')
      loadUsers()
    } catch {
      ElMessage.error('删除失败')
    }
  })
}

function onSaved() {
  showDialog.value = false
  // ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
  loadUsers()
}


onMounted(loadUsers)
</script>

<template>
  <div class="user-manage-container">
    <div class="toolbar">
      <el-input v-model="username" placeholder="搜索" clearable @clear="() => { currentPage.value = 1; loadUsers() }"
        @keyup.enter="() => { currentPage.value = 1; loadUsers() }" style="width: 240px;" />
      <el-button type="primary" @click="openAdd">添加用户</el-button>
    </div>

    <el-table :data="users" border stripe v-loading="loading" style="width: 100%;">
      <el-table-column prop="username" label="用户名" width="80" />
      <el-table-column prop="name" label="姓名" />
      <el-table-column prop="phone" label="电话号码" />
      <el-table-column prop="role" label="职位" width="120" />
      <el-table-column prop="college" label="学院" />
      <el-table-column label="性别" width="80">
        <template #default="{ row }">
          {{ row.gender === 'MALE' ? '男' : row.gender === 'FEMALE' ? '女' : '' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination class="pagination" background layout="sizes, prev, pager, next, jumper, ->, total" :total="total"
      :page-size="pageSize" :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" @current-change="handlePageChange"
      @size-change="handleSizeChange" />

    <el-dialog :title="isEdit ? '编辑用户' : '添加用户'" v-model="showDialog" width="500px" destroy-on-close>
      <UserAddForm :initUser="editingUser" :isEdit="isEdit" @added="onSaved" @cancel="showDialog = false" />
    </el-dialog>

  </div>
</template>

<style scoped>
.user-manage-container {
  padding: 24px;
  background: #f5f7fa;
  min-height: 100%;
}

.toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.toolbar .el-input {
  margin-right: 16px;
}

.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
