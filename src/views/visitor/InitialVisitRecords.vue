<template>
  <el-card shadow>
    <el-tabs v-model="activeTab">
      <!-- 已通过预约 -->
      <el-tab-pane label="已通过预约" name="approved">
        <el-table
          :data="approved"
          v-loading="apLoading"
          stripe
          border
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="studentUsername" label="学生用户名" />
          <el-table-column prop="studentName" label="学生姓名" />
          <el-table-column prop="studentPhone" label="电话号码" />
          <el-table-column label="预约时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.scheduledTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120">
            <template #default="{ row }">
              <el-button
                size="small"
                type="primary"
                @click="openForm(row)"
              >填写</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="pagination"
          :total="apTotal"
          :page-size="apSize"
          :current-page="apPage"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :page-sizes="[5, 10, 20]"
          @current-change="onApPageChange"
          @size-change="onApSizeChange"
        />
      </el-tab-pane>

      <!-- 完成记录 -->
      <el-tab-pane label="完成记录" name="completed">
        <el-table
          :data="completed"
          v-loading="crLoading"
          stripe
          border
        >
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column prop="studentUsername" label="学生用户名" />
          <el-table-column prop="studentName" label="学生姓名" />
          <el-table-column prop="crisisLevel" label="危机等级" />
          <el-table-column prop="problemType" label="问题类型" />
          <el-table-column label="初访时间" width="180">
            <template #default="{ row }">
              {{ formatDateTime(row.visitTime) }}
            </template>
          </el-table-column>
          <el-table-column label="结论">
            <template #default="{ row }">
              {{ conclusionMap[row.conclusion] || row.conclusion }}
            </template>
          </el-table-column>
        </el-table>

        <el-pagination
          class="pagination"
          :total="crTotal"
          :page-size="crSize"
          :current-page="crPage"
          layout="sizes, prev, pager, next, jumper, ->, total"
          :page-sizes="[5, 10, 20]"
          @current-change="onCrPageChange"
          @size-change="onCrSizeChange"
        />
      </el-tab-pane>
    </el-tabs>

    <!-- 填写初访记录弹窗 -->
    <el-dialog
      v-model="showForm"
      title="填写初访记录"
      width="500px"
      :destroy-on-close="true"
    >
      <el-form :model="form" label-width="100px">
        <el-form-item label="危机等级">
          <el-input
            v-model="form.crisisLevel"
            placeholder="请输入危机等级"
          />
        </el-form-item>
        <el-form-item label="问题类型">
          <el-input
            v-model="form.problemType"
            placeholder="请输入问题类型"
          />
        </el-form-item>
        <el-form-item label="初访时间">
          <el-date-picker
            v-model="form.visitTime"
            type="datetime"
            value-format="YYYY-MM-DD HH:mm:ss"
            placeholder="选择日期时间"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="初访结论">
          <el-select
            v-model="form.conclusion"
            placeholder="请选择结论"
          >
            <el-option
              v-for="opt in conclusionOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="closeForm">取消</el-button>
        <el-button type="primary" @click="submitForm">提交</el-button>
      </template>
    </el-dialog>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchApprovedAppointments,
  fetchCompletedRecords,
  submitVisitRecord
} from '@/utils/interceptor/request'

// Tabs
const activeTab = ref('approved')

// 已通过预约 状态
const approved = ref([])
const apLoading = ref(false)
const apPage = ref(1)
const apSize = ref(5)
const apTotal = ref(0)

// 已完成记录 状态
const completed = ref([])
const crLoading = ref(false)
const crPage = ref(1)
const crSize = ref(5)
const crTotal = ref(0)

// 填写表单 弹窗
const showForm = ref(false)
const form = ref({
  applicationId: null,
  crisisLevel: '',
  problemType: '',
  visitTime: '',
  conclusion: ''
})
const conclusionOptions = [
  { label: '无需咨询', value: 'NO_COUNSELING' },
  { label: '安排咨询', value: 'ARRANGE_COUNSELING' },
  { label: '转介送诊', value: 'REFERRAL' }
]
const conclusionMap = {
  'NO_COUNSELING': '无需咨询',
  'ARRANGE_COUNSELING': '安排咨询',
  'REFERRAL': '转介送诊'
}

// 工具：格式化 ISO 字符串到 “YYYY-MM-DD HH:mm:ss”
function formatDateTime(isoStr) {
  if (!isoStr) return ''
  return isoStr.slice(0, 10) + ' ' + isoStr.slice(11, 19)
}

// 加载已通过预约
async function loadApproved(page = 1, size = 5) {
  apLoading.value = true
  try {
    const res = await fetchApprovedAppointments(page, size)
    if (res.code === 200 && res.data?.records) {
      approved.value = res.data.records
      apTotal.value = res.data.total
    } else {
      throw new Error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    apLoading.value = false
  }
}

// 加载已完成记录
async function loadCompleted(page = 1, size = 5) {
  crLoading.value = true
  try {
    const res = await fetchCompletedRecords(page, size)
    if (res.code === 200 && res.data?.records) {
      completed.value = res.data.records
      crTotal.value = res.data.total
    } else {
      throw new Error(res.message || '加载失败')
    }
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    crLoading.value = false
  }
}

// 分页回调
function onApPageChange(page) {
  apPage.value = page
  loadApproved(page, apSize.value)
}
function onApSizeChange(size) {
  apSize.value = size
  apPage.value = 1
  loadApproved(1, size)
}
function onCrPageChange(page) {
  crPage.value = page
  loadCompleted(page, crSize.value)
}
function onCrSizeChange(size) {
  crSize.value = size
  crPage.value = 1
  loadCompleted(1, size)
}

// 打开表单（保持函数签名不变）
function openForm(record) {
  form.value.applicationId = record.applicationId
  form.value.crisisLevel = ''
  form.value.problemType = ''
  form.value.visitTime = ''
  form.value.conclusion = ''
  showForm.value = true
}

// 关闭表单
function closeForm() {
  showForm.value = false
}

// 提交表单（保持参数顺序与签名不动）
async function submitForm() {
  try {
    const { applicationId, crisisLevel, problemType, visitTime, conclusion } = form.value
    const isoTime = new Date(visitTime).toISOString()
    const res = await submitVisitRecord(
      applicationId,
      crisisLevel,
      problemType,
      isoTime,
      conclusion
    )
    if (res.code === 200) {
      ElMessage.success('提交成功')
      closeForm()
      loadApproved(apPage.value, apSize.value)
      loadCompleted(crPage.value, crSize.value)
    } else {
      throw new Error(res.message || '提交失败')
    }
  } catch (err) {
    ElMessage.error(err.message)
  }
}

// 初次加载
onMounted(() => {
  loadApproved(apPage.value, apSize.value)
  loadCompleted(crPage.value, crSize.value)
})
</script>

<style scoped>
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
