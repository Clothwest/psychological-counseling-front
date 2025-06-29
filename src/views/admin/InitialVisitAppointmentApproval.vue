<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getPendingInitialVisits, approveInitialVisit, rejectInitialVisit } from '@/utils/interceptor/request'

const visits = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

function loadVisits() {
  loading.value = true
  getPendingInitialVisits(currentPage.value, pageSize.value)
    .then(res => {
      if (res.code === 200) {
        visits.value = res.data.records
        total.value = res.data.total
      } else {
        ElMessage.error(res.message || '加载失败')
      }
    })
    .catch(() => ElMessage.error('加载失败'))
    .finally(() => loading.value = false)
}

function handlePageChange(page) {
  currentPage.value = page
  loadVisits()
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadVisits()
}

function approve(id) {
  ElMessageBox.confirm('确认批准此预约？', '操作确认', { type: 'success' })
    .then(() => approveInitialVisit(id))
    .then(() => {
      ElMessage.success('已批准')
      loadVisits()
    })
    .catch(() => {})
}

function reject(id) {
  ElMessageBox.confirm('确认拒绝此预约？', '操作确认', { type: 'warning' })
    .then(() => rejectInitialVisit(id))
    .then(() => {
      ElMessage.success('已拒绝')
      loadVisits()
    })
    .catch(() => {})
}

onMounted(loadVisits)
</script>

<template>
  <div class="approval-container">
    <el-card>
      <h2>初访预约审核</h2>
      <el-table :data="visits" v-loading="loading" stripe border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="appointmentTime" label="预约时间" />
        <el-table-column prop="reason" label="预约原因" />
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button type="success" size="small" @click="approve(row.id)">批准</el-button>
            <el-button type="danger" size="small" @click="reject(row.id)">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        class="pagination"
        background
        layout="sizes, prev, pager, next, jumper, ->, total"
        :total="total"
        :page-size="pageSize"
        :current-page="currentPage"
        :page-sizes="[5, 10, 20]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>
  </div>
</template>

<style scoped>
.approval-container {
  padding: 24px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
