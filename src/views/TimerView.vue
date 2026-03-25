<template>
  <div class="timer-view">
    <h1 class="title">专注计时</h1>
    <p class="subtitle">专注 25 分钟，休息 5 分钟</p>
    
    <!-- 计时器显示 -->
    <div class="timer-display">
      <div class="timer-circle">
        <svg viewBox="0 0 100 100" class="timer-svg">
          <!-- 背景圆环 -->
          <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" stroke-width="8" />
          <!-- 进度圆环 -->
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke="var(--primary)" 
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="283"
            :stroke-dashoffset="strokeOffset"
            transform="rotate(-90 50 50)"
            class="progress-ring"
          />
        </svg>
        <div class="timer-time">{{ formatTime(remainingTime) }}</div>
        <div class="timer-status">{{ timerStatus }}</div>
      </div>
    </div>

    <!-- 控制按钮 -->
    <div class="timer-controls">
      <v-btn
        v-if="!isRunning"
        color="primary"
        size="x-large"
        rounded="xl"
        @click="startTimer"
      >
        <v-icon icon="mdi-play" class="mr-2" />
        开始专注
      </v-btn>
      <v-btn
        v-else
        color="secondary"
        size="x-large"
        rounded="xl"
        variant="outlined"
        @click="pauseTimer"
      >
        <v-icon icon="mdi-pause" class="mr-2" />
        暂停
      </v-btn>
      <v-btn
        color="error"
        size="large"
        rounded="xl"
        variant="text"
        @click="resetTimer"
      >
        <v-icon icon="mdi-refresh" class="mr-2" />
        重置
      </v-btn>
    </div>

    <!-- 专注统计 -->
    <v-card class="stats-card" elevation="2">
      <v-card-text>
        <div class="stats-grid">
          <div class="stat-item">
            <v-icon icon="mdi-calendar-check" color="primary" size="32" />
            <div class="stat-value">{{ todaySessions }}</div>
            <div class="stat-label">今日专注</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <v-icon icon="mdi-clock-outline" color="accent" size="32" />
            <div class="stat-value">{{ todayMinutes }}</div>
            <div class="stat-label">分钟</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <v-icon icon="mdi-fire" color="error" size="32" />
            <div class="stat-value">{{ streak }}</div>
            <div class="stat-label">连续天数</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 设置选项 -->
    <v-card class="settings-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-cog" class="mr-2" />
        专注设置
      </v-card-title>
      <v-card-text>
        <div class="setting-item">
          <span class="setting-label">专注时长</span>
          <v-chip-group v-model="workDuration" mandatory>
            <v-chip :value="15">15 分钟</v-chip>
            <v-chip :value="25">25 分钟</v-chip>
            <v-chip :value="45">45 分钟</v-chip>
          </v-chip-group>
        </div>
        <div class="setting-item">
          <span class="setting-label">休息时长</span>
          <v-chip-group v-model="breakDuration" mandatory>
            <v-chip :value="5">5 分钟</v-chip>
            <v-chip :value="10">10 分钟</v-chip>
            <v-chip :value="15">15 分钟</v-chip>
          </v-chip-group>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// 计时器状态
const isRunning = ref(false)
const remainingTime = ref(25 * 60) // 25 分钟
const timerStatus = ref('准备专注')
const workDuration = ref(25)
const breakDuration = ref(5)

// 统计数据
const todaySessions = ref(0)
const todayMinutes = ref(0)
const streak = ref(0)

// 计算圆环进度
const strokeOffset = computed(() => {
  const circumference = 2 * Math.PI * 45
  const progress = remainingTime.value / (workDuration.value * 60)
  return circumference * (1 - progress)
})

// 格式化时间
const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// 计时器
let timerInterval: number | null = null

const startTimer = () => {
  if (isRunning.value) return
  
  isRunning.value = true
  timerStatus.value = '专注中...'
  
  timerInterval = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      completeSession()
    }
  }, 1000)
}

const pauseTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  isRunning.value = false
  timerStatus.value = '已暂停'
}

const resetTimer = () => {
  pauseTimer()
  remainingTime.value = workDuration.value * 60
  timerStatus.value = '准备专注'
}

const completeSession = () => {
  pauseTimer()
  todaySessions.value++
  todayMinutes.value += workDuration.value
  authStore.addEssence(10) // 奖励时光精粹
  authStore.addExp(20) // 奖励经验值
  
  timerStatus.value = '专注完成！休息一下吧～'
  
  // 播放提示音（可选）
  // const audio = new Audio('/sounds/complete.mp3')
  // audio.play()
}

// 加载统计数据
onMounted(() => {
  const today = new Date().toDateString()
  const saved = localStorage.getItem(`timevoyager_timer_${today}`)
  if (saved) {
    const data = JSON.parse(saved)
    todaySessions.value = data.sessions || 0
    todayMinutes.value = data.minutes || 0
    streak.value = data.streak || 0
  }
  remainingTime.value = workDuration.value * 60
})

// 保存统计数据
onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
  const today = new Date().toDateString()
  localStorage.setItem(`timevoyager_timer_${today}`, JSON.stringify({
    sessions: todaySessions.value,
    minutes: todayMinutes.value,
    streak: streak.value,
  }))
})

// 监听专注时长变化
const updateDuration = () => {
  if (!isRunning.value) {
    remainingTime.value = workDuration.value * 60
  }
}
</script>

<style scoped>
.timer-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.timer-display {
  display: flex;
  justify-content: center;
  margin: var(--spacing-xl) 0;
}

.timer-circle {
  position: relative;
  width: 280px;
  height: 280px;
}

.timer-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.progress-ring {
  transition: stroke-dashoffset 1s linear;
}

.timer-time {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 48px;
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.timer-status {
  position: absolute;
  top: 65%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--font-size-base);
  color: var(--text-secondary);
}

.timer-controls {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  align-items: center;
  margin: var(--spacing-lg) 0;
}

.stats-card {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-top: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: var(--border);
}

.settings-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) !important;
  padding-bottom: var(--spacing-sm) !important;
}

.setting-item {
  margin-bottom: var(--spacing-md);
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-label {
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}
</style>
