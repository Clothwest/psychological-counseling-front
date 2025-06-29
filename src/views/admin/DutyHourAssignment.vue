<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  fetchSchedules,
  addSchedule,
  updateSchedule,
  deleteSchedule,
  listUsers
} from '@/utils/interceptor/request'

// 排班列表数据
const schedules = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 员工选项和映射
const staffOptions = ref([])
const staffMap = ref({}) // id -> { username, name }

// 弹窗与表单状态
const showDialog = ref(false)
const isEdit = ref(false)
const formRef = ref(null)
const scheduleForm = ref({ id: null, staffId: '', dayOfWeek: null, startTime: '', endTime: '' })

// 工作日选项
const weekdayOptions = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 }
]

// 表单校验规则
const rules = {
  staffId:   [{ required: true, message: '请选择员工', trigger: 'change' }],
  dayOfWeek: [{ required: true, message: '请选择工作日', trigger: 'change' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime:   [{ required: true, message: '请选择结束时间', trigger: 'change' }]
}

// 重置表单
function resetFormData() {
  scheduleForm.value = { id: null, staffId: '', dayOfWeek: null, startTime: '', endTime: '' }
  formRef.value?.resetFields()
  isEdit.value = false
}

// 加载员工列表并构建映射和选项
async function loadStaff() {
  try {
    const res = await listUsers()
    if (res.code === 200 && Array.isArray(res.data)) {
      const opts = []
      const map = {}
      res.data.forEach(u => {
        const roleKey = u.role.toLowerCase()
        if (roleKey === 'visitor' || roleKey === 'counselor') {
          // 存储用户名和姓名
          map[u.id] = { username: u.username, name: u.name }
          // 下拉显示: 用户名 姓名（职位）
          const roleLabel = roleKey === 'visitor' ? '初访员' : '咨询师'
          const label = `${u.username} ${u.name} (${roleLabel})`
          opts.push({ id: u.id, label })
        }
      })
      staffOptions.value = opts
      staffMap.value = map
    }
  } catch (e) {
    console.error(e)
  }
}

// 加载排班并为每条记录添加显示字段
async function loadSchedules() {
  loading.value = true
  try {
    const res = await fetchSchedules(currentPage.value, pageSize.value)
    if (res.code === 200 && res.data) {
      total.value = res.data.total
      schedules.value = res.data.records.map(item => {
        const info = staffMap.value[item.staffId] || { username: '', name: '' }
        return {
          ...item,
          staffDisplay: `${info.username} ${info.name}`
        }
      })
    } else {
      ElMessage.error(res.message || '加载失败')
    }
  } catch {
    ElMessage.error('加载失败')
  } finally {
    loading.value = false
  }
}

// 分页处理
function handlePageChange(page) {
  currentPage.value = page
  loadSchedules()
}
function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadSchedules()
}

// 打开弹窗
function openAdd() {
  resetFormData()
  showDialog.value = true
}
function openEdit(row) {
  resetFormData()
  scheduleForm.value = { id: row.id, staffId: row.staffId, dayOfWeek: row.dayOfWeek, startTime: row.startTime, endTime: row.endTime }
  isEdit.value = true
  showDialog.value = true
}

// 删除
function confirmDelete(id) {
  ElMessageBox.confirm('确认删除该安排？', '提示', { type: 'warning' })
    .then(async () => {
      await deleteSchedule(id)
      ElMessage.success('删除成功')
      loadSchedules()
    })
    .catch(() => {})
}

// 提交表单
async function submitForm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  try {
    let res
    if (isEdit.value) {
      // 更新：传递 id, staffId, dayOfWeek, startTime, endTime
      const { id, staffId, dayOfWeek, startTime, endTime } = scheduleForm.value
      res = await updateSchedule(id, staffId, dayOfWeek, startTime, endTime)
    } else {
      // 添加：传递 staffId, dayOfWeek, startTime, endTime
      const { staffId, dayOfWeek, startTime, endTime } = scheduleForm.value
      res = await addSchedule(staffId, dayOfWeek, startTime, endTime)
    }
    if (res.code === 200) {
      ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
      showDialog.value = false
      loadSchedules()
    } else {
      ElMessage.error(res.message || '操作失败')
    }
  } catch {
    ElMessage.error('操作失败')
  }
}

onMounted(async () => {
  await loadStaff()
  await loadSchedules()
})
</script>

<template>
  <div class="schedule-container">
    <el-card shadow="hover">
      <div class="toolbar">
        <el-button type="primary" @click="openAdd">新增安排</el-button>
      </div>

      <el-table :data="schedules" v-loading="loading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="staffDisplay" label="员工" />
        <el-table-column label="工作日">
  <template #default="{ row }">
    {{ weekdayOptions.find(o => o.value === row.dayOfWeek)?.label || '' }}
  </template>
</el-table-column>
        <el-table-column label="时间段">
          <template #default="{ row }">
            {{ row.startTime }} ~ {{ row.endTime }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" @click="openEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
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

      <el-dialog v-model="showDialog" :title="isEdit ? '编辑安排' : '新增安排'" width="400px" @close="resetFormData">
        <el-form ref="formRef" :model="scheduleForm" :rules="rules" label-width="100px">
          <el-form-item label="员工" prop="staffId">
            <el-select v-model="scheduleForm.staffId" placeholder="请选择员工" :disabled="isEdit">
              <el-option
                v-for="opt in staffOptions"
                :key="opt.id"
                :label="opt.label"
                :value="opt.id"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="工作日" prop="dayOfWeek">
            <el-select v-model="scheduleForm.dayOfWeek" placeholder="请选择工作日">
              <el-option
                v-for="wk in weekdayOptions"
                :key="wk.value"
                :label="wk.label"
                :value="wk.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="开始时间" prop="startTime">
            <el-time-picker v-model="scheduleForm.startTime" placeholder="选择时间" format="HH:mm" value-format="HH:mm" style="width:100%;" />
          </el-form-item>
          <el-form-item label="结束时间" prop="endTime">
            <el-time-picker v-model="scheduleForm.endTime" placeholder="选择时间" format="HH:mm" value-format="HH:mm" style="width:100%;" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<style scoped>
.schedule-container { padding: 24px; }
.toolbar { margin-bottom: 16px; text-align: right; }
.pagination { margin-top: 16px; text-align: right; }
</style>
