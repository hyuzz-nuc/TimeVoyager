<template>
  <div class="loading-state">
    <!-- 加载动画 -->
    <div class="loading-animation">
      <div class="loading-spinner"></div>
      <div class="loading-spinner delay-1"></div>
      <div class="loading-spinner delay-2"></div>
    </div>
    
    <!-- 加载文字 -->
    <p class="loading-text">{{ text }}</p>
    
    <!-- 进度条（可选） -->
    <v-progress-linear
      v-if="showProgress"
      :model-value="progress"
      color="primary"
      height="4"
      rounded
      class="mt-4"
    />
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    default: '加载中...'
  },
  showProgress: {
    type: Boolean,
    default: false
  },
  progress: {
    type: Number,
    default: 0
  }
})
</script>

<style scoped>
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
}

.loading-animation {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.loading-spinner {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--primary);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-spinner.delay-1 {
  animation-delay: -0.32s;
}

.loading-spinner.delay-2 {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.loading-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}
</style>
