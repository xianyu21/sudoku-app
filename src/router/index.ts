import { createRouter, createWebHistory } from 'vue-router'
import StartPage from '@/pages/StartPage.vue'
import GamePage from '@/pages/GamePage.vue'
import ProfilePage from '@/pages/ProfilePage.vue'

// 定义路由配置
const routes = [
  {
    path: '/',
    name: 'start',
    component: StartPage,
  },
  {
    path: '/game',
    name: 'game',
    component: GamePage,
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilePage,
  },
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
