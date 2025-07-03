<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAssistantConsultations } from '@/utils/interceptor/request'

// 咨询安排记录（助理）
const records = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 加载咨询记录
async function loadRecords(page = 1, size = 10) {
  loading.value = true
  try {
    const res = await fetchAssistantConsultations(page, size)
    if (res.code === 200 && res.data) {
      records.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载记录失败')
    }
  } catch {
    ElMessage.error('加载记录失败')
  } finally {
    loading.value = false
  }
}

function handlePageChange(page) {
  currentPage.value = page
  loadRecords(page, pageSize.value)
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadRecords(1, size)
}

onMounted(() => loadRecords(currentPage.value, pageSize.value))
</script>

<template>
  <el-card shadow>
    <h2>咨询安排记录（助理）</h2>
    <el-table :data="records" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="studentPhone" label="学生电话" />
      <el-table-column prop="counselorName" label="咨询师姓名" />
      <el-table-column prop="counselorPhone" label="咨询师电话" />
      <el-table-column prop="status" label="状态" />
      <el-table-column label="创建时间">
        <template #default="{ row }">
          {{ row.createdAt }}
        </template>
      </el-table-column>
      <el-table-column prop="sessionProgress" label="进度" />
      <el-table-column label="下次咨询时间">
        <template #default="{ row }">
          {{ row.nextSessionTime }}
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
</template>

<style scoped>
.pagination { margin-top: 16px; text-align: right; }
</style>
