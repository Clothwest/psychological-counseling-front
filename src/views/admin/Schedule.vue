<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    fetchSlots,
    createSlots,
    deleteSlot
} from '@/utils/interceptor/request'

// 数据状态
const slots = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 生成号源日期
const startDate = ref('')
const endDate = ref('')

// 加载号源列表
async function loadSlots(page = 1, size = 5) {
    loading.value = true
    try {
        const res = await fetchSlots(page, size)
        if (res.code === 200 && res.data) {
            slots.value = res.data.records
            total.value = res.data.total
        } else {
            ElMessage.error(res.message || '加载失败')
        }
    } catch (e) {
        console.error(e)
        ElMessage.error('加载失败')
    } finally {
        loading.value = false
    }
}

// 生成号源
async function generateSlots() {
    if (!startDate.value || !endDate.value) {
        ElMessage.error('请填写开始和结束日期')
        return
    }
    try {
        await createSlots(startDate.value, endDate.value)
        ElMessage.success('号源生成成功')
        loadSlots(currentPage.value, pageSize.value)
    } catch (e) {
        console.error(e)
        ElMessage.error('号源生成失败')
    }
}

// 删除号源
async function confirmDelete(id) {
    try {
        await ElMessageBox.confirm('确认删除该号源？', '提示', { type: 'warning' })
        const res = await deleteSlot(id)
        if (res.code === 200) {
            ElMessage.success('删除成功')
            loadSlots(currentPage.value, pageSize.value)
        } else {
            ElMessage.error(res.message || '删除失败')
        }
    } catch {
        // 用户取消或报错
    }
}

// 分页控制
function handlePageChange(page) {
    currentPage.value = page
    loadSlots(page, pageSize.value)
}
function handleSizeChange(size) {
    pageSize.value = size
    currentPage.value = 1
    loadSlots(1, size)
}

onMounted(() => {
    loadSlots(currentPage.value, pageSize.value)
})
</script>

<template>
    <div class="slots-container">
        <el-card shadow="hover">
            <h2>号源管理</h2>

            <div class="controls" style="margin: 16px 0; display: flex; gap: 8px; align-items: center;">
                <el-date-picker v-model="startDate" type="date" placeholder="开始日期" />
                <el-date-picker v-model="endDate" type="date" placeholder="结束日期" />
                <el-button type="primary" @click="generateSlots">生成号源</el-button>
            </div>

            <el-table :data="slots" v-loading="loading" stripe border>
                <el-table-column type="index" label="序号" width="60" />
                <el-table-column prop="staffName" label="员工姓名" />
                <el-table-column prop="startTime" label="开始时间" />
                <el-table-column prop="endTime" label="结束时间" />
                <el-table-column prop="status" label="状态" />
                <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                        <el-button type="danger" size="small" @click="confirmDelete(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination class="pagination" background layout="sizes, prev, pager, next, jumper, ->, total"
                :total="total" :page-size="pageSize" :current-page="currentPage" :page-sizes="[5, 10, 20]"
                @current-change="handlePageChange" @size-change="handleSizeChange" />
        </el-card>
    </div>
</template>

<style scoped>
.slots-container {
    padding: 24px;
}

.controls {
    flex-wrap: wrap;
}

.pagination {
    margin-top: 16px;
    text-align: right;
}
</style>
