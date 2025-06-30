<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchAvailableSlots,
  createAppointment,
  getQuestionnaire
} from '@/utils/interceptor/request'

// 选择日期与号源列表
const selectedDate = ref('')
const slots = ref([])
const loadingSlots = ref(false)

// 同意书与问卷状态
const showConsent = ref(false)
const showQuestionnaire = ref(false)

// 当前预约信息
const currentSlot = ref(null)
const questions = ref([])
const answers = ref({})
const submitting = ref(false)

// 加载可用号源
async function loadSlots() {
  if (!selectedDate.value) return
  loadingSlots.value = true
  try {
    const res = await fetchAvailableSlots(selectedDate.value)
    if (res.code === 200) slots.value = res.data
    else ElMessage.error(res.message || '加载号源失败')
  } catch {
    ElMessage.error('加载号源失败')
  } finally {
    loadingSlots.value = false
  }
}

// 点击“预约”后显示同意书
function handleAppointment(slot) {
  currentSlot.value = slot
  showConsent.value = true
}

// 同意书操作
function agreeConsent() {
  showConsent.value = false
  loadQuestions()
}
function cancelConsent() {
  showConsent.value = false
  ElMessage.info('需同意协议后才能继续')
}

// 加载问卷
async function loadQuestions() {
  try {
    const res = await getQuestionnaire()
    if (res.code === 200) {
      questions.value = res.data
      answers.value = {}
      questions.value.forEach(q => {
        answers.value[q.id] = ''
      })
      showQuestionnaire.value = true
    } else {
      ElMessage.error(res.message || '加载问卷失败')
    }
  } catch {
    ElMessage.error('加载问卷失败')
  }
}

// 提交初访申请
async function submitApplication() {
  // 如果有题目未选，不允许提交
  if (Object.values(answers.value).some(v => v === '')) {
    ElMessage.error('请完成所有问题')
    return
  }

  submitting.value = true
  try {
    const payload = {
      requestedDate: selectedDate.value,
      requestedTime: currentSlot.value.startTime.slice(11, 16),
      answers: { ...answers.value }
    }
    const res = await createAppointment(
      currentSlot.value.id,
      currentSlot.value.staffId,
      payload.requestedDate,
      payload.requestedTime,
      payload.answers
    )
    if (res.code === 200) {
      ElMessage.success('提交成功')
      showQuestionnaire.value = false
    } else {
      ElMessage.error(res.message || '提交失败')
    }
  } catch {
    ElMessage.error('提交失败')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="appointment-container">
    <el-card shadow="hover">
      <h2>学生初访预约</h2>
      <div class="filter-bar">
        <el-date-picker v-model="selectedDate" type="date" placeholder="请选择预约日期" value-format="YYYY-MM-DD" />
        <el-button type="primary" @click="loadSlots">查询</el-button>
      </div>

      <el-table :data="slots" v-loading="loadingSlots" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="staffName" label="初访员姓名" />
        <el-table-column label="可预约时间">
          <template #default="{ row }">
            {{ row.startTime }} ~ {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleAppointment(row)">预约</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 同意书 -->
    <el-dialog v-model="showConsent" title="心理咨询同意书" width="600px" :close-on-click-modal="false">
      <div class="consent-content" style="max-height:400px; overflow:auto;">
        <p>请阅读并同意心理咨询协议。</p>
      </div>
      <template #footer>
        <el-button @click="cancelConsent">取消</el-button>
        <el-button type="primary" @click="agreeConsent">同意</el-button>
      </template>
    </el-dialog>

    <!-- 问卷调查 -->
    <el-dialog v-model="showQuestionnaire" title="问卷调查" width="600px" :close-on-click-modal="false">
      <el-form>
        <div v-for="q in questions" :key="q.id" style="margin-bottom:16px;">
          <div>{{ q.questionText }}</div>
          <el-radio-group v-model="answers[q.id]">
            <el-radio :label="5">A 符合</el-radio>
            <el-radio :label="4">B 接近</el-radio>
            <el-radio :label="3">C 不接近</el-radio>
            <el-radio :label="2">D 不符合</el-radio>
          </el-radio-group>
        </div>
      </el-form>
      <template #footer>
        <el-button @click="showQuestionnaire = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="submitApplication"
          :disabled="Object.values(answers).some(v => v === '')">
          提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.appointment-container {
  padding: 24px;
  max-width: 800px;
  margin: auto;
}

.filter-bar {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 16px;
}
</style>
