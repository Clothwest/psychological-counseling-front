<script setup lang="ts">
import { ref } from 'vue'
import { HomeFilled, Menu, Document } from '@element-plus/icons-vue'

const activeMenu = ref('/dashboard') // 当前激活的菜单项

// 如果你使用 <router-link> 或 router 模式，请确保 index 对应 route.path
</script>

<template>
  <el-menu
    :default-active="activeMenu"
    class="el-menu-vertical-demo"
    background-color="#545c64"
    text-color="#fff"
    active-text-color="#ffd04b"
    router
    unique-opened
  >
    <!-- 一级菜单项 -->
    <el-menu-item index="/dashboard">
      <el-icon><HomeFilled /></el-icon>
      <span>仪表盘</span>
    </el-menu-item>

    <!-- 可展开的子菜单 -->
    <el-sub-menu index="1">
      <template #title>
        <el-icon><Menu /></el-icon>
        <span>用户管理</span>
      </template>

      <!-- 子菜单项 -->
      <el-menu-item index="/user/list">用户列表</el-menu-item>
      <el-menu-item index="/user/create">新增用户</el-menu-item>
    </el-sub-menu>

    <!-- 另一个子菜单 -->
    <el-sub-menu index="2">
      <template #title>
        <el-icon><Document /></el-icon>
        <span>咨询管理</span>
      </template>

      <el-menu-item index="/consultation/records">咨询记录</el-menu-item>
      <el-menu-item index="/consultation/appointments">预约管理</el-menu-item>
    </el-sub-menu>
  </el-menu>
</template>

<style scoped>
.el-menu-vertical-demo {
  width: 220px;
  min-height: 100vh;
}
</style>
