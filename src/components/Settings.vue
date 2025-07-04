<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { changePasswordRequest, uploadAvatarRequest, logoutRequest } from '@/utils/interceptor/request'

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
const avatarUrl = ref('')

function logout() {
  logoutRequest().then(() => {
    localStorage.removeItem('user')
    localStorage.removeItem('avatarUrl')
    router.push('/login')
  }).catch(() => {
      ElMessage.error('退出登录失败，请稍后再试')
    })
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
      }).catch(() => {
        ElMessage.error('密码修改失败，请重试')
      })
    }
  })
}

function onAvatarUpload(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  uploadAvatarRequest(formData).then((res) => {
    if (res.code === 200) {
      ElMessage.success('头像上传成功')
      localStorage.setItem('avatarUrl', res.data.avatarUrl)
      loadAvatar()
    } else {
      ElMessage.error('头像上传失败')
    }
  }).catch(() => {
    ElMessage.error('头像上传失败')
  })
}

function loadAvatar() {
  avatarUrl.value = localStorage.getItem('avatarUrl')
}

loadAvatar()
</script>

<template>
  <div class="settings-container">
    <el-card shadow="hover">
      <h2>账户设置</h2>

      <div class="avatar-section">
        <img :src="avatarUrl" alt="头像" class="avatar-img" v-if="avatarUrl" />
        <el-upload
          class="avatar-uploader"
          :show-file-list="false"
          :before-upload="onAvatarUpload"
          accept="image/*"
        >
          <el-button type="primary">上传新头像</el-button>
        </el-upload>
      </div>

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
.avatar-section {
  margin-bottom: 20px;
  text-align: center;
}
.avatar-img {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 50%;
  margin-bottom: 10px;
  border: 1px solid #ccc;
}
</style>
