<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { adminMenus, counselorMenus, assistantMenus, visitorMenus, studentMenus } from '@/utils/menu/menus'

const router = useRouter()
const route = useRoute()
const activeMenu = ref('/' + (route.path.split('/')[1] || 'home'))
const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
const menus = computed(() => {
  if (!user.value || !user.value.role) return []
  switch (user.value.role) {
    case 'admin':
      return adminMenus
    case 'counselor':
      return counselorMenus
    case 'assistant':
      return assistantMenus
    case 'visitor':
      return visitorMenus
    case 'student':
      return studentMenus
    default:
      return []
  }
})

function onMenuSelect(path) {
  router.push(path)
}

watch(() => route.path, (val) => {
  activeMenu.value = '/' + (val.split('/')[1] || 'home')
})

</script>

<template>
  <el-container class="app-container">
    <!-- 顶部横幅 -->
    <el-header class="banner">
      <div class="banner-content">
        <h1>心灵驿站</h1>
        <p>心理咨询，让心灵回归平静</p>
      </div>
    </el-header>
    <el-container class="main-area">
      <!-- 侧边栏 -->
      <el-aside class="sidebar">
        <el-menu :default-active="activeMenu" router unique-opened class="sidebar-menu">
          <template v-for="item in menus" :key="item.path">
            <el-sub-menu v-if="item.children" :index="item.path">
              <template #title>
                <span>{{ item.label }}</span>
              </template>
              <el-menu-item v-for="child in item.children" :key="child.path" :index="child.path">
                {{ child.label }}
              </el-menu-item>
            </el-sub-menu>
            <!-- 无 children 渲染为单条菜单 -->
            <el-menu-item v-else :index="item.path">
              <span>{{ item.label }}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <!-- 主内容区 -->
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.app-container {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.banner {
  flex: 0 0 100px;
  height: 100px;
  background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 100%;
}

.banner-content {
  text-align: center;
  color: #2c3e50;
  position: relative;
}

.logout-btn {
  position: relative;
  top: 24px;
  right: 32px;
  color: #ffffff;
  font-weight: bold;
}

.main-area {
  flex: 1 1 0%;
  display: flex;
  width: 100%;
  min-height: 0;
}

.sidebar {
  background-color: #ffffff;
  border-right: 1px solid #ebeef5;
  overflow-y: auto;
  width: 200px;
  min-width: 80px;
}

.sidebar-menu {
  border-right: none;
}

.content {
  overflow-y: auto;
  background-color: #f5f7fa;
  width: 100%;
}

@media (max-width: 768px) {
  .banner {
    height: 80px;
  }

  .sidebar {
    display: none;
  }
}
</style>
