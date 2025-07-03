<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchInitialVisitRecordsAdmin, changeAppointmentStatus } from '@/utils/interceptor/request'

// 数据与状态
const records = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 问卷详情弹窗
const showQuestionnaire = ref(false)
const questionnaireItems = ref([])
const questionnaireLoading = ref(false)

// 加载待审核记录
async function loadRecords(page = 1, size = 5) {
  loading.value = true
  try {
    const res = await fetchInitialVisitRecordsAdmin(page, size)
    if (res.code === 200 && res.data) {
      const list = res.data.records.filter(r => r.status === 'SUBMITTED')
      records.value = list.map(item => ({ ...item, totalScore: item.calculatedScore }))
      total.value = list.length
    } else {
      ElMessage.error(res.message || '加载记录失败')
    }
  } catch {
    ElMessage.error('加载记录失败')
  } finally {
    loading.value = false
  }
}

// 分页回调
function handlePageChange(page) {
  currentPage.value = page
  loadRecords(page, pageSize.value)
}
function handleSizeChange(size) {
  pageSize.value = size
  loadRecords(1, size)
}

// 审核操作
function review(id, status) {
  const action = status === 'APPROVED' ? '同意' : '拒绝'
  ElMessageBox.confirm(
    `确认要${action}该预约？`,
    '审核确认',
    { type: status === 'APPROVED' ? 'success' : 'warning' }
  ).then(async () => {
    try {
      const res = await changeAppointmentStatus(id, status)
      if (res.code === 200) {
        ElMessage.success(`${action}成功`)
        loadRecords(currentPage.value, pageSize.value)
      } else {
        ElMessage.error(res.message || `${action}失败`)
      }
    } catch {
      ElMessage.error(`${action}失败`)
    }
  }).catch(() => {})
}

// 查看问卷详情
function viewQuestionnaire(record) {
  questionnaireLoading.value = true
  showQuestionnaire.value = true
  try {
    const list = JSON.parse(record.questionnaireContent)
    questionnaireItems.value = list.map(q => ({ questionText: q.questionText, answer: q.studentAnswer }))
  } catch {
    ElMessage.error('解析问卷失败')
  } finally {
    questionnaireLoading.value = false
  }
}

onMounted(() => loadRecords(currentPage.value, pageSize.value))
</script>

<template>
  <div class="admin-audit-container">
    <el-card shadow>
      <h2>初访预约审核</h2>
      <el-table :data="records" v-loading="loading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentUsername" label="用户名" />
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="interviewerName" label="初访员" />
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
        <el-table-column prop="totalScore" label="总得分" />
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" @click="viewQuestionnaire(row)">查看问卷</el-button>
            <el-button size="small" type="success" @click="review(row.id, 'APPROVED')">同意</el-button>
            <el-button size="small" type="danger" @click="review(row.id, 'REJECTED')">拒绝</el-button>
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

    <!-- 问卷详情弹窗 -->
    <el-dialog v-model="showQuestionnaire" title="学生问卷详情" width="600px">
      <el-table :data="questionnaireItems" v-loading="questionnaireLoading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="questionText" label="问题" />
        <el-table-column prop="answer" label="回答分" width="100" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="showQuestionnaire=false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-audit-container {
  padding: 24px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
