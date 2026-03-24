<template>
  <v-app>
    <!-- 主内容区 -->
    <v-main class="main-content">
      <router-view v-slot="{ Component }">
        <keep-alive>
          <component :is="Component" :key="$route.fullPath" />
        </keep-alive>
      </router-view>
    </v-main>

    <!-- 新手引导 -->
    <NewbieGuide />

    <!-- 底部导航栏（移动端） -->
    <v-bottom-navigation
      :model-value="currentRoute"
      :height="56"
      class="bottom-nav safe-area-bottom"
      grow
      ripple="false"
    >
      <v-btn
        v-for="item in navItems"
        :key="item.name"
        :value="item.path"
        color="primary"
        variant="text"
        @click="navigateTo(item.path)"
      >
        <v-icon :icon="item.icon" size="22" />
        <span class="nav-label">{{ item.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import NewbieGuide from './NewbieGuide.vue'

const router = useRouter()
const route = useRoute()

// 当前路由
const currentRoute = ref(route.path)

// 导航项（5 个主页面）
const navItems = [
  { name: 'home', title: '首页', icon: 'mdi-home', path: '/' },
  { name: 'map', title: '星域', icon: 'mdi-map', path: '/map' },
  { name: 'timer', title: '专注', icon: 'mdi-timer', path: '/timer' },
  { name: 'spirits', title: '背包', icon: 'mdi-backpack', path: '/spirits' },
  { name: 'profile', title: '我的', icon: 'mdi-account', path: '/profile' },
]

// 监听路由变化
watch(
  () => route.path,
  (newPath) => {
    currentRoute.value = newPath
  }
)

// 导航
const navigateTo = (path: string) => {
  if (path !== route.path) {
    router.push(path)
  }
}
</script>

<style scoped>
.main-content {
  padding-bottom: var(--nav-height);
  background: var(--bg-secondary);
  min-height: 100vh;
}

.bottom-nav {
  background: var(--bg-card);
  border-top: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

:deep(.v-btn) {
  border-radius: var(--radius-sm) !important;
  margin: 4px !important;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
}

:deep(.v-btn--active) {
  background: rgba(99, 102, 241, 0.15) !important;
}

.nav-label {
  font-size: var(--font-size-xs);
  margin-top: 4px;
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
}

:deep(.v-btn--active .nav-label) {
  color: var(--primary);
}

/* 平板/大屏优化 */
@media (min-width: 768px) {
  .main-content {
    max-width: 600px;
    margin: 0 auto;
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
  }
}
</style>
