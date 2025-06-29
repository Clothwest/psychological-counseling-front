<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { fetchAvailableVisitors, createAppointment } from '@/utils/interceptor/request'

const selectedDate = ref('')
const availableVisitors = ref([])
const loading = ref(false)

function loadAvailableVisitors() {
  if (!selectedDate.value) return
  loading.value = true
  fetchAvailableVisitors(selectedDate.value)
    .then(res => {
      if (res.code === 200) {
        availableVisitors.value = res.data
      } else {
        ElMessage.error(res.message || '加载失败')
      }
    })
    .catch(() => ElMessage.error('加载失败'))
    .finally(() => loading.value = false)
}

function handleDateChange(val) {
  selectedDate.value = val
  loadAvailableVisitors()
}

function handleAppointment(visitorId) {
  createAppointment(visitorId, selectedDate.value)
    .then(res => {
      if (res.code === 200) {
        ElMessage.success('预约成功')
        loadAvailableVisitors()
      } else {
        ElMessage.error(res.message || '预约失败')
      }
    })
    .catch(() => ElMessage.error('预约失败'))
}
</script>

<template>
  <div class="appointment-container">
    <el-card shadow="hover">
      <h2>初访预约</h2>
      <el-form label-width="100px">
        <el-form-item label="选择日期">
          <el-date-picker
            v-model="selectedDate"
            type="date"
            placeholder="请选择预约日期"
            style="width: 100%"
            @change="handleDateChange"
          />
        </el-form-item>
      </el-form>

      <el-table :data="availableVisitors" v-loading="loading" border stripe style="margin-top: 16px">
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="name" label="初访员姓名" />
        <el-table-column label="可预约时间">
          <template #default="{ row }">
            {{ row.startTime }} ~ {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleAppointment(row.id)">预约</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<style scoped>
.appointment-container {
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
}
</style>
