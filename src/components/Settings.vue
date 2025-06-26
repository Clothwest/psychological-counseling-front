<script setup lang="ts">
import{ useRoute, useRouter } from 'vue-router'

const router = useRouter()

const logout = () => {
  localStorage.removeItem('user')
  router.push('/login')
}

</script>

<template>
    <div>
        <el-button class="logout-btn" type="primary" @click="logout">退出登录</el-button>
    </div>
</template>

<style scoped>
</style>