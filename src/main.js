import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router/index.js";
import {createPinia} from "pinia";
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import 'dayjs/locale/zh-cn'
import Antd from 'ant-design-vue'
import directive from './directive/index.js'

const pinia = createPinia()



async function boot(){
    // 在 main.js 中通过动态 import 按需加载，仅在开发环境 + VITE_USE_WEBSOCKET_MOCK=true 时启动：
    if (import.meta.env.DEV && import.meta.env.VITE_USE_WEBSOCKET_MOCK === 'true') {
        import('../mock/mockServer.js').then(({ createMockServer }) => {
            const mockServer = createMockServer()
            mockServer.start()
            console.log('🎭 Mock WebSocket 服务已启用')
        })
    }

    // 生产环境（GitHub Pages）启用 API mock 拦截器：
    if (!import.meta.env.DEV) {
        // 生产环境动态导入以拦截 API 请求。
        // 但问题在于动态导入是异步的，没有等待完成就挂载了应用，导致路由守卫中的 fetch 请求在 mock 拦截器加载之前就发出了。
        // 解决方法：把应用初始化放在async中，利用await在应用挂载前等待 mock 拦截器加载完成。
        await import('./api/mockInterceptor.js')
        import('./websocket/mockClient.js').then(({ enableMockWebSocket }) => {
            enableMockWebSocket()
        })
    }

    const app = createApp(App)
    app.use(router).use(pinia).use(directive).use(Antd, { locale: zhCN }).mount('#app')

}

boot()

