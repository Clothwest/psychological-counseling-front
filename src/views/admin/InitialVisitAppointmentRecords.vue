<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAllInitialVisits } from '@/utils/interceptor/request'

const visits = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

function loadVisits() {
  loading.value = true
  fetchAllInitialVisits(currentPage.value, pageSize.value)
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

onMounted(loadVisits)
</script>

<template>
  <div class="records-container">
    <el-card shadow="hover">
      <h2>初访预约记录</h2>

      <el-table :data="visits" v-loading="loading" stripe border>
        <el-table-column prop="id" label="编号" width="80" />
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="appointmentTime" label="预约时间" />
        <el-table-column prop="reason" label="预约原因" />
        <el-table-column prop="status" label="状态" />
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
.records-container {
  padding: 24px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
