<template>
  <div class="empty-state">
    <!-- 图标/插图 -->
    <div class="empty-icon">
      <v-icon :icon="icon" :size="iconSize" :color="iconColor" />
    </div>
    
    <!-- 标题 -->
    <h3 class="empty-title">{{ title }}</h3>
    
    <!-- 描述 -->
    <p class="empty-description">{{ description }}</p>
    
    <!-- 操作按钮（可选） -->
    <div v-if="actionText" class="empty-action">
      <v-btn
        :color="actionColor"
        variant="elevated"
        rounded="xl"
        @click="$emit('action')"
      >
        {{ actionText }}
      </v-btn>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: {
    type: String,
    default: 'mdi-inbox'
  },
  iconSize: {
    type: [Number, String],
    default: 64
  },
  iconColor: {
    type: String,
    default: 'grey'
  },
  title: {
    type: String,
    default: '空空如也'
  },
  description: {
    type: String,
    default: '这里还没有内容哦'
  },
  actionText: {
    type: String,
    default: ''
  },
  actionColor: {
    type: String,
    default: 'primary'
  }
})

defineEmits(['action'])
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  text-align: center;
  min-height: 200px;
}

.empty-icon {
  margin-bottom: var(--spacing-md);
  opacity: 0.5;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.empty-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-md);
  line-height: 1.6;
}

.empty-action {
  margin-top: var(--spacing-sm);
}
</style>
