<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchCounselorCases,
  fetchCaseSessions,
  submitCaseRecord,
  submitCaseAppend,
  fetchCaseReport,
  saveCaseReport
} from '@/utils/interceptor/request'

const filters = reactive({
  pageNum: 1,
  pageSize: 10,
  studentKeyword: '',
  status: 'IN_PROGRESS'
})

const cases = ref([])
const loadingCases = ref(false)
const totalCases = ref(0)

const showDetail = ref(false)
const sessions = ref([])
const loadingSessions = ref(false)
let selectedCaseId = null

const showRecord = ref(false)
const recordForm = ref({ status: '', counselorNotes: '' })
let selectedSessionId = null

const showAppend = ref(false)
const appendCount = ref(1)
const appendReason = ref('')

const showReport = ref(false)
const reportFormRef = ref(null)
const reportData = reactive({
  studentId: '',
  studentName: '',
  gender: '',
  department: '',
  phone: '',
  problemType: '',
  totalSessions: 1,
  selfEvaluation: ''
})

async function loadCases() {
  loadingCases.value = true
  try {
    const payload = { ...filters }
    const res = await fetchCounselorCases(payload)
    if (res.code === 200 && res.data) {
      cases.value = res.data.records
      totalCases.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载个案失败')
    }
  } catch {
    ElMessage.error('加载个案失败')
  } finally {
    loadingCases.value = false
  }
}

function doSearch() {
  filters.pageNum = 1
  loadCases()
}

async function viewDetail(row) {
  selectedCaseId = row.caseId
  showDetail.value = true
  loadingSessions.value = true
  try {
    const res = await fetchCaseSessions(selectedCaseId)
    if (res.code === 200 && res.data.sessions) {
      sessions.value = res.data.sessions
    } else {
      ElMessage.error(res.message || '加载会话失败')
    }
  } catch {
    ElMessage.error('加载会话失败')
  } finally {
    loadingSessions.value = false
  }
}

function openRecord(row) {
  selectedSessionId = row.sessionId
  recordForm.value = { status: '', counselorNotes: '' }
  showRecord.value = true
}

async function submitRecord() {
  if (!recordForm.value.status || !recordForm.value.counselorNotes) {
    ElMessage.warning('请选择状态并填写内容')
    return
  }
  try {
    await submitCaseRecord(selectedSessionId, recordForm.value.status, recordForm.value.counselorNotes)
    ElMessage.success('提交成功')
    showRecord.value = false
    viewDetail({ caseId: selectedCaseId })
  } catch {
    ElMessage.error('提交失败')
  }
}

function openAppend() {
  appendCount.value = 1
  appendReason.value = ''
  showAppend.value = true
}

async function submitAppend() {
  if (!appendReason.value) {
    ElMessage.warning('请填写原因')
    return
  }
  try {
    await submitCaseAppend(selectedCaseId, appendCount.value, appendReason.value)
    ElMessage.success('追加咨询提交成功')
    showAppend.value = false
    viewDetail({ caseId: selectedCaseId })
  } catch {
    ElMessage.error('追加失败')
  }
}

function openReport(row) {
  selectedCaseId = row.caseId
  Object.assign(reportData, {
    studentId: row.studentUsername,
    studentName: row.studentName,
    gender: '',
    department: '',
    phone: '',
    problemType: '',
    totalSessions: 1,
    selfEvaluation: ''
  })
  showReport.value = true
}

async function submitReport() {
  try {
    await reportFormRef.value.validate()
  } catch {
    ElMessage.error('请完善所有字段')
    return
  }
  const payload = {
    caseId: selectedCaseId,
    reportContent: { ...reportData }
  }
  try {
    await saveCaseReport(payload)
    ElMessage.success('报告保存成功')
    showReport.value = false
    loadCases()
  } catch {
    ElMessage.error('保存失败')
  }
}

function handlePageChange(page) {
  filters.pageNum = page
  loadCases()
}

function handleSizeChange(size) {
  filters.pageSize = size
  filters.pageNum = 1
  loadCases()
}

onMounted(loadCases)
</script>

<template>
  <el-card shadow>
    <h2>个案记录（咨询师）</h2>
    <div class="filter-bar">
      <el-input
        v-model="filters.studentKeyword"
        placeholder="学生姓名/学号"
        clearable
        @clear="doSearch"
        @keyup.enter="doSearch"
        style="width:200px; margin-right: 8px;"
      />
      <el-select v-model="filters.status" style="width:160px; margin-right:8px;">
        <el-option label="进行中" value="IN_PROGRESS" />
      </el-select>
      <el-button type="primary" @click="doSearch">查询</el-button>
    </div>
    <el-table :data="cases" v-loading="loadingCases" stripe border>
      <el-table-column type="index" label="序号" width="60"/>
      <el-table-column prop="studentName" label="学生姓名"/>
      <el-table-column prop="sessionProgress" label="咨询进度"/>
      <el-table-column prop="nextSessionTime" label="下次咨询时间"/>
      <el-table-column label="操作" width="300">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="viewDetail(row)">查看记录</el-button>
          <el-button size="small" type="info" @click="openAppend()" style="margin:0 8px;">追加咨询</el-button>
          <el-button size="small" type="warning" @click="openReport(row)">填写报告</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      class="pagination"
      background
      layout="sizes, prev, pager, next, jumper, ->, total"
      :total="totalCases"
      :page-size="filters.pageSize"
      :current-page="filters.pageNum"
      :page-sizes="[5,10,20]"
      @current-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </el-card>

  <el-dialog v-model="showDetail" title="会话详情" width="600px">
    <el-table :data="sessions" v-loading="loadingSessions" stripe border>
      <el-table-column type="index" label="序号" width="60"/>
      <el-table-column prop="sessionNumber" label="会话次数"/>
      <el-table-column prop="scheduledTime" label="安排时间"/>
      <el-table-column prop="status" label="状态"/>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="openRecord(row)" :disabled="row.status!=='PENDING'">提交记录</el-button>
        </template>
      </el-table-column>
    </el-table>
    <template #footer>
      <el-button type="primary" @click="showDetail=false">关闭</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="showRecord" title="提交会话记录" width="500px">
    <el-form label-width="100px">
      <el-form-item label="状态">
        <el-select v-model="recordForm.status" placeholder="请选择状态">
          <el-option label="完成咨询" value="COMPLETED"/>
          <el-option label="旷约" value="NO_SHOW"/>
          <el-option label="请假" value="LEAVE"/>
          <el-option label="脱落" value="DROPOUT"/>
          <el-option label="结案" value="CLOSED"/>
        </el-select>
      </el-form-item>
      <el-form-item label="内容">
        <el-input type="textarea" v-model="recordForm.counselorNotes" rows="4"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showRecord=false">取消</el-button>
      <el-button type="primary" @click="submitRecord">提交</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="showAppend" title="追加咨询" width="400px">
    <el-form label-width="100px">
      <el-form-item label="追加次数">
        <el-input-number v-model="appendCount" :min="1" style="width:100%"/>
      </el-form-item>
      <el-form-item label="原因">
        <el-input type="textarea" v-model="appendReason" rows="3"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showAppend=false">取消</el-button>
      <el-button type="primary" @click="submitAppend">提交</el-button>
    </template>
  </el-dialog>

  <el-dialog v-model="showReport" title="填写结案报告" width="600px">
    <el-form ref="reportFormRef" :model="reportData" label-width="120px">
      <el-form-item label="来访者学号" prop="studentId">
        <el-input v-model="reportData.studentId"/>
      </el-form-item>
      <el-form-item label="来访者姓名" prop="studentName">
        <el-input v-model="reportData.studentName"/>
      </el-form-item>
      <el-form-item label="来访者性别" prop="gender">
        <el-select v-model="reportData.gender">
          <el-option label="男" value="男"/>
          <el-option label="女" value="女"/>
        </el-select>
      </el-form-item>
      <el-form-item label="来访者院系" prop="department">
        <el-input v-model="reportData.department"/>
      </el-form-item>
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="reportData.phone"/>
      </el-form-item>
      <el-form-item label="问题类型" prop="problemType">
        <el-input v-model="reportData.problemType"/>
      </el-form-item>
      <el-form-item label="咨询总次数" prop="totalSessions">
        <el-input-number v-model="reportData.totalSessions" :min="1"/>
      </el-form-item>
      <el-form-item label="咨询效果自评" prop="selfEvaluation">
        <el-input type="textarea" v-model="reportData.selfEvaluation" rows="3"/>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="showReport=false">取消</el-button>
      <el-button type="primary" @click="submitReport">保存</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.filter-bar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
