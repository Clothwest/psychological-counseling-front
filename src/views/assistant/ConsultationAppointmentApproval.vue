<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAssistantAppointments, approveAppointment, fetchCounselorSlotsAssistant } from '@/utils/interceptor/request'

// 待审核记录
const records = ref([])
const loading = ref(false)

// 弹窗状态
const showDialog = ref(false)
const selectedDate = ref('')
const slots = ref([])
const selectedSlotId = ref(null)
let currentRecordId = null
const slotsLoading = ref(false)

// 加载待审核列表
async function loadRecords() {
  loading.value = true
  try {
    const res = await fetchAssistantAppointments()
    if (res.code === 200 && Array.isArray(res.data)) {
      records.value = res.data
    } else {
      ElMessage.error(res.message || '加载预约失败')
    }
  } catch {
    ElMessage.error('加载预约失败')
  } finally {
    loading.value = false
  }
}

// 打开弹窗
function openDialog(record) {
  currentRecordId = record.initialVisitRecordId
  selectedDate.value = ''
  slots.value = []
  selectedSlotId.value = null
  showDialog.value = true
}

// 日期改变加载号源
async function onDateChange(date) {
  if (!date) return
  slotsLoading.value = true
  try {
    const res = await fetchCounselorSlotsAssistant(date)
    if (res.code === 200 && Array.isArray(res.data)) {
      slots.value = res.data
    } else {
      ElMessage.error(res.message || '加载号源失败')
    }
  } catch {
    ElMessage.error('加载号源失败')
  } finally {
    slotsLoading.value = false
  }
}

// 提交审批
async function submitDialog() {
  if (!selectedSlotId.value) {
    ElMessage.warning('请选择号源')
    return
  }
  const selectedSlot = slots.value.find(s => s.id === selectedSlotId.value)
  if (!selectedSlot) {
    ElMessage.error('无法找到所选号源')
    return
  }
  try {
    const date = selectedDate.value
    const time = selectedSlot.startTime.slice(11, 19) // HH:mm:ss
    const firstSessionStartTime = `${date} ${time}` // e.g. "2025-07-02 14:10:00"

    // 第一个参数使用号源中的 staffId
            await approveAppointment(currentRecordId, selectedSlot.staffId, firstSessionStartTime)
    ElMessage.success('安排成功')
    showDialog.value = false
    loadRecords()
  } catch {
    ElMessage.error('安排失败')
  }
}

onMounted(loadRecords)
</script>

<template>
  <el-card shadow>
    <h2>咨询预约审核（助理）</h2>
    <el-table :data="records" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="studentUsername" label="用户名" />
      <el-table-column prop="studentName" label="姓名" />
      <el-table-column prop="crisisLevel" label="危机等级" />
      <el-table-column prop="problemType" label="问题类型" />
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="openDialog(row)">同意</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 审批弹窗 -->
    <el-dialog v-model="showDialog" title="安排咨询" width="600px">
      <el-form label-width="100px">
        <el-form-item label="预约日期">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="请选择日期"
            @change="onDateChange"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="可预约号源">
          <el-table :data="slots" v-loading="slotsLoading" stripe height="200px">
            <el-table-column prop="staffName" label="咨询师" />
            <el-table-column label="时间段">
              <template #default="{ row }">
                {{ row.startTime.slice(11,16) }} ~ {{ row.endTime.slice(11,16) }}
              </template>
            </el-table-column>
            <el-table-column label="选择" width="80">
              <template #default="{ row }">
                <el-radio-group v-model="selectedSlotId">
                  <el-radio :label="row.id">选择</el-radio>
                </el-radio-group>
              </template>
            </el-table-column>
          </el-table>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="submitDialog">确认</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<style scoped>
.el-table { margin-bottom: 0; }
</style>
