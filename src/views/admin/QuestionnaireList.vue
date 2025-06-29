<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
    fetchQuestionnaires,
    fetchQuestions,
    addQuestionnaire,
    updateQuestionnaire,
    deleteQuestionnaire
} from '@/utils/interceptor/request'

const questionnaires = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

const showDialog = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const dialogTitleInput = ref('')
const allQuestions = ref([])
const selectedQuestions = ref([])

const showDetailDialog = ref(false)
const detailList = ref([])

function loadData() {
    loading.value = true
    fetchQuestionnaires(currentPage.value, pageSize.value)
        .then(res => {
            if (res.code === 200) {
                questionnaires.value = res.data.records.map(item => ({
                    ...item,
                    questionCount: item.questions.length
                }))
                total.value = res.data.total
            } else {
                ElMessage.error(res.message || '加载失败')
            }
        })
        .finally(() => { loading.value = false })
}

function loadAllQuestions() {
    fetchQuestions(1, 1000).then(res => {
        if (res.code === 200) {
            allQuestions.value = res.data.records.map(q => ({ key: q.id, label: q.content }))
        }
    })
}

function handlePageChange(page) {
    currentPage.value = page
    loadData()
}

function handleSizeChange(size) {
    pageSize.value = size
    currentPage.value = 1
    loadData()
}

function openAdd() {
    isEdit.value = false
    editId.value = null
    dialogTitleInput.value = ''
    selectedQuestions.value = []
    showDialog.value = true
}

function openEdit(row) {
    isEdit.value = true
    editId.value = row.id
    dialogTitleInput.value = row.title
    selectedQuestions.value = row.questions.map(q => q.id)
    showDialog.value = true
}

function confirmDelete(id) {
    ElMessageBox.confirm('确认删除该问卷？', '删除确认', { type: 'warning' })
        .then(() => deleteQuestionnaire(id))
        .then(() => {
            ElMessage.success('删除成功')
            loadData()
        })
        .catch(() => { })
}

function submitForm() {
    const payload = {
        title: dialogTitleInput.value,
        questionIds: selectedQuestions.value
    }
    let fn = isEdit.value ? updateQuestionnaire : addQuestionnaire
    if (isEdit.value) payload.id = editId.value
    fn(payload)
        .then(res => {
            if (res.code === 200) {
                ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
                showDialog.value = false
                loadData()
            } else {
                ElMessage.error(res.message || '操作失败')
            }
        })
        .catch(() => ElMessage.error('操作失败'))
}

function viewDetails(row) {
    detailList.value = row.questions
    showDetailDialog.value = true
}

onMounted(() => {
    loadData()
    loadAllQuestions()
})
</script>

<template>
    <div class="questionnaire-list-container">
        <el-card shadow="hover">
            <div class="toolbar">
                <el-button type="primary" @click="openAdd">新增问卷</el-button>
            </div>

            <el-table :data="questionnaires" v-loading="loading" stripe border>
                <el-table-column prop="id" label="ID" width="80" />
                <el-table-column prop="title" label="问卷标题" />
                <el-table-column prop="questionCount" label="问题数量" width="120" />
                <el-table-column label="操作" width="240">
                    <template #default="{ row }">
                        <el-button size="small" @click="viewDetails(row)">详情</el-button>
                        <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
                        <el-button size="small" type="danger" @click="confirmDelete(row.id)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <el-pagination class="pagination" background layout="sizes, prev, pager, next, jumper, ->, total"
                :total="total" :page-size="pageSize" :current-page="currentPage" :page-sizes="[5, 10, 20]"
                @current-change="handlePageChange" @size-change="handleSizeChange" />

            <el-dialog :title="isEdit ? '编辑问卷' : '新增问卷'" v-model="showDialog" width="600px">
                <el-form>
                    <el-form-item label="问卷标题" label-width="100px">
                        <el-input v-model="dialogTitleInput" />
                    </el-form-item>
                    <el-form-item label="选择问题" label-width="100px">
                        <el-transfer v-model="selectedQuestions" :data="allQuestions" filterable />
                    </el-form-item>
                </el-form>
                <template #footer>
                    <el-button @click="showDialog = false">取消</el-button>
                    <el-button type="primary" @click="submitForm">确定</el-button>
                </template>
            </el-dialog>

            <el-dialog title="问卷详情" v-model="showDetailDialog" width="500px">
                <ul>
                    <li v-for="q in detailList" :key="q.id">{{ q.content }}</li>
                </ul>
                <span slot="footer">
                    <el-button @click="showDetailDialog = false">关闭</el-button>
                </span>
            </el-dialog>
        </el-card>
    </div>
</template>

<style scoped>
.questionnaire-list-container {
    padding: 24px;
}

.toolbar {
    margin-bottom: 16px;
    text-align: right;
}

.pagination {
    margin-top: 16px;
    text-align: right;
}
</style>
