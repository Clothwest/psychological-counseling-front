<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { changePasswordRequest } from '@/utils/interceptor/request'

const router = useRouter()

// 修改密码表单数据与验证规则
type PasswordForm = {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

const passwordForm = ref<PasswordForm>({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 1, message: '密码长度至少1位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: (rule: any, value: string, callback: any) => {
        if (value !== passwordForm.value.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, trigger: 'blur' }
  ]
}

const passwordFormRef = ref<InstanceType<typeof import('element-plus')['ElForm']>>()

function logout() {
  localStorage.removeItem('user')
  router.push('/login')
}

function onSubmit() {
  passwordFormRef.value?.validate((valid: boolean) => {
    if (valid) {
      changePasswordRequest({
        oldPassword: passwordForm.value.oldPassword,
        newPassword: passwordForm.value.newPassword
      }).then((res) => {
        if (res.code === 200) {
          ElMessage.success('密码修改成功！请重新登录')
          logout()
        } else {
          ElMessage.error('密码修改失败，请重试')
        }
      }).catch((error: any) => {
        ElMessage.error('密码修改失败，请重试')
      })
    }
  })
}
</script>

<template>
  <div class="settings-container">
    <el-card shadow="hover">
      <h2>账户设置</h2>
      <el-form
        ref="passwordFormRef"
        :model="passwordForm"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="passwordForm.oldPassword"
            type="password"
            placeholder="请输入旧密码"
          />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="passwordForm.newPassword"
            type="password"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
            v-model="passwordForm.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">修改密码</el-button>
          <el-button class="logout-btn" type="warning" @click="logout">退出登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped>
.settings-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 20px;
}
.logout-btn {
  margin-left: 16px;
}
</style>
