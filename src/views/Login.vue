<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const role = ref('')
const router = useRouter()

function onLogin() {
  if (!username.value || !password.value || !role.value) {
    // return
  }
  // 实际应调用后端接口，这里直接模拟
  localStorage.setItem('user', JSON.stringify({ username: username.value, role: role.value }))
  router.push('/' + role.value)
}

</script>

<template>
  <div class="login-page">
    <h2>登录</h2>
    <el-form @submit.prevent="onLogin">
      <el-form-item label="用户名">
        <el-input v-model="username" />
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="password" type="password" />
      </el-form-item>
      <el-form-item label="角色">
        <el-select v-model="role" placeholder="请选择角色">
          <el-option label="中心管理员" value="admin" />
          <el-option label="咨询师" value="counselor" />
          <el-option label="咨询助理" value="assistant" />
          <el-option label="初访员" value="visitor" />
          <el-option label="学生" value="student" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 100px auto;
  padding: 32px 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
</style>
