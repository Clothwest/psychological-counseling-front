<script setup>
import { ref, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { fetchAppendRequests, approveAppendRequest, rejectAppendRequest } from '@/utils/interceptor/request'

// 追加咨询审核列表与分页
const requests = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalRequests = ref(0)

// 加载审核列表
async function loadRequests(page = 1, size = 10) {
  loading.value = true
  try {
    const res = await fetchAppendRequests(page, size)
    if (res.code === 200 && res.data && Array.isArray(res.data.records)) {
      requests.value = res.data.records
      totalRequests.value = res.data.total ?? requests.value.length
    } else {
      ElMessage.error(res.message || '加载审核失败')
    }
  } catch {
    ElMessage.error('加载审核失败')
  } finally {
    loading.value = false
  }
}

// 同意请求
function handleApprove(id) {
  ElMessageBox.confirm('确定要同意此追加请求？', '操作确认', { type: 'success' })
    .then(async () => {
      const res = await approveAppendRequest(id)
      if (res.code === 200) {
        ElMessage.success('已同意')
        loadRequests(currentPage.value, pageSize.value)
      } else {
        ElMessage.error(res.message || '同意失败')
      }
    })
    .catch(() => {})
}

// 拒绝请求
function handleReject(id) {
  ElMessageBox.confirm('确定要拒绝此追加请求？', '操作确认', { type: 'warning' })
    .then(async () => {
      const res = await rejectAppendRequest(id)
      if (res.code === 200) {
        ElMessage.success('已拒绝')
        loadRequests(currentPage.value, pageSize.value)
      } else {
        ElMessage.error(res.message || '拒绝失败')
      }
    })
    .catch(() => {})
}

// 分页控制
function handlePageChange(page) {
  currentPage.value = page
  loadRequests(page, pageSize.value)
}
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadRequests(1, size)
}

onMounted(() => loadRequests(currentPage.value, pageSize.value))
</script>

<template>
  <el-card shadow>
    <h2>追加咨询审核（管理员）</h2>
    <el-table :data="requests" v-loading="loading" stripe border style="width:100%">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="caseId" label="案例ID" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="requestedCount" label="追加次数" />
      <el-table-column prop="reason" label="原因" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="handleApprove(row.requestId)">同意</el-button>
          <el-button size="small" type="danger" @click="handleReject(row.requestId)">拒绝</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      background
      layout="sizes, prev, pager, next, jumper, ->, total"
      :total="totalRequests"
      :page-size="pageSize"
      :current-page="currentPage"
      :page-sizes="[5, 10, 20]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </el-card>
</template>

<style scoped>
.pagination { margin-top: 16px; text-align: right }
</style>
