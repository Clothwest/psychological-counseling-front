<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchAssistantAppointments, approveAppointment } from '@/utils/interceptor/request'

// 待审核列表
const records = ref([])
const loading = ref(false)

// 审批对话框
const showDialog = ref(false)
const dialogForm = ref({
  initialVisitRecordId: null,
  counselorId: null,
  firstSessionStartTime: ''
})

// 咨询师选项【需预加载】
const counselors = ref([])

// 加载助理需审核的初访预约（无分页）
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

// 打开审批对话框
function openDialog(record) {
  dialogForm.value = {
    initialVisitRecordId: record.initialVisitRecordId,
    counselorId: null,
    firstSessionStartTime: ''
  }
  showDialog.value = true
}

// 提交同意操作
async function submitDialog() {
  const { initialVisitRecordId, counselorId, firstSessionStartTime } = dialogForm.value
  if (!counselorId || !firstSessionStartTime) {
    ElMessage.warning('请选择咨询师并填写首次咨询时间')
    return
  }
  try {
    await approveAppointment(initialVisitRecordId, counselorId, firstSessionStartTime)
    ElMessage.success('已同意预约')
    showDialog.value = false
    loadRecords()
  } catch {
    ElMessage.error('审批失败')
  }
}

onMounted(() => {
  // TODO: 预加载 counselors 列表
  loadRecords()
})
</script>

<template>
  <el-card shadow>
    <h2>咨询预约审核（助理）</h2>
    <el-table :data="records" v-loading="loading" stripe border>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="studentUsername" label="学生用户名" />
      <el-table-column prop="studentName" label="学生姓名" />
      <el-table-column prop="studentPhone" label="学生电话" />
      <el-table-column prop="crisisLevel" label="危机等级" />
      <el-table-column prop="problemType" label="问题类型" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-button size="small" type="success" @click="openDialog(row)">同意</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 审批对话框 -->
    <el-dialog v-model="showDialog" title="审批预约" width="500px">
      <el-form label-width="120px">
        <el-form-item label="咨询师选择">
          <el-select v-model="dialogForm.counselorId" placeholder="请选择咨询师">
            <el-option
              v-for="c in counselors"
              :key="c.id"
              :label="c.name"
              :value="c.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="首次咨询时间">
          <el-date-picker
            v-model="dialogForm.firstSessionStartTime"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
            placeholder="选择时间"
            style="width: 100%"
          />
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
/* 无分页 */
el-table { margin-bottom: 0; }
</style>
