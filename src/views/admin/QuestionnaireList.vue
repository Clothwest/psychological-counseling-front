<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchQuestionnaireRecords, fetchSurveyResponses } from '@/utils/interceptor/request'

const records = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

const showDetail = ref(false)
const detailRecords = ref([])
const detailLoading = ref(false)
const currentRecord = ref(null)

async function loadRecords(page = 1, size = 5) {
  loading.value = true
  try {
    const res = await fetchQuestionnaireRecords(page, size)
    if (res.code === 200 && res.data) {
      records.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载问卷列表失败')
    }
  } catch {
    ElMessage.error('加载问卷列表失败')
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

// 查看详情
async function viewDetail(record) {
  currentRecord.value = record
  showDetail.value = true
  detailLoading.value = true
  try {
    const res = await fetchSurveyResponses(record.id)
    if (res.code === 200 && Array.isArray(res.data)) {
      detailRecords.value = res.data
    } else {
      ElMessage.error(res.message || '加载详情失败')
    }
  } catch {
    ElMessage.error('加载详情失败')
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  loadRecords(currentPage.value, pageSize.value)
})
</script>

<template>
  <div class="questionnaire-list-container">
    <el-card shadow="hover">
      <h2>问卷列表</h2>
      <el-table :data="records" v-loading="loading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentUsername" label="用户名" />
        <el-table-column prop="studentName" label="姓名" />
        <el-table-column prop="totalScore" label="问卷得分" />
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDetail(row)">查看</el-button>
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

    <el-dialog v-model="showDetail" width="600px" title="问卷详情" :close-on-click-modal="false">
      <el-table :data="detailRecords" v-loading="detailLoading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="questionText" label="问题" />
        <el-table-column prop="score" label="得分" width="100" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.questionnaire-list-container {
  padding: 24px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
