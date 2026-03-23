<template>
  <div class="focus-view">
    <div class="app-container">
      <!-- 页面标题 -->
      <h1 class="page-title pixel-font">⏱️ 专注计时</h1>

      <!-- 像素宠物陪伴 -->
      <div class="spirit-companion">
        <div class="spirit-avatar pixel-font animate-pulse">
          <v-icon size="80" color="primary">mdi-star-four-points</v-icon>
        </div>
        <div class="spirit-status pixel-font">
          <div class="spirit-name">时光灵体</div>
          <div class="spirit-level">Lv.{{ store.state.spirit.level }}</div>
        </div>
      </div>

      <!-- 计时器显示 -->
      <div class="timer-container pixel-card">
        <div class="timer-display pixel-font">
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
            class="control-btn pixel-font"
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
            class="control-btn pixel-font"
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
            class="control-btn pixel-font"
          >
            <v-icon start>mdi-play</v-icon>
            继续
          </v-btn>

          <v-btn
            v-if="isRunning || isPaused"
            color="error"
            size="x-large"
            variant="outlined"
            @click="resetTimer"
            class="control-btn pixel-font"
          >
            <v-icon start>mdi-stop</v-icon>
            停止
          </v-btn>
        </div>

        <!-- 时长选择 -->
        <div class="duration-selector" v-if="!isRunning && !isPaused">
          <div class="selector-title pixel-font">选择专注时长</div>
          <div class="duration-options">
            <v-btn
              v-for="opt in durationOptions"
              :key="opt.minutes"
              :color="selectedDuration === opt.minutes ? 'primary' : 'default'"
              variant="tonal"
              rounded="xl"
              @click="selectedDuration = opt.minutes"
              class="duration-btn pixel-font"
            >
              {{ opt.label }}
            </v-btn>
          </div>
        </div>
      </div>

      <!-- 今日统计 -->
      <div class="stats-section">
        <div class="stats-card pixel-card">
          <div class="stats-header">
            <v-icon color="primary" start>mdi-timer-outline</v-icon>
            <span class="stats-title pixel-font">今日专注</span>
          </div>
          <div class="stats-content">
            <div class="stat-item">
              <div class="stat-value pixel-font">{{ store.state.focus.todayMinutes }}</div>
              <div class="stat-label">分钟</div>
            </div>
            <div class="stat-item">
              <div class="stat-value pixel-font" style="color: var(--primary)">+{{ sessionEarned }}</div>
              <div class="stat-label">时光精粹</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 专注提示 -->
      <div class="focus-tip pixel-card">
        <v-alert
          type="info"
          variant="tonal"
          color="primary"
          border="start"
          class="tip-alert"
        >
          <template v-slot:title>
            <div class="tip-title pixel-font">💡 专注小贴士</div>
          </template>
          <div class="tip-content">
            • 专注时间越长，获得的精粹越多<br>
            • 每专注 1 分钟 = 1 个精粹 + 10 点经验<br>
            • 让你的时光灵体陪你一起成长！
          </div>
        </v-alert>
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
  
  // 提示
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
  background: var(--bg);
}

.app-container {
  max-width: 480px;
  margin: 0 auto;
  padding-bottom: 100px;
}

/* 像素宠物陪伴 */
.spirit-companion {
  text-align: center;
  padding: 20px;
  margin-bottom: 10px;
}

.spirit-avatar {
  width: 100px;
  height: 100px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(124, 115, 230, 0.2) 0%, rgba(170, 59, 255, 0.1) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 3px solid var(--border);
}

.spirit-status {
  margin-top: 8px;
}

.spirit-name {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-dark);
}

.spirit-level {
  font-size: 14px;
  color: var(--primary);
  margin-top: 4px;
}

/* 计时器容器 */
.timer-container {
  margin: 20px;
  padding: 30px 20px;
  text-align: center;
}

.timer-display {
  margin-bottom: 30px;
}

.time-text {
  font-size: 64px;
  font-weight: 700;
  color: var(--primary);
  font-family: 'Courier New', monospace;
  letter-spacing: 2px;
  margin-bottom: 8px;
}

.status-text {
  font-size: 16px;
  color: var(--text-light);
  letter-spacing: 1px;
}

/* 控制按钮 */
.controls {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.control-btn {
  min-width: 120px;
  font-weight: 600;
}

/* 时长选择 */
.duration-selector {
  margin-top: 20px;
}

.selector-title {
  font-size: 14px;
  color: var(--text-light);
  margin-bottom: 12px;
}

.duration-options {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.duration-btn {
  min-width: 90px;
}

/* 统计区域 */
.stats-section {
  padding: 0 20px;
}

.stats-card {
  padding: 20px;
}

.stats-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.stats-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-dark);
  margin-left: 8px;
}

.stats-content {
  display: flex;
  justify-content: space-around;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: var(--text-dark);
}

.stat-label {
  font-size: 14px;
  color: var(--text-light);
  margin-top: 4px;
}

/* 专注提示 */
.focus-tip {
  margin: 20px;
  padding: 0;
}

.tip-alert {
  border-radius: 12px;
}

.tip-title {
  font-weight: 600;
  color: var(--text-dark);
}

.tip-content {
  font-size: 14px;
  color: var(--text);
  line-height: 1.6;
}
</style>
