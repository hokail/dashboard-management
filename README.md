# 智能设备监控中心

> Digital Twin Monitoring System — 制造业车间设备实时监控与数字孪生可视化平台

基于 **Vue 3 + Vite + Pinia + Ant Design Vue** 构建，集成 **ECharts** 2D 数据看板、**Three.js** 3D 数字孪生场景、**AntV X6** 设备历史流程图，支持 WebSocket 实时数据推送与工单派发管理。

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 (Composition API + `<script setup>`) | ^3.5 |
| 构建工具 | Vite | ^8.0 |
| 状态管理 | Pinia | ^3.0 |
| 路由 | Vue Router | ^4.6 |
| UI 组件库 | Ant Design Vue | ^4.2 |
| 2D 可视化 | ECharts | ^6.1 |
| 3D 可视化 | Three.js | ^0.184 |
| 流程图 | AntV X6 | ^3.1 |
| 实时通信 | WebSocket（自研封装） | — |
| 数据模拟 | mock-socket + mockjs | ^9.3 / ^1.1 |
| 表格导出 | XLSX (SheetJS) | ^0.18 |
| 日期处理 | dayjs | ^1.11 |
| 部署 | GitHub Actions | — |

---

## 功能模块

### 登录 & 权限管理
- 基于 **RBAC** 实现动态路由注册与自定义 `v-permission` 指令，支持 admin / user 两种角色
- 路由守卫 `beforeEach` 校验登录态，按角色异步添加可访问路由

### 2D 设备监控看板
- ECharts 渲染设备状态分布、24h 趋势、关键指标卡片
- WebSocket 实时接收设备状态推送，节流优化高频更新场景

### 3D 数字孪生看板
- Three.js 构建车间 3D 场景，设备状态通过颜色区分（绿/灰/红/黄）
- 射线检测实现设备点击选中、悬浮提示、侧边详情面板
- OrbitControls 自由漫游，EffectComposer + UnrealBloomPass 泛光特效

### 设备历史状态追溯
- 基于 AntV X6 流程图展示设备状态变更时间线
- 自定义 Vue 节点（x6-vue-shape），支持按状态类型筛选

### 报警历史列表
- 支持按优先级、派单状态、设备名称多条件筛选
- 集成 XLSX 一键导出 Excel 报表

### 工单派发管理
- 从报警数据一键生成派工单，表单校验
- 工单状态流转（未处理 → 已派单 → 处理中）

### WebSocket 实时通信
- 自研封装 `HeartbeatWebSocket` 类，支持心跳保活、断线重连、回调注册
- 开发环境通过 mock-socket 模拟 WebSocket 服务端推送设备状态

---

## 项目结构

```
dashboard-management/
├── .github/workflows/          # CI/CD 自动部署
│   └── deploy.yml
├── mock/                       # Mock 数据
│   ├── mockServer.js           # 开发环境 WebSocket 模拟服务端
│   ├── board.js                # 看板数据
│   ├── user.js                 # 用户/权限数据
│   ├── alarmHistoryList.js     # 报警历史数据
│   └── reportDispatch.js       # 派单数据
├── src/
│   ├── api/
│   │   └── mockInterceptor.js  # 生产环境 fetch 拦截 Mock
│   ├── directive/
│   │   ├── index.js            # 自定义指令注册
│   │   └── permission.js       # v-permission 权限指令
│   ├── graph/
│   │   └── nodes/
│   │       ├── DeviceHistoryNode.vue  # X6 自定义节点
│   │       └── register.js           # 节点/边注册
│   ├── pages/
│   │   ├── Login.vue           # 登录页
│   │   ├── Home.vue            # 布局容器
│   │   ├── Board.vue           # 2D 设备监控看板
│   │   ├── DigitalBoard.vue    # 3D 数字孪生看板
│   │   ├── AlarmHistoryList.vue # 报警历史列表
│   │   ├── ReportDispatch.vue  # 工单派发管理
│   │   ├── deviceHistory/      # 设备历史状态追溯
│   │   │   ├── DeviceHistory.vue
│   │   │   └── components/Graph.vue
│   │   └── 404.vue
│   ├── plugins/
│   │   └── echarts.js          # ECharts 按需引入
│   ├── router/
│   │   └── index.js            # 路由配置（动态路由 + 权限守卫）
│   ├── stores/                 # Pinia 状态管理
│   │   ├── board.js
│   │   ├── login.js
│   │   ├── permission.js
│   │   ├── alarmHistoryList.js
│   │   └── reportDispatch.js
│   ├── three/
│   │   └── cursorControl.js    # Three.js 射线交互控制
│   ├── utils/
│   │   └── index.js            # 工具函数（防抖、节流、时间格式化）
│   ├── websocket/
│   │   ├── index.js            # HeartbeatWebSocket 封装
│   │   └── mockClient.js       # 生产环境 WebSocket 模拟客户端
│   ├── webWorker/
│   │   └── alarmSheredSocket.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .env.development
├── .env.production
├── index.html
├── package.json
└── vite.config.js
```

---

## 快速开始

### 环境要求

- Node.js >= 18
- npm >= 9

### 安装依赖

```bash
npm install
```

### 开发模式启动

```bash
npm run dev
```

开发模式下默认启用 WebSocket Mock 服务，浏览器访问 `http://localhost:5173` 即可预览。

#### 登录测试账号

| 角色 | 用户名 | 密码    | 权限 |
|------|--------|-------|-----|
| 管理员 | admin | admin | 全部功能 |
| 普通用户 | user | user  | 仅看板 |

### 生产构建

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

---

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_USE_WEBSOCKET_MOCK` | 是否启用 WebSocket Mock | `true`（开发）/ `false`（生产） |
| `VITE_WS_URL` | WebSocket 服务地址 | `ws://localhost:8080` |
| `VITE_PROD_URL` | 生产环境 WebSocket 地址 | `ws://localhost:8080` |

---

## Mock 数据说明

项目内置完整 Mock 数据体系，无需后端即可独立运行：

- **开发环境**：通过 `mock-socket` 在本地启动 WebSocket 模拟服务，定时推送设备状态变更
- **生产环境**：通过 `mockInterceptor.js` 拦截 `window.fetch` 请求，返回 Mock 数据；通过 `mockClient.js` 在浏览器端模拟 WebSocket 推送

---

## 技术亮点

- **自研 WebSocket 封装**：心跳检测（30s 间隔 + 10s 超时）、断线重连（最大 10 次）、回调注册机制
- **Three.js 数字孪生**：射线检测交互、泛光特效、OrbitControls 自由漫游、2D/3D 视图切换
- **AntV X6 自定义节点**：通过 `x6-vue-shape` 将 Vue 组件注册为图节点，实现流程图与业务数据绑定
- **RBAC 权限控制**：动态路由 + 路由守卫 + 自定义指令，页面级与按钮级双重控制
- **性能优化**：高频 WebSocket 消息节流处理、搜索输入防抖、路由懒加载、异步组件
- **完整 Mock 体系**：开发/生产环境双模式 Mock，前后端分离独立开发演示

---

## 部署

项目通过 GitHub Actions 自动部署到 GitHub Pages，推送 `master` 分支后自动触发构建和部署。

---

## License

MIT