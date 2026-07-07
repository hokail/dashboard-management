<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {permissionStore} from "../stores/permission.js";
import {storeToRefs} from "pinia";

const usePermissionStore = permissionStore()
const {userRole} = storeToRefs(usePermissionStore)
const {getUserPermission,clearPermission} = usePermissionStore

const collapsed = ref(false)

const menuItems = [
  { key: 'board', icon: '📊', label: '数据概览' },
  { key: 'alarmHistoryList', icon: '📋', label: '警报历史' },
]

const selectedKey = ref('board')


const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

const router = useRouter()

function logout(){
  clearPermission()
  localStorage.removeItem('board-username')
  router.push('/login')
}

</script>

<template>
  <div class="layout">
    <!-- 左侧边栏 -->
    <aside class="sidebar" :class="{ collapsed }">
      <div class="logo">
        <span v-if="!collapsed">数据管理平台</span>
        <span v-else>DM</span>
      </div>

      <nav class="menu">
        <router-link
            v-for="item in menuItems"
            :key="item.key"
            class="menu-item"
            :class="{ active: selectedKey === item.key }"
           :to="`/${item.key}`"
            @click="selectedKey = item.key"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="!collapsed" class="menu-label">{{ item.label }}</span>
        </router-link>
      </nav>

      <div class="sidebar-footer">
        <a-button
            type="text"
            class="collapse-btn"
            @click="toggleCollapse"
        >
          {{ collapsed ? '▶' : '◀' }}
        </a-button>
      </div>
    </aside>

    <!-- 右侧主内容区 -->
    <main class="main-content">
      <!-- 顶部标题栏 -->
      <header class="header">
        <h1 class="page-title">数据概览</h1>
        <div class="header-actions">
          <a-button type="text">🔔</a-button>
          <a-dropdown>
            <a-button type="text">
              👤 {{ userRole ==='admin' ? '管理员':'用户' }}
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-divider />
                <a-menu-item @click="logout">退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </header>

      <!-- 主要内容展示区域 -->
      <div class="content">
        <router-view></router-view>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  background: #f0f2f5;
}

/* 左侧边栏 */
.sidebar {
  width: 240px;
  background: #001529;
  color: white;
  display: flex;
  flex-direction: column;
  transition: width 0.3s ease;
  position: relative;
}

.sidebar.collapsed {
  width: 80px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0 16px;
}

.menu {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.3s;
  color: rgba(255, 255, 255, 0.65);
  text-decoration: none;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
}

.menu-item.active {
  background: #1890ff;
  color: white;
}

.menu-icon {
  font-size: 20px;
  margin-right: 12px;
}

.sidebar.collapsed .menu-icon {
  margin-right: 0;
}

.menu-label {
  white-space: nowrap;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 8px;
  display: flex;
  justify-content: flex-end;
}

.collapse-btn {
  color: rgba(255, 255, 255, 0.65);
}

.collapse-btn:hover {
  color: white;
}

/* 右侧主内容 */
.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  height: 100%;
}

.header {
  height: 64px;
  background: white;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.page-title {
  font-size: 20px;
  font-weight: 500;
  color: #333;
  margin: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  height: calc(100% - 64px);
}

.welcome-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 32px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.welcome-card h2 {
  font-size: 24px;
  margin: 0 0 8px 0;
}

.welcome-card p {
  margin: 0;
  opacity: 0.9;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #1890ff;
  margin: 16px 0 8px;
}

.stat-change {
  font-size: 14px;
  margin-top: 8px;
}

.stat-change.positive {
  color: #52c41a;
}

.stat-status {
  color: #52c41a;
  margin-top: 8px;
}

.activity-card {
  margin-top: 24px;
}
</style>
