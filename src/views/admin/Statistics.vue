<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchReportStats } from '@/utils/interceptor/request'

// 搜索条件
const filters = reactive({
  pageNum: 1,
  pageSize: 10,
  studentKeyword: '',
  counselorName: '',
  problemType: '',
  startDate: '',
  endDate: ''
})

// 列表与分页
const stats = ref([])
const loading = ref(false)
const total = ref(0)

// 加载数据
async function loadStats() {
  loading.value = true
  try {
    const payload = { ...filters }
    const res = await fetchReportStats(payload)
    if (res.code === 200 && res.data && Array.isArray(res.data.records)) {
      // 直接使用后台字段
      stats.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载统计失败')
    }
  } catch {
    ElMessage.error('加载统计失败')
  } finally {
    loading.value = false
  }
}

// 搜索
function doSearch() {
  filters.pageNum = 1
  loadStats()
}

// 分页事件
function handlePageChange(page) {
  filters.pageNum = page
  loadStats()
}
function handleSizeChange(size) {
  filters.pageSize = size
  filters.pageNum = 1
  loadStats()
}

onMounted(() => loadStats())
</script>

<template>
  <el-card shadow>
    <h2>统计分析</h2>
    <div class="filter-bar">
      <el-input v-model="filters.studentKeyword" placeholder="学生姓名/学号" style="width:200px; margin-right:8px;" />
      <el-input v-model="filters.counselorName" placeholder="咨询师姓名" style="width:200px; margin-right:8px;" />
      <el-input v-model="filters.problemType" placeholder="问题类型" style="width:200px; margin-right:8px;" />
      <el-date-picker v-model="filters.startDate" type="date" placeholder="开始日期" value-format="YYYY-MM-DD" style="margin-right:8px;" />
      <el-date-picker v-model="filters.endDate" type="date" placeholder="结束日期" value-format="YYYY-MM-DD" style="margin-right:8px;" />
      <el-button type="primary" @click="doSearch">查询</el-button>
    </div>

    <el-table :data="stats" v-loading="loading" stripe border style="width:100%; margin-top:16px;">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="studentPhone" label="学生电话" />
      <el-table-column prop="studentCollege" label="学生学院" />
      <el-table-column prop="counselorName" label="咨询师姓名" />
      <el-table-column prop="counselorPhone" label="咨询师电话" />
      <el-table-column prop="counselorCollege" label="咨询师学院" />
      <el-table-column prop="problemType" label="问题类型" />
      <el-table-column label="报告提交时间">
        <template #default="{ row }">
          {{ row.reportFinalizedAt }}
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      class="pagination"
      background
      layout="sizes, prev, pager, next, jumper, ->, total"
      :total="total"
      :page-size="filters.pageSize"
      :current-page="filters.pageNum"
      :page-sizes="[5, 10, 20]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </el-card>
</template>

<style scoped>
.filter-bar { display: flex; align-items: center; flex-wrap: wrap; margin-bottom: 16px; }
.pagination { margin-top: 16px; text-align: right; }
</style>
