<template>
  <div class="focus-view">
    <div class="timer-container">
      <!-- 计时器显示 -->
      <div class="timer-display">
        <div class="time-text">{{ formattedTime }}</div>
        <div class="status-text">{{ statusText }}</div>
      </div>

      <!-- 控制按钮 -->
      <div class="controls">
        <v-btn
          v-if="!isRunning && !isPaused"
          color="primary"
          size="x-large"
          rounded="xl"
          @click="startTimer"
          class="control-btn"
        >
          <v-icon start>mdi-play</v-icon>
          开始专注
        </v-btn>

        <v-btn
          v-if="isRunning"
          color="warning"
          size="x-large"
          rounded="xl"
          @click="pauseTimer"
          class="control-btn"
        >
          <v-icon start>mdi-pause</v-icon>
          暂停
        </v-btn>

        <v-btn
          v-if="isPaused"
          color="primary"
          size="x-large"
          rounded="xl"
          @click="resumeTimer"
          class="control-btn"
        >
          <v-icon start>mdi-play</v-icon>
          继续
        </v-btn>

        <v-btn
          v-if="isRunning || isPaused"
          color="error"
          size="x-large"
          rounded="xl"
          variant="outlined"
          @click="resetTimer"
          class="control-btn"
        >
          <v-icon start>mdi-stop</v-icon>
          停止
        </v-btn>
      </div>

      <!-- 时长选择 -->
      <div class="duration-selector" v-if="!isRunning && !isPaused">
        <div class="selector-title">选择专注时长</div>
        <div class="duration-options">
          <v-btn
            v-for="opt in durationOptions"
            :key="opt.minutes"
            :color="selectedDuration === opt.minutes ? 'primary' : 'surface'"
            variant="tonal"
            rounded="xl"
            @click="selectedDuration = opt.minutes"
            class="duration-btn"
          >
            {{ opt.label }}
          </v-btn>
        </div>
      </div>

      <!-- 今日统计 -->
      <div class="stats-card">
        <v-card class="stats-inner" color="surface" variant="tonal">
          <v-card-title class="stats-title">今日专注</v-card-title>
          <v-card-text class="stats-content">
            <div class="stat-item">
              <v-icon color="primary" class="stat-icon">mdi-timer-outline</v-icon>
              <div class="stat-value">{{ store.state.focus.todayMinutes }}</div>
              <div class="stat-label">分钟</div>
            </div>
            <div class="stat-item">
              <v-icon color="accent" class="stat-icon">mdi-star-four-points</v-icon>
              <div class="stat-value">+{{ sessionEarned }}</div>
              <div class="stat-label">时光精粹</div>
            </div>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { useStore } from '@/stores/timeStore'

const store = useStore()

// 计时器状态
const isRunning = ref(false)
const isPaused = ref(false)
const remainingSeconds = ref(25 * 60)
const selectedDuration = ref(25)
let timerInterval = null

// 本会话获得的精粹
const sessionEarned = computed(() => {
  const completed = (selectedDuration.value * 60 - remainingSeconds.value) / 60
  return Math.floor(completed)
})

// 时长选项
const durationOptions = [
  { minutes: 15, label: '15 分钟' },
  { minutes: 25, label: '25 分钟' },
  { minutes: 45, label: '45 分钟' },
  { minutes: 60, label: '60 分钟' }
]

// 格式化时间
const formattedTime = computed(() => {
  const mins = Math.floor(remainingSeconds.value / 60)
  const secs = remainingSeconds.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// 状态文本
const statusText = computed(() => {
  if (isRunning.value) return '专注中...'
  if (isPaused.value) return '已暂停'
  return '准备开始'
})

// 开始计时
const startTimer = () => {
  remainingSeconds.value = selectedDuration.value * 60
  isRunning.value = true
  isPaused.value = false
  
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      completeSession()
    }
  }, 1000)
}

// 暂停计时
const pauseTimer = () => {
  isRunning.value = false
  isPaused.value = true
  clearInterval(timerInterval)
}

// 继续计时
const resumeTimer = () => {
  isRunning.value = true
  isPaused.value = false
  
  timerInterval = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    } else {
      completeSession()
    }
  }, 1000)
}

// 停止计时
const resetTimer = () => {
  isRunning.value = false
  isPaused.value = false
  remainingSeconds.value = selectedDuration.value * 60
  clearInterval(timerInterval)
}

// 完成专注
const completeSession = () => {
  clearInterval(timerInterval)
  isRunning.value = false
  isPaused.value = false
  
  // 记录专注时间
  store.addFocusTime(selectedDuration.value)
  
  // 提示音（可选）
  // new Audio('/completion-sound.mp3').play().catch(() => {})
  
  alert(`✨ 专注完成！获得 ${selectedDuration.value} 个时光精粹`)
  remainingSeconds.value = selectedDuration.value * 60
}

// 清理定时器
onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval)
})
</script>

<style scoped>
.focus-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  padding: 20px;
}

.timer-container {
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.timer-display {
  margin-bottom: 40px;
}

.time-text {
  font-size: 96px;
  font-weight: 700;
  color: #e2e8f0;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 30px rgba(124, 115, 230, 0.5);
  margin-bottom: 10px;
}

.status-text {
  font-size: 20px;
  color: #90caf9;
  letter-spacing: 2px;
}

.controls {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 40px;
}

.control-btn {
  min-width: 140px;
  font-weight: 600;
  letter-spacing: 1px;
}

.duration-selector {
  margin-bottom: 40px;
}

.selector-title {
  color: #94a3b8;
  margin-bottom: 16px;
  font-size: 16px;
}

.duration-options {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.duration-btn {
  min-width: 100px;
}

.stats-card {
  margin-top: 20px;
}

.stats-inner {
  border: 1px solid rgba(124, 115, 230, 0.3);
}

.stats-title {
  font-size: 16px;
  color: #94a3b8;
  padding-bottom: 8px;
}

.stats-content {
  display: flex;
  justify-content: space-around;
  padding: 16px 0;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-icon {
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #e2e8f0;
}

.stat-label {
  font-size: 14px;
  color: #64748b;
  margin-top: 4px;
}
</style>
