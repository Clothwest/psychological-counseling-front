<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchInitialVisitRecords, cancelAppointment } from '@/utils/interceptor/request'

const records = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 加载预约记录
async function loadRecords(page = 1, size = 5) {
  loading.value = true
  try {
    const res = await fetchInitialVisitRecords(page, size)
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

// 分页
function handlePageChange(page) {
  currentPage.value = page
  loadRecords(page, pageSize.value)
}
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadRecords(1, size)
}

// 撤销预约
function confirmCancel(id) {
  ElMessageBox.confirm('确认撤销此预约？', '提示', { type: 'warning' })
    .then(async () => {
      const res = await cancelAppointment(id)
      if (res.code === 200) {
        ElMessage.success('撤销成功')
        loadRecords(currentPage.value, pageSize.value)
      } else {
        ElMessage.error(res.message || '撤销失败')
      }
    }).catch(() => {
      /* 用户取消 */
    })
}

onMounted(() => {
  loadRecords(currentPage.value, pageSize.value)
})
</script>

<template>
  <div class="records-container">
    <el-card shadow="hover">
      <h2>我的初访预约记录</h2>
      <el-table :data="records" v-loading="loading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column label="提交时间">
          <template #default="{ row }">
            {{ row.submittedTime.slice(0,10) + ' ' + row.submittedTime.slice(11,19) }}
          </template>
        </el-table-column>
        <el-table-column label="预约时间">
          <template #default="{ row }">
            {{ row.requestedTime.slice(0,10) + ' ' + row.requestedTime.slice(11,19) }}
          </template>
        </el-table-column>
        <el-table-column prop="interviewerName" label="初访员姓名" />
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="confirmCancel(row.id)">撤销</el-button>
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
.records-container {
  padding: 24px;
  max-width: 800px;
  margin: auto;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
