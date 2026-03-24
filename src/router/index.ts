/**
 * Vue Router 配置 - 移动端 5 个主页面
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { 
      title: '首页',
      icon: 'mdi-home',
      keepAlive: true,
    },
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { 
      title: '星域地图',
      icon: 'mdi-map',
      keepAlive: true,
    },
  },
  {
    path: '/spirits',
    name: 'spirits',
    component: () => import('@/views/SpiritsView.vue'),
    meta: { 
      title: '星灵图鉴',
      icon: 'mdi-star',
      keepAlive: true,
    },
  },
  {
    path: '/spirits/:id/:stage',
    name: 'spirit-detail',
    component: () => import('@/views/SpiritDetailView.vue'),
    meta: { 
      title: '星灵详情',
      requiresAuth: false,
    },
  },
  {
    path: '/timer',
    name: 'timer',
    component: () => import('@/views/TimerView.vue'),
    meta: { 
      title: '专注计时',
      icon: 'mdi-timer',
      keepAlive: false,
    },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('@/views/ProfileView.vue'),
    meta: { 
      title: '个人中心',
      icon: 'mdi-account',
      keepAlive: true,
    },
  },
  // 功能页面
  {
    path: '/battle',
    name: 'battle',
    component: () => import('@/views/BattleView.vue'),
    meta: { 
      title: '星域对战',
      requiresAuth: false,
    },
  },
  {
    path: '/bank',
    name: 'bank',
    component: () => import('@/views/BankView.vue'),
    meta: { 
      title: '能量银行',
      requiresAuth: false,
    },
  },
  {
    path: '/shop',
    name: 'shop',
    component: () => import('@/views/ShopView.vue'),
    meta: { 
      title: '星能商店',
      requiresAuth: false,
    },
  },
  {
    path: '/tasks',
    name: 'tasks',
    component: () => import('@/views/TasksView.vue'),
    meta: { 
      title: '每日任务',
      requiresAuth: false,
    },
  },
  {
    path: '/achievements',
    name: 'achievements',
    component: () => import('@/views/AchievementsView.vue'),
    meta: { 
      title: '成就系统',
      requiresAuth: false,
    },
  },
  {
    path: '/todo',
    name: 'todo',
    component: () => import('@/views/TodoView.vue'),
    meta: { 
      title: '待办清单',
    },
  },
  {
    path: '/inspiration',
    name: 'inspiration',
    component: () => import('@/views/InspirationView.vue'),
    meta: { 
      title: '灵感记录',
    },
  },
  // 测试页面
  {
    path: '/skill-test',
    name: 'skill-test',
    component: () => import('@/views/SkillTestView.vue'),
    meta: { 
      title: '技能系统测试',
      requiresAuth: false,
    },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  },
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = to.meta.title ? `${to.meta.title} - TimeVoyager` : 'TimeVoyager'
  next()
})

export default router
