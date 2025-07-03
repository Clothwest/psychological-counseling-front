<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  fetchCounselorSchedules,
  fetchCounselorSlotsCounselor
} from '@/utils/interceptor/request'

// 中文周映射
const dayMap = ['零', '一', '二', '三', '四', '五', '六', '日']

// 当前标签页
const activeTab = ref('schedule')

// 值班安排
const schedules = ref([])
const scLoading = ref(false)

// 日程号源（分页，状态completed）
const slots = ref([])
const slLoading = ref(false)
const slPage = ref(1)
const slSize = ref(5)
const slTotal = ref(0)

// 加载值班安排
async function loadDutySchedules() {
  scLoading.value = true
  try {
    const res = await fetchCounselorSchedules()
    if (res.code === 200 && Array.isArray(res.data)) {
      schedules.value = res.data
    } else {
      ElMessage.error(res.message || '加载值班安排失败')
    }
  } catch {
    ElMessage.error('加载值班安排失败')
  } finally {
    scLoading.value = false
  }
}

// 加载号源日程
async function loadSlotRecords(page = 1, size = 5) {
  slLoading.value = true
  try {
    const res = await fetchCounselorSlotsCounselor(page, size)
    if (res.code === 200 && res.data.records) {
      const completed = res.data.records.filter(r => r.status === 'BOOKED')
      slots.value = completed
      slTotal.value = completed.length
    } else {
      ElMessage.error(res.message || '加载号源日程失败')
    }
  } catch {
    ElMessage.error('加载号源日程失败')
  } finally {
    slLoading.value = false
  }
}

// 分页控制
function handleSlotPageChange(page) {
  slPage.value = page
  loadSlotRecords(page, slSize.value)
}
function handleSlotSizeChange(size) {
  slSize.value = size
  slPage.value = 1
  loadSlotRecords(1, size)
}

onMounted(() => {
  loadDutySchedules()
  loadSlotRecords(slPage.value, slSize.value)
})
</script>

<template>
  <el-card shadow>
    <el-tabs v-model="activeTab">
      <!-- 我的值班安排 -->
      <el-tab-pane name="schedule" label="我的值班安排">
        <el-table :data="schedules" v-loading="scLoading" stripe border>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="工作日">
            <template #default="{ row }">
              周{{ dayMap[row.dayOfWeek] || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="时间段">
            <template #default="{ row }">
              {{ row.startTime || '--' }} ~ {{ row.endTime || '--' }}
            </template>
          </el-table-column>
          <el-table-column label="生效周期">
            <template #default="{ row }">
              {{ row.effectiveFrom || '--' }} ~ {{ row.effectiveTo || '--' }}
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 我的日程（号源） -->
      <el-tab-pane name="slots" label="我的日程（号源）">
        <el-table :data="slots" v-loading="slLoading" stripe border>
          <el-table-column type="index" label="序号" width="60" />
          <el-table-column label="日期">
            <template #default="{ row }">
              {{ row.startTime ? row.startTime.slice(0, 10) : '--' }}
            </template>
          </el-table-column>
          <el-table-column label="时间段">
            <template #default="{ row }">
              {{ row.startTime.slice(11, 16) || '--' }} ~ {{ row.endTime.slice(11, 16) || '--' }}
            </template>
          </el-table-column>
          <el-table-column prop="studentUsername" label="学生用户名" />
          <el-table-column prop="studentName" label="学生姓名" />
          <el-table-column prop="studentPhone" label="学生电话" />
        </el-table>
        <el-pagination class="pagination" background layout="sizes, prev, pager, next, jumper, ->, total"
          :total="slTotal" :page-size="slSize" :current-page="slPage" :page-sizes="[5, 10, 20]"
          @current-change="handleSlotPageChange" @size-change="handleSlotSizeChange" />
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<style scoped>
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
