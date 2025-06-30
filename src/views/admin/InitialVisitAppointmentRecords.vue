<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchInitialVisitRecordsAdmin, cancelAppointmentAdmin, updateAppointment, fetchAvailableSlots } from '@/utils/interceptor/request'

// 列表数据状态
const records = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 查看问卷弹窗
const showQuestionnaire = ref(false)
const questionnaireItems = ref([])
const questionnaireLoading = ref(false)

// 编辑弹窗状态
const showEdit = ref(false)
const editDate = ref('')
const availableSlots = ref([])
const slotLoading = ref(false)
const selectedSlotId = ref(null)
let editingRecord = null

// 加载预约记录
async function loadRecords(page = 1, size = 5) {
  loading.value = true
  try {
    const res = await fetchInitialVisitRecordsAdmin(page, size)
    if (res.code === 200 && res.data) {
      records.value = res.data.records.map(item => ({
        ...item,
        totalScore: item.calculatedScore
      }))
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

// 分页回调
function handlePageChange(page) { currentPage.value = page; loadRecords(page, pageSize.value) }
function handleSizeChange(size) { pageSize.value = size; loadRecords(1, size) }

// 查看详情
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

// 撤销预约，仅当已批准
function cancelRecord(record) {
  if (record.status !== 'APPROVED') return
  ElMessageBox.confirm('确认撤销此预约？', '提示', { type: 'warning' })
    .then(async () => {
      try {
        const res = await cancelAppointmentAdmin(record.id)
        if (res.code === 200) {
          ElMessage.success('撤销成功')
          loadRecords(currentPage.value, pageSize.value)
        } else {
          ElMessage.error(res.message || '撤销失败')
        }
      } catch {
        ElMessage.error('撤销失败')
      }
    }).catch(() => {})
}

// 打开编辑弹窗
function editRecord(record) {
  editingRecord = record
  editDate.value = record.requestedTime.slice(0,10)
  selectedSlotId.value = null
  availableSlots.value = []
  showEdit.value = true
}

// 选择日期后加载号源
async function loadEditSlots() {
  if (!editDate.value) return
  slotLoading.value = true
  try {
    const res = await fetchAvailableSlots(editDate.value)
    if (res.code === 200) {
      availableSlots.value = res.data
    } else {
      ElMessage.error(res.message || '加载号源失败')
    }
  } catch {
    ElMessage.error('加载号源失败')
  } finally {
    slotLoading.value = false
  }
}

// 提交编辑
async function submitEdit() {
  if (!selectedSlotId.value) { ElMessage.error('请选择号源'); return }
  try {
    const res = await updateAppointment(editingRecord.id, selectedSlotId.value)
    if (res.code === 200) {
      ElMessage.success('更新成功')
      showEdit.value = false
      loadRecords(currentPage.value, pageSize.value)
    } else {
      ElMessage.error(res.message || '更新失败')
    }
  } catch {
    ElMessage.error('更新失败')
  }
}

onMounted(() => loadRecords(currentPage.value, pageSize.value))
</script>

<template>
  <div class="admin-visit-records">
    <el-card shadow>
      <h2>初访预约记录（管理员）</h2>
      <el-table :data="records" v-loading="loading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="studentUsername" label="用户名" />
        <el-table-column prop="studentName" label="学生姓名" />
        <el-table-column prop="interviewerName" label="初访员姓名" />
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
        <el-table-column prop="status" label="状态" />
        <el-table-column label="操作" width="260">
          <template #default="{ row }">
            <el-button size="small" @click="viewQuestionnaire(row)">查看问卷</el-button>
            <el-button size="small" type="warning" @click="editRecord(row)">修改</el-button>
            <el-button size="small" type="danger" :disabled="row.status!=='APPROVED'" @click="cancelRecord(row)">撤销</el-button>
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

    <!-- 编辑弹窗 -->
    <el-dialog v-model="showEdit" title="修改预约" width="500px">
      <el-form>
        <el-form-item label="选择日期" label-width="80px">
          <el-date-picker v-model="editDate" type="date" placeholder="选择日期" value-format="YYYY-MM-DD" @change="loadEditSlots" />
        </el-form-item>
        <el-form-item label="可用号源" label-width="80px">
          <el-select v-model="selectedSlotId" placeholder="请选择号源">
            <el-option v-for="s in availableSlots" :key="s.id" :label="s.startTime + ' ~ ' + s.endTime" :value="s.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showEdit=false">取消</el-button>
        <el-button type="primary" @click="submitEdit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.admin-visit-records { padding: 24px; }
.pagination { margin-top: 16px; text-align: right; }
</style>