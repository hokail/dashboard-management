import { createWebHistory, createRouter } from 'vue-router'

const routes = [
    { path: '/', redirect: '/alarmHistoryList' },
    { path: '/login', component: () => import('../pages/Login.vue') },
    { path: '/home', component: () => import('../pages/Home.vue') },
    { path: '/board', component: () => import('../pages/Board.vue') },
    { path: '/reportDispatch', component: () => import('../pages/ReportDispatch.vue') },
    { path: '/digitalBoard', component: () => import('../pages/DigitalBoard.vue') },
    { path: '/graph', component: () => import('../pages/deviceHistory/DeviceHistory.vue') },
    { path: '/alarmHistoryList', component: () => import('../pages/AlarmHistoryList.vue') },
]

// 创建路由实例
const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router