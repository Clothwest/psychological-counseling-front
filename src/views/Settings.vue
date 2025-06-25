<script setup lang="ts">
const user = JSON.parse(localStorage.getItem('user') || '{}')
</script>

<template>
  <div class="content-inner">
    <h2>设置</h2>
    <p v-if="user.role === 'admin'">这里是管理员的系统设置。</p>
    <p v-else>这里是{{ user.role }}的个人设置。</p>
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