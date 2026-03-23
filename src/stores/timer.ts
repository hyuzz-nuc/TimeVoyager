/**
 * Pinia Store - 专注计时器管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTimerStore = defineStore('timer', () => {
  // 计时器状态
  const isRunning = ref(false)
  const timeLeft = ref(25 * 60) // 25 分钟（秒）
  const currentSession = ref(0) // 当前第几次专注
  const timerInterval = ref<number | null>(null)
  
  // 今日统计
  const todayStats = ref({
    sessions: 0,       // 今日专注次数
    totalMinutes: 0,   // 今日总专注时长
    crystals: 0,       // 今日获得晶体
  })
  
  // 设置
  const settings = ref({
    focusDuration: 25,    // 专注时长（分钟）
    breakDuration: 5,     // 休息时长（分钟）
    autoStart: false,     // 自动开始下一轮
    sound: true,          // 音效
  })
  
  // Getters
  const formattedTime = computed(() => {
    const minutes = Math.floor(timeLeft.value / 60)
    const seconds = timeLeft.value % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  })
  
  const progress = computed(() => {
    const totalSeconds = settings.value.focusDuration * 60
    return ((totalSeconds - timeLeft.value) / totalSeconds) * 100
  })
  
  const isBreak = computed(() => {
    return currentSession.value % 2 === 1
  })
  
  // Actions
  function loadTodayStats() {
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`timevoyager_timer_${today}`)
    if (saved) {
      todayStats.value = JSON.parse(saved)
    }
  }
  
  function saveTodayStats() {
    const today = new Date().toDateString()
    localStorage.setItem(`timevoyager_timer_${today}`, JSON.stringify(todayStats.value))
  }
  
  function startTimer() {
    if (isRunning.value) return
    
    isRunning.value = true
    timerInterval.value = window.setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--
      } else {
        completeSession()
      }
    }, 1000)
  }
  
  function pauseTimer() {
    isRunning.value = false
    if (timerInterval.value) {
      clearInterval(timerInterval.value)
      timerInterval.value = null
    }
  }
  
  function resetTimer() {
    pauseTimer()
    timeLeft.value = settings.value.focusDuration * 60
  }
  
  function completeSession() {
    pauseTimer()
    
    if (!isBreak.value) {
      // 专注完成
      todayStats.value.sessions++
      todayStats.value.totalMinutes += settings.value.focusDuration
      todayStats.value.crystals += 1
      currentSession.value++
      
      // 奖励晶体
      // TODO: 调用 userStore.addCrystals(1)
    }
    
    saveTodayStats()
    
    // 自动开始休息或下一轮
    if (settings.value.autoStart) {
      setTimeout(() => {
        startBreakOrNext()
      }, 1000)
    }
  }
  
  function startBreakOrNext() {
    if (isBreak.value) {
      // 休息结束，开始下一轮专注
      timeLeft.value = settings.value.focusDuration * 60
    } else {
      // 开始休息
      timeLeft.value = settings.value.breakDuration * 60
    }
    
    if (settings.value.autoStart) {
      startTimer()
    }
  }
  
  function updateSettings(newSettings: Partial<typeof settings.value>) {
    settings.value = { ...settings.value, ...newSettings }
  }
  
  // 初始化
  loadTodayStats()
  
  return {
    // State
    isRunning,
    timeLeft,
    currentSession,
    todayStats,
    settings,
    
    // Getters
    formattedTime,
    progress,
    isBreak,
    
    // Actions
    startTimer,
    pauseTimer,
    resetTimer,
    completeSession,
    startBreakOrNext,
    updateSettings,
  }
})
