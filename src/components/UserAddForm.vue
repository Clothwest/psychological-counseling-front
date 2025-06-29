<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addUser, updateUser } from '@/utils/interceptor/request'

const props = defineProps({
  initUser: { type: Object, default: () => ({}) },
  isEdit: { type: Boolean, default: false }
})
const emit = defineEmits(['added', 'cancel'])

const formRef = ref(null)
const formData = ref({
  id: '',
  username: '',
  name: '',
  phone: '',
  college: '',
  gender: '',
  role: '',
  password: ''
})
const isEditingPassword = ref(false)

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  phone: [{ required: true, message: '请输入电话号码', trigger: 'blur' }],
  college: [{ required: true, message: '请输入学院', trigger: 'blur' }],
  role: [{ required: true, message: '请选择职位', trigger: 'change' }]
}

function resetForm() {
  const u = props.initUser || {}
  formData.value = {
    id: u.id || '',
    username: u.username || '',
    name: u.name || '',
    phone: u.phone || '',
    college: u.college || '',
    gender: u.gender?.toLowerCase() || '',
    role: u.role?.toLowerCase() || '',
    password: ''
  }
  isEditingPassword.value = false
}

watch(() => props.initUser, resetForm, { immediate: true })

async function submit() {
  formRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      const payload = { ...formData.value }
      if (!props.isEdit && !payload.password) {
        payload.password = payload.username
      }

      if (props.isEdit) {
        if (!isEditingPassword.value) delete payload.password
        await updateUser(
          payload.id,
          payload.name,
          payload.phone,
          payload.role.toUpperCase(),
          payload.college,
          payload.gender.toUpperCase(),
          payload.password
        )
      } else {
        await addUser(
          payload.username,
          payload.name,
          payload.phone,
          payload.role.toUpperCase(),
          payload.college,
          payload.gender.toUpperCase(),
          payload.password
        )
      }


      emit('added')
    } catch {
    }
  })
}
</script>

<template>
  <el-form ref="formRef" :model="formData" :rules="rules" label-width="100px">
    <el-form-item label="用户名" prop="username">
      <el-input v-model="formData.username" placeholder="请输入用户名" :disabled="props.isEdit" />
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
    <el-form-item label="性别">
      <el-select v-model="formData.gender" placeholder="请选择性别">
        <el-option label="--" value="" />
        <el-option label="男" value="male" />
        <el-option label="女" value="female" />
      </el-select>
    </el-form-item>
    <el-form-item label="职位" prop="role">
      <el-select v-model="formData.role" placeholder="请选择职位">
        <el-option label="中心管理员" value="admin" />
        <el-option label="咨询师" value="counselor" />
        <el-option label="咨询助理" value="assistant" />
        <el-option label="初访员" value="visitor" />
        <el-option label="学生" value="student" />
      </el-select>
    </el-form-item>
    <el-form-item :label="props.isEdit ? '密码' : '初始密码'" prop="password">
      <el-input v-model="formData.password" :disabled="!isEditingPassword" placeholder="点击下方按钮修改密码" />
      <div style="margin-top:4px;">
        <el-button type="text" @click="isEditingPassword = true">修改密码</el-button>
        <el-button type="text" @click="isEditingPassword = false">取消修改</el-button>
      </div>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submit">
        {{ props.isEdit ? '更新用户' : '添加用户' }}
      </el-button>
      <el-button @click="emit('cancel')">取消</el-button>
    </el-form-item>
  </el-form>
</template>

<style scoped></style>
