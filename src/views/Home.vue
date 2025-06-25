<script setup lang="ts">
const user = JSON.parse(localStorage.getItem('user') || '{}')
</script>

<template>
  <div class="content-inner">
    <template v-if="user.role === 'admin'">
      <h2>欢迎，中心管理员</h2>
      <p>这里是管理员首页。</p>
    </template>
    <template v-else-if="user.role === 'counselor'">
      <h2>欢迎，咨询师</h2>
      <p>这里是咨询师首页。</p>
    </template>
    <template v-else-if="user.role === 'assistant'">
      <h2>欢迎，咨询助理</h2>
      <p>这里是助理首页。</p>
    </template>
    <template v-else-if="user.role === 'visitor'">
      <h2>欢迎，初访员</h2>
      <p>这里是初访员首页。</p>
    </template>
    <template v-else-if="user.role === 'student'">
      <h2>欢迎，学生</h2>
      <p>这里是学生首页。</p>
    </template>
    <template v-else>
      <h2>欢迎</h2>
      <p>请联系管理员分配角色。</p>
    </template>
    <p>当前角色: {{ user.role || '未登录' }}</p>
  </div>
</template>

<style scoped>
.content-inner {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 16px;
  box-sizing: border-box;
  width: 100%;
}
</style>