<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { fetchQuestions, addQuestion, updateQuestion, deleteQuestion } from '@/utils/interceptor/request'

const filters = reactive({
  pageNum: 1,
  pageSize: 10,
  questionText: ''
})

const questions = ref([])
const loading = ref(false)
const total = ref(0)

const showDialog = ref(false)
const dialogContent = ref('')
const isEdit = ref(false)
const editId = ref(null)

async function loadQuestions() {
  loading.value = true
  try {
    const payload = { ...filters }
    const res = await fetchQuestions(payload)
    if (res.code === 200 && res.data) {
      questions.value = res.data.records
      total.value = res.data.total
    } else {
      ElMessage.error(res.message || '加载问题失败')
    }
  } catch {
    ElMessage.error('加载问题失败')
  } finally {
    loading.value = false
  }
}

function doSearch() {
  filters.pageNum = 1
  loadQuestions()
}

function handlePageChange(page) {
  filters.pageNum = page
  loadQuestions()
}

function handleSizeChange(size) {
  filters.pageSize = size
  filters.pageNum = 1
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
    .then(async () => {
      await deleteQuestion(id)
      ElMessage.success('删除成功')
      loadQuestions()
    })
    .catch(() => {})
}

function submitQuestion() {
  if (!dialogContent.value.trim()) {
    ElMessage.warning('请输入问题内容')
    return
  }
  const fn = isEdit.value
    ? () => updateQuestion(editId.value, dialogContent.value)
    : () => addQuestion(dialogContent.value)
  fn()
    .then(res => {
      if (res.code === 200) {
        ElMessage.success(isEdit.value ? '更新成功' : '添加成功')
        showDialog.value = false
        loadQuestions()
      } else {
        ElMessage.error(res.message || (isEdit.value ? '更新失败' : '添加失败'))
      }
    })
    .catch(() => {
      ElMessage.error(isEdit.value ? '更新失败' : '添加失败')
    })
}

onMounted(loadQuestions)
</script>

<template>
  <div class="question-list-container">
    <el-card shadow="hover">
      <div class="filter-bar">
        <el-input
          v-model="filters.questionText"
          placeholder="搜索问题内容"
          clearable
          @clear="doSearch"
          @keyup.enter="doSearch"
          style="width:240px; margin-right:8px;"
        />
        <el-button type="primary" @click="doSearch">查询</el-button>
        <el-button type="success" @click="openAdd" style="margin-left:16px;">新增问题</el-button>
      </div>

      <el-table :data="questions" v-loading="loading" stripe border>
        <el-table-column type="index" label="序号" width="60" />
        <el-table-column prop="questionText" label="问题内容" />
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
        :page-size="filters.pageSize"
        :current-page="filters.pageNum"
        :page-sizes="[5, 10, 20]"
        @current-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </el-card>

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
  </div>
</template>

<style scoped>
.filter-bar {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}
.question-list-container {
  padding: 24px;
}
.pagination {
  margin-top: 16px;
  text-align: right;
}
</style>
