<template>
  <v-app class="time-voyager-app">
    <v-main>
      <router-view />
    </v-main>

    <!-- 底部导航栏 -->
    <v-bottom-navigation
      v-model="currentRoute"
      color="primary"
      class="bottom-nav"
    >
      <v-btn
        v-for="route in routes"
        :key="route.name"
        :value="route.path"
        @click="$router.push(route.path)"
      >
        <v-icon>{{ route.meta.icon }}</v-icon>
        <span>{{ route.meta.title }}</span>
      </v-btn>
    </v-bottom-navigation>
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()

const routes = [
  { path: '/', name: 'Focus', meta: { title: '专注', icon: 'mdi-timer-outline' } },
  { path: '/spirit', name: 'Spirit', meta: { title: '灵体', icon: 'mdi-star-four-points' } },
  { path: '/explore', name: 'Explore', meta: { title: '探索', icon: 'mdi-rocket-launch' } },
  { path: '/achievements', name: 'Achievements', meta: { title: '成就', icon: 'mdi-trophy' } }
]

const currentRoute = computed({
  get: () => route.path,
  set: (value) => value
})
</script>

<style>
.time-voyager-app {
  background: #0f172a;
}

.bottom-nav {
  background: rgba(15, 23, 42, 0.95);
  border-top: 1px solid rgba(124, 115, 230, 0.3);
  padding-bottom: env(safe-area-inset-bottom);
}

.v-btn--variant-text {
  opacity: 1;
}

.v-btn--variant-text .v-icon {
  opacity: 0.5;
}

.v-btn--variant-text.v-btn--active .v-icon {
  opacity: 1;
}
</style>
