<template>
  <div class="timer-view">
    <h1 class="title">专注计时</h1>
    <p class="subtitle">专注 25 分钟，获得星能晶体</p>
    
    <!-- 计时器显示 -->
    <div class="timer-display">
      <div class="timer-circle">
        <svg viewBox="0 0 100 100" class="timer-svg">
          <!-- 背景圆环 -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--border)"
            stroke-width="6"
          />
          <!-- 进度圆环 -->
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="var(--primary)"
            stroke-width="6"
            stroke-linecap="round"
            :stroke-dasharray="283"
            :stroke-dashoffset="strokeOffset"
            transform="rotate(-90 50 50)"
          />
        </svg>
        <div class="timer-time">{{ formattedTime }}</div>
      </div>
    </div>

    <!-- 星灵陪伴 -->
    <div class="spirit-companion">
      <v-icon icon="mdi-star" size="64" color="primary" />
      <p class="companion-text">星灵正在陪伴你专注</p>
    </div>

    <!-- 控制按钮 -->
    <div class="controls">
      <v-btn
        :color="isRunning ? 'warning' : 'primary'"
        size="x-large"
        rounded="xl"
        class="control-btn"
        @click="toggleTimer"
      >
        <v-icon :icon="isRunning ? 'mdi-pause' : 'mdi-play'" class="mr-2" />
        {{ isRunning ? '暂停' : '开始' }}
      </v-btn>
      
      <v-btn
        color="secondary"
        size="x-large"
        rounded="xl"
        variant="outlined"
        class="control-btn"
        @click="resetTimer"
      >
        <v-icon icon="mdi-refresh" class="mr-2" />
        重置
      </v-btn>
    </div>

    <!-- 今日统计 -->
    <v-card class="stats-card" elevation="2">
      <v-card-text>
        <div class="stats-row">
          <div class="stat">
            <div class="stat-value">{{ todaySessions }}</div>
            <div class="stat-label">今日专注</div>
          </div>
          <div class="stat-divider" />
          <div class="stat">
            <div class="stat-value">{{ todayCrystals }}</div>
            <div class="stat-label">获得晶体</div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, onUnmounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useTimerStore } from '@/stores/timer'

const userStore = useUserStore()
const timerStore = useTimerStore()

// 使用 Store 的状态
const isRunning = computed(() => timerStore.isRunning)
const timeLeft = computed(() => timerStore.timeLeft)
const formattedTime = computed(() => timerStore.formattedTime)
const progress = computed(() => timerStore.progress)
const todaySessions = computed(() => timerStore.todayStats.sessions)
const todayCrystals = computed(() => timerStore.todayStats.crystals)

// 计算圆环进度
const circumference = 2 * Math.PI * 45
const strokeOffset = computed(() => {
  return circumference - (progress.value / 100) * circumference
})

// 计时器控制
const toggleTimer = () => {
  if (isRunning.value) {
    timerStore.pauseTimer()
  } else {
    timerStore.startTimer()
  }
}

const resetTimer = () => {
  timerStore.resetTimer()
}

// 清理
onUnmounted(() => {
  timerStore.pauseTimer()
})
</script>

<style scoped>
.timer-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
  text-align: center;
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xl);
}

.timer-display {
  margin: var(--spacing-xl) 0;
}

.timer-circle {
  position: relative;
  width: 280px;
  height: 280px;
  margin: 0 auto;
  border: 2px solid var(--primary);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  box-shadow: var(--shadow-md);
}

.timer-svg {
  position: absolute;
  width: 100%;
  height: 100%;
}

.timer-time {
  position: relative;
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.spirit-companion {
  margin: var(--spacing-lg) 0;
}

.companion-text {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.controls {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  margin: var(--spacing-xl) 0;
}

.control-btn {
  min-width: 100px;
  height: var(--btn-height-lg);
  border-radius: var(--radius) !important;
}

.stats-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
}
</style>
