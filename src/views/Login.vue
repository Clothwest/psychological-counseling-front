<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { loginRequest } from '@/utils/interceptor/request'

const router = useRouter()
const isLoading = ref(false)
const loginForm = ref(null)

// 表单数据 & 校验规则
const form = ref({
  username: '',
  password: '',
  role: ''
})
const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  role: [{ required: true, message: '请选择角色', trigger: 'change' }]
}

async function onLogin() {
  // 校验表单
  await loginForm.value.validate(async valid => {
    if (!valid) return
    isLoading.value = true
    try {
      const res = await loginRequest({
        username: form.value.username,
        password: form.value.password
      })
      if (
        res.code === 200 &&
        res.data.userInfo.role.toLowerCase() === form.value.role
      ) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            username: form.value.username,
            role: form.value.role,
            token: res.data.token
          })
        )
        localStorage.setItem('avatarUrl', res.data.userInfo.avatar)
        router.push('/' + form.value.role)
      } else {
        ElMessage.error(res.message || '登录失败，请检查账号或角色')
      }
    } catch {
      ElMessage.error('登录请求失败，请稍后再试')
    } finally {
      isLoading.value = false
    }
  })
}
</script>

<template>
  <div class="login-bg">
    <!-- 动态渐变背景上的标题 -->
    <h1 class="bg-title">心理咨询</h1>

    <!-- 登录框 -->
    <div class="login-page">
      <h2>登录</h2>
      <el-form :model="form" :rules="rules" ref="loginForm" class="login-form" label-width="80px"
        @submit.prevent="onLogin">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" autocomplete="off" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" autocomplete="off" />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="中心管理员" value="admin" />
            <el-option label="咨询师" value="counselor" />
            <el-option label="咨询助理" value="assistant" />
            <el-option label="初访员" value="visitor" />
            <el-option label="学生" value="student" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="isLoading" @click="onLogin" style="width: 100%;">
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
/* 外层动态渐变背景 */
@keyframes gradientBG {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

/* 文字渐变 + 呼吸效果 */
@keyframes textGradient {
  0% {
    background-position: 0% 50%;
  }

  50% {
    background-position: 100% 50%;
  }

  100% {
    background-position: 0% 50%;
  }
}

@keyframes textPulse {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }
}

.login-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: linear-gradient(45deg,
      #ff9a9e, #fad0c4, #a18cd1, #fbc2eb);
  background-size: 400% 400%;
  animation: gradientBG 15s ease infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 背景标题 */
.bg-title {
  position: absolute;
  top: 40px;
  width: 100%;
  text-align: center;
  font-size: 48px;
  font-weight: bold;
  background: linear-gradient(90deg,
      #ff9a9e, #fad0c4, #a18cd1, #fbc2eb);
  background-size: 300% 300%;
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  animation:
    textGradient 5s linear infinite,
    textPulse 3s ease-in-out infinite;
  z-index: 1;
}

/* 登录框 */
.login-page {
  position: relative;
  width: 400px;
  padding: 32px 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 2;
}

.login-page h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #333;
}

.login-form .el-form-item__label {
  color: #555;
}

.login-form .el-input__inner {
  background: #fff;
}

.login-form .el-button {
  background-color: #409eff;
  border-color: #409eff;
}
</style>
