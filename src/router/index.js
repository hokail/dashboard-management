import { createWebHistory, createRouter } from 'vue-router'
import {permissionStore} from "../stores/permission.js";
import {storeToRefs} from "pinia";


const routes = [
    { path: '/', redirect: '/board' },
    { path: '/login', name:'login',component: () => import('../pages/Login.vue') },
    { path: '/home',name:'home', component: () => import('../pages/Home.vue') , children: [ ]},
]

// 创建路由实例
const router = createRouter({
    history: createWebHashHistory(),
    routes,
})

const asyncRoutes = [
    { path: '/board', component: () => import('../pages/Board.vue') ,meta: { roles: ['admin','user'] },},
    { path: '/reportDispatch', component: () => import('../pages/ReportDispatch.vue') ,meta: { roles: ['admin'] }},
    { path: '/digitalBoard', component: () => import('../pages/DigitalBoard.vue') ,meta: { roles: ['admin'] }},
    { path: '/graph', component: () => import('../pages/deviceHistory/DeviceHistory.vue') ,meta: { roles: ['admin'] }},
    { path: '/alarmHistoryList', component: () => import('../pages/AlarmHistoryList.vue') ,meta: { roles: ['admin'] }},

]

function addRoutes(userRole){
    const userRoutes = asyncRoutes.filter(r => {
        return r.meta.roles && r.meta.roles.includes(userRole)
    })
    if(router.hasRoute('home')){
        userRoutes.forEach(route => {
            router.addRoute('home', route)
        })
    }
    // 添加 404 通配符路由，必须放在最后，确保所有已添加的路由都能先匹配
    router.addRoute({
        path: '/:pathMatch(.*)*',
        name: '404',
        component: () => import('../pages/404.vue')
    })
}

router.beforeEach(async (to,from,next) => {
    if(to.path === '/login') {
        next()
        return
    }

    //✅ useStore()放在 beforeEach里面
    const usePermissionStore = permissionStore()
    const {userRole} = storeToRefs(usePermissionStore)
    const {getUserPermission,clearPermission} = usePermissionStore

    if(!userRole.value){
        const username = localStorage.getItem('board-username')
        if(!username){
            next('/login')
            return
        }
        await getUserPermission(username)
        addRoutes(userRole.value)
        // 重新加载当前路由，确保路由表更新，直接写next()会因为无法获取到最新的路由表，导致导航失败
        next({ ...to, replace: true })
        return
    }
    next()
})



export default router