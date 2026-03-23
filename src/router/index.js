import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Focus',
    component: () => import('@/views/FocusView.vue'),
    meta: { title: '专注', icon: 'mdi-timer-outline' }
  },
  {
    path: '/spirit',
    name: 'Spirit',
    component: () => import('@/views/SpiritView.vue'),
    meta: { title: '灵体', icon: 'mdi-star-four-points' }
  },
  {
    path: '/explore',
    name: 'Explore',
    component: () => import('@/views/ExploreView.vue'),
    meta: { title: '探索', icon: 'mdi-rocket-launch' }
  },
  {
    path: '/achievements',
    name: 'Achievements',
    component: () => import('@/views/AchievementsView.vue'),
    meta: { title: '成就', icon: 'mdi-trophy' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - TimeVoyager`
  }
  next()
})

export default router
