import { createWebHistory, createRouter } from 'vue-router'

import Login from "../pages/Login.vue";
import Home from "../pages/Home.vue";
import Board from "../pages/Board.vue";
// import Graph from "../pages/Graph.vue";

const routes = [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    { path: '/home', component: Home },
    { path: '/board', component: Board },
    // { path: '/graph', component: Graph },
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router