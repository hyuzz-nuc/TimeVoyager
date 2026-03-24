<template>
  <v-overlay
    v-model="isVisible"
    class="newbie-guide-overlay"
    persistent
    z-index="9999"
  >
    <div class="guide-container">
      <!-- 进度指示器 -->
      <div class="guide-progress">
        <v-progress-linear
          :model-value="progress"
          color="primary"
          height="4"
          rounded
        />
        <span class="guide-step-text">{{ currentStep + 1 }} / {{ steps.length }}</span>
      </div>

      <!-- 引导内容卡片 -->
      <v-card class="guide-card" elevation="8">
        <v-card-text class="guide-content">
          <!-- 图标/插图 -->
          <div class="guide-icon">
            <v-icon :icon="currentStepData.icon" size="64" color="primary" />
          </div>

          <!-- 标题 -->
          <h3 class="guide-title">{{ currentStepData.title }}</h3>

          <!-- 描述 -->
          <p class="guide-description">{{ currentStepData.description }}</p>

          <!-- 高亮区域提示（可选） -->
          <div v-if="currentStepData.highlight" class="guide-highlight">
            <v-icon icon="mdi-arrow-up" size="20" class="mr-2" />
            <span>点击这里试试 →</span>
          </div>
        </v-card-text>

        <!-- 底部按钮 -->
        <v-card-actions class="guide-actions">
          <v-btn
            v-if="currentStep > 0"
            variant="text"
            color="grey"
            @click="prevStep"
          >
            上一步
          </v-btn>
          <v-spacer />
          <v-btn
            variant="text"
            color="grey"
            @click="skipGuide"
          >
            跳过
          </v-btn>
          <v-btn
            color="primary"
            variant="elevated"
            @click="nextStep"
          >
            {{ currentStep === steps.length - 1 ? '开始探索' : '下一步' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </div>
  </v-overlay>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 引导步骤数据
const steps = [
  {
    icon: 'mdi-rocket-launch',
    title: '欢迎来到 TimeVoyager！🎉',
    description: '这是一款结合时间管理与星域探索的 PWA 应用。在这里，你的每一分钟专注都能转化为探索星域的能量！'
  },
  {
    icon: 'mdi-map-marker',
    title: '探索星域地图',
    description: '点击底部「星域」标签，进入 10×10 的星域地图。每次探索都能发现新的星灵和奖励！',
    highlight: { target: '.nav-star-domain' }
  },
  {
    icon: 'mdi-account-group',
    title: '收集你的星灵',
    description: '在「背包」中查看你收集的所有星灵。它们会随着你的专注时间不断进化，从星灵之种成长为星域形态！',
    highlight: { target: '.nav-backpack' }
  },
  {
    icon: 'mdi-timer-sand',
    title: '专注计时器',
    description: '点击「专注」开始番茄钟。每完成一次专注，都能获得星能晶体奖励，还能推进星灵进化！',
    highlight: { target: '.nav-timer' }
  },
  {
    icon: 'mdi-gift',
    title: '完成任务领奖励',
    description: '在首页查看每日任务和成就。完成任务获得额外奖励，解锁更多功能和星灵！',
    highlight: { target: '.nav-home' }
  }
]

const isVisible = ref(false)
const currentStep = ref(0)

const currentStepData = computed(() => steps[currentStep.value])

const progress = computed(() => {
  return ((currentStep.value + 1) / steps.length) * 100
})

// 下一步
const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    // 完成引导
    finishGuide()
  }
}

// 上一步
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

// 跳过引导
const skipGuide = () => {
  finishGuide()
}

// 完成引导
const finishGuide = () => {
  isVisible.value = false
  authStore.completeNewbieGuide()
}

// 检查是否需要显示引导
onMounted(() => {
  if (!authStore.userState.hasCompletedGuide) {
    // 延迟一点显示，等页面加载完成
    setTimeout(() => {
      isVisible.value = true
    }, 500)
  }
})
</script>

<style scoped>
.newbie-guide-overlay {
  background: rgba(0, 0, 0, 0.7) !important;
}

.guide-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90%;
  max-width: 400px;
}

.guide-progress {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.guide-step-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  white-space: nowrap;
}

.guide-card {
  border-radius: 16px !important;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
}

.guide-content {
  text-align: center;
  padding: 24px !important;
}

.guide-icon {
  margin-bottom: 16px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.guide-title {
  font-size: 20px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 12px;
}

.guide-description {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.6;
  margin-bottom: 16px;
}

.guide-highlight {
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 8px 16px;
  border-radius: 20px;
  color: #4FC3F7;
  font-size: 13px;
}

.guide-actions {
  padding: 16px 24px !important;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}
</style>
