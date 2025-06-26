<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addUser } from '@/utils/interceptor/request'

const emit = defineEmits(['added', 'cancel'])
const formRef = ref(null)
const formData = ref({
  username: '',
  name: '',
  phone: '',
  college: '',
  gender: '',
  password: ''
})
const isEditingPassword = ref(false)
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话号码', trigger: 'blur' }],
  college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
  gender: [{ required: true, message: '请选择性别', trigger: 'change' }],
  password: [{ required: true, message: '请输入初始密码', trigger: 'blur' }]
}

watch(() => formData.value.username, (val) => {
  if (!isEditingPassword.value) {
    formData.value.password = val
  }
})

function enableEdit() {
  isEditingPassword.value = true
}

function cancelEdit() {
  isEditingPassword.value = false
  formData.value.password = formData.value.username
}

function submit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      await addUser(formData.value)
      emit('added')
    } catch {
      ElMessage.error('添加用户失败')
    }
  })
}
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formData.username" placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="姓名" prop="name">
      <el-input v-model="formData.name" placeholder="请输入姓名" />
    </el-form-item>
    <el-form-item label="电话号码" prop="phone">
      <el-input v-model="formData.phone" placeholder="请输入电话号码" />
    </el-form-item>
    <el-form-item label="学院" prop="college">
      <el-input v-model="formData.college" placeholder="请输入学院" />
    </el-form-item>
    <el-form-item label="性别" prop="gender">
      <el-select v-model="formData.gender" placeholder="请选择性别">
        <el-option label="男" value="male" />
        <el-option label="女" value="female" />
      </el-select>
    </el-form-item>
    <el-form-item label="初始密码" prop="password">
      <el-input v-model="formData.password" :disabled="!isEditingPassword" placeholder="初始密码默认为用户名，如需修改请点击按钮" />
      <el-button type="text" @click="enableEdit">修改密码</el-button>
      <el-button type="text" @click="cancelEdit">取消修改</el-button>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">提交</el-button>
      <el-button @click="emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped></style>
