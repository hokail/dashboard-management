<script setup>
import { ref } from 'vue'

const collapsed = ref(false)

const menuItems = [
  { key: 'dashboard', icon: '📊', label: '数据概览' },
  { key: 'users', icon: '👥', label: '用户管理' },
  { key: 'data', icon: '📁', label: '数据管理' },
  { key: 'analysis', icon: '📈', label: '数据分析' },
  { key: 'reports', icon: '📋', label: '报表中心' },
  { key: 'settings', icon: '⚙️', label: '系统设置' }
]

const selectedKey = ref('dashboard')

const handleMenuClick = (key) => {
  selectedKey.value = key
  console.log('切换到:', key)
}

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
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
        <div
            v-for="item in menuItems"
            :key="item.key"
            class="menu-item"
            :class="{ active: selectedKey === item.key }"
            @click="handleMenuClick(item.key)"
        >
          <span class="menu-icon">{{ item.icon }}</span>
          <span v-if="!collapsed" class="menu-label">{{ item.label }}</span>
        </div>
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
              👤 管理员
            </a-button>
            <template #overlay>
              <a-menu>
                <a-menu-item>个人中心</a-menu-item>
                <a-menu-item>修改密码</a-menu-item>
                <a-menu-divider />
                <a-menu-item>退出登录</a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
      </header>

      <!-- 主要内容展示区域 -->
      <div class="content">
        <div class="welcome-card">
          <h2>欢迎使用数据管理平台</h2>
          <p>这是一个现代化的数据管理系统，帮助您高效管理和分析数据。</p>
        </div>

        <div class="stats-grid">
          <a-card title="总用户数" class="stat-card">
            <div class="stat-value">1,234</div>
            <div class="stat-change positive">↑ 12.5%</div>
          </a-card>

          <a-card title="今日访问" class="stat-card">
            <div class="stat-value">567</div>
            <div class="stat-change positive">↑ 8.3%</div>
          </a-card>

          <a-card title="数据总量" class="stat-card">
            <div class="stat-value">89.5K</div>
            <div class="stat-change positive">↑ 15.2%</div>
          </a-card>

          <a-card title="系统状态" class="stat-card">
            <div class="stat-value">正常</div>
            <div class="stat-status">● 运行中</div>
          </a-card>
        </div>

        <a-card title="最近活动" class="activity-card">
          <a-table
              :columns="[
              { title: '时间', dataIndex: 'time', key: 'time' },
              { title: '操作', dataIndex: 'action', key: 'action' },
              { title: '用户', dataIndex: 'user', key: 'user' },
              { title: '状态', dataIndex: 'status', key: 'status' }
            ]"
              :data-source="[
              { key: '1', time: '2026-05-27 10:30', action: '数据导入', user: '张三', status: '成功' },
              { key: '2', time: '2026-05-27 09:15', action: '用户创建', user: '李四', status: '成功' },
              { key: '3', time: '2026-05-27 08:45', action: '报表生成', user: '王五', status: '处理中' },
              { key: '4', time: '2026-05-26 16:20', action: '数据导出', user: '赵六', status: '成功' }
            ]"
              :pagination="false"
              size="small"
          />
        </a-card>
      </div>
    </main>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  min-height: 100vh;
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
  padding: 24px;
  overflow-y: auto;
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
