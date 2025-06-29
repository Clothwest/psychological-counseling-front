<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchQuestions, addQuestion, updateQuestion, deleteQuestion } from '@/utils/interceptor/request'

const questions = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(5)
const total = ref(0)

// 对话框状态
const showDialog = ref(false)
const dialogContent = ref('')
const isEdit = ref(false)
const editId = ref(null)

function loadQuestions() {
  loading.value = true
  fetchQuestions(currentPage.value, pageSize.value)
    .then(res => {
      if (res.code === 200) {
        questions.value = res.data.records
        total.value = res.data.total
      } else {
        ElMessage.error(res.message || '加载问题失败')
      }
    })
    .catch(() => ElMessage.error('加载问题失败'))
    .finally(() => loading.value = false)
}

function handlePageChange(page) {
  currentPage.value = page
  loadQuestions()
}

function handleSizeChange(size) {
  pageSize.value = size
  currentPage.value = 1
  loadQuestions()
}

function openAdd() {
  isEdit.value = false
  editId.value = null
  dialogContent.value = ''
  showDialog.value = true
}

function openEdit(item) {
  isEdit.value = true
  editId.value = item.id
  dialogContent.value = item.questionText
  showDialog.value = true
}

function confirmDelete(id) {
  ElMessageBox.confirm('确认删除该问题？', '删除确认', { type: 'warning' })
    .then(() => deleteQuestion(id))
    .then(() => {
      ElMessage.success('删除成功')
      loadQuestions()
    })
    .catch(() => {})
}

function submitQuestion() {
  if (isEdit.value) {
    // 更新问题，传递 id 和 questionText 字符串
    updateQuestion(editId.value, dialogContent.value)
      .then(res => {
        if (res.code === 200) {
          ElMessage.success('更新成功')
          showDialog.value = false
          loadQuestions()
        } else {
          ElMessage.error(res.message || '更新失败')
        }
      })
      .catch(() => ElMessage.error('更新失败'))
  } else {
    // 添加问题，传递 questionText 字符串
    addQuestion(dialogContent.value)
      .then(res => {
        if (res.code === 200) {
          ElMessage.success('添加成功')
          showDialog.value = false
          loadQuestions()
        } else {
          ElMessage.error(res.message || '添加失败')
        }
      })
      .catch(() => ElMessage.error('添加失败'))
  }
}

onMounted(loadQuestions)
</script>

<template>
  <div class="question-list-container">
    <el-card shadow="hover">
      <div class="toolbar">
        <el-button type="primary" @click="openAdd">新增问题</el-button>
      </div>

      <el-table :data="questions" v-loading="loading" stripe border>
        <!-- 序号列 -->
        <el-table-column type="index" label="序号" width="60" />
        <!-- 问题内容 -->
        <el-table-column prop="questionText" label="问题内容" />
        <!-- 操作列 -->
        <el-table-column label="操作" width="180">
          <template #default="{ row }">
            <el-button size="small" type="primary" @click="openEdit(row)">编辑</el-button>
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

      <el-dialog
        :title="isEdit ? '编辑问题' : '新增问题'"
        v-model="showDialog"
        width="500px"
      >
        <el-form>
          <el-form-item label="问题内容" label-width="80px">
            <el-input type="textarea" v-model="dialogContent" rows="3" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="showDialog = false">取消</el-button>
          <el-button type="primary" @click="submitQuestion">确定</el-button>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<style scoped>
.question-list-container {
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
