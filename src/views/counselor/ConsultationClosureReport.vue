<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchReportList, exportSingleReport } from '@/utils/interceptor/request'

// 报告列表与分页
const reports = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const totalReports = ref(0)

// 加载报告列表
async function loadReports(page = 1, size = 10) {
  loading.value = true
  try {
    const res = await fetchReportList(page, size)
    if (res.code === 200 && res.data && Array.isArray(res.data.records)) {
      reports.value = res.data.records.map(item => ({ ...item.reportContent, caseId: item.caseId }))
      totalReports.value = res.data.total ?? reports.value.length
    } else {
      ElMessage.error(res.message || '加载报告失败')
    }
  } catch {
    ElMessage.error('加载报告失败')
  } finally {
    loading.value = false
  }
}

// 下载单个报告 Word
async function downloadReport(caseId) {
  try {
    const arrayBuffer = await exportSingleReport(caseId)
    const blob = new Blob([arrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `report_${caseId}.docx`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch {
    ElMessage.error('下载报告失败')
  }
}

// 分页控制
function handlePageChange(page) {
  currentPage.value = page
  loadReports(page, pageSize.value)
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadReports(1, size)
}

onMounted(() => loadReports(currentPage.value, pageSize.value))
</script>

<template>
  <el-card shadow>
    <h2>咨询结案报告列表</h2>
    <el-table :data="reports" v-loading="loading" stripe border style="width:100%">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="studentId" label="来访者学号" />
      <el-table-column prop="studentName" label="来访者姓名" />
      <el-table-column prop="gender" label="来访者性别" />
      <el-table-column prop="department" label="来访者院系" />
      <el-table-column prop="phone" label="联系电话" />
      <el-table-column prop="problemType" label="问题类型" />
      <el-table-column prop="totalSessions" label="咨询总次数" />
      <el-table-column prop="selfEvaluation" label="咨询效果自评" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="downloadReport(row.caseId)">下载报告</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      background
      layout="sizes, prev, pager, next, jumper, ->, total"
      :total="totalReports"
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
