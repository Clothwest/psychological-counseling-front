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

// 排序相关
const sortProp = ref(null)      // 当前排序字段
const sortOrder = ref(null)     // 'ascending' 或 'descending'

// 问卷详情弹窗
const showQuestionnaire = ref(false)
const questionnaireItems = ref([])
const questionnaireLoading = ref(false)

/** 格式化时间字符串到 “YYYY-MM-DD HH:mm:ss” */
function formatDateTime(dtStr) {
  return dtStr.slice(0, 10) + ' ' + dtStr.slice(11, 19)
}

/** 加载并处理记录（含排序 & 前端分页） */
async function loadRecords(page = 1, size = 5) {
  loading.value = true
  try {
    const res = await fetchInitialVisitRecordsAdmin(page, size)
    if (res.code === 200 && res.data) {
      // 只取 SUBMITTED 状态，并计算 totalScore
      let list = res.data.records
        .filter(r => r.status === 'SUBMITTED')
        .map(item => ({ ...item, totalScore: item.calculatedScore }))

      total.value = list.length

      // 如果有排序条件，先做排序
      if (sortProp.value && sortOrder.value) {
        list.sort((a, b) => {
          const diff = a[sortProp.value] - b[sortProp.value]
          return sortOrder.value === 'ascending' ? diff : -diff
        })
      }

      // 再做前端分页
      const start = (page - 1) * size
      records.value = list.slice(start, start + size)
    } else {
      ElMessage.error(res.message || '加载记录失败')
    }
  } catch {
    ElMessage.error('加载记录失败')
  } finally {
    loading.value = false
  }
}

// 分页：页码或页大小变化
function handlePageChange(page) {
  currentPage.value = page
  loadRecords(page, pageSize.value)
}
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadRecords(1, size)
}

// 排序回调
function handleSortChange({ prop, order }) {
  sortProp.value = prop
  sortOrder.value = order
  loadRecords(currentPage.value, pageSize.value)
}

// 预约审核操作
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
  }).catch(() => { })
}

// 查看问卷详情
function viewQuestionnaire(record) {
  questionnaireLoading.value = true
  showQuestionnaire.value = true
  try {
    const list = JSON.parse(record.questionnaireContent)
    questionnaireItems.value = list.map(q => ({
      questionText: q.questionText,
      answer: q.studentAnswer
    }))
  } catch {
    ElMessage.error('解析问卷失败')
  } finally {
    questionnaireLoading.value = false
  }
}

// 初始加载
onMounted(() => {
  loadRecords(currentPage.value, pageSize.value)
})
</script>

<template>
  <div class="admin-audit-container">
    <el-card shadow>
      <h2>初访预约审核</h2>
      <el-table :data="records" v-loading="loading" stripe border @sort-change="handleSortChange">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentUsername" label="用户名" />
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="interviewerName" label="初访员" />
        <el-table-column label="提交时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.submittedTime) }}
          </template>
        </el-table-column>
        <el-table-column label="预约时间" width="160">
          <template #default="{ row }">
            {{ formatDateTime(row.requestedTime) }}
          </template>
        </el-table-column>
        <!-- 可排序的“总得分”列 -->
        <el-table-column prop="totalScore" label="总得分" width="120" sortable="custom" />
        <el-table-column label="操作" width="240">
          <template #default="{ row }">
            <el-button size="small" @click="viewQuestionnaire(row)">查看问卷</el-button>
            <el-button size="small" type="success" @click="review(row.id, 'APPROVED')">同意</el-button>
            <el-button size="small" type="danger" @click="review(row.id, 'REJECTED')">拒绝</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination class="pagination" background layout="sizes, prev, pager, next, jumper, ->, total" :total="total"
        :page-size="pageSize" :current-page="currentPage" :page-sizes="[5, 10, 20]" @current-change="handlePageChange"
        @size-change="handleSizeChange" />
    </el-card>

    <!-- 问卷详情弹窗 -->
    <el-dialog v-model="showQuestionnaire" title="学生问卷详情" width="600px">
      <el-table :data="questionnaireItems" v-loading="questionnaireLoading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="questionText" label="问题" />
        <el-table-column prop="answer" label="回答分" width="100" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="showQuestionnaire = false">关闭</el-button>
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
