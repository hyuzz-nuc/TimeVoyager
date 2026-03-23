<template>
  <AppLayout />
</template>

<script setup>
import AppLayout from '@/components/AppLayout.vue'
</script>

<style>
/* 全局样式 */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background: var(--bg-secondary);
}
</style>
