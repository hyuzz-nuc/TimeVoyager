/**
 * Pinia Store - 用户状态管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
  // State
  const userId = ref<string | null>(null)
  const username = ref<string>('时光旅行者')
  const avatar = ref<string>('')
  const level = ref<number>(1)
  const exp = ref<number>(0)
  const maxExp = ref<number>(100)
  
  // 货币
  const crystals = ref<number>(0)        // 星能晶体
  const coins = ref<number>(0)           // 金币
  
  // 统计
  const stats = ref({
    totalFocusTime: 0,      // 总专注时长（分钟）
    totalSessions: 0,       // 总专注次数
    totalSteps: 0,          // 总步数
    totalBattles: 0,        // 总对战次数
    totalWins: 0,           // 总胜利次数
    spiritsCollected: 0,    // 收集星灵数量
    achievementsUnlocked: 0,// 解锁成就数量
  })
  
  // 设置
  const settings = ref({
    notifications: true,
    sound: true,
    darkMode: false,
    dailyReminder: true,
    reminderTime: '09:00',
  })
  
  // Getters
  const expProgress = computed(() => {
    return Math.min((exp.value / maxExp.value) * 100, 100)
  })
  
  const levelTitle = computed(() => {
    if (level.value < 10) return '新手旅行者'
    if (level.value < 30) return '资深旅行者'
    if (level.value < 50) return '星域探索者'
    if (level.value < 80) return '星际领航员'
    return '时光主宰'
  })
  
  // Actions
  function initUser(id: string) {
    userId.value = id
    // 从本地存储加载数据
    loadUserData()
  }
  
  function loadUserData() {
    const saved = localStorage.getItem('timevoyager_user')
    if (saved) {
      const data = JSON.parse(saved)
      userId.value = data.userId
      username.value = data.username
      avatar.value = data.avatar
      level.value = data.level
      exp.value = data.exp
      crystals.value = data.crystals
      coins.value = data.coins
      stats.value = data.stats || stats.value
      settings.value = data.settings || settings.value
    }
  }
  
  function saveUserData() {
    const data = {
      userId: userId.value,
      username: username.value,
      avatar: avatar.value,
      level: level.value,
      exp: exp.value,
      crystals: crystals.value,
      coins: coins.value,
      stats: stats.value,
      settings: settings.value,
    }
    localStorage.setItem('timevoyager_user', JSON.stringify(data))
  }
  
  function addExp(amount: number) {
    exp.value += amount
    // 升级检测
    while (exp.value >= maxExp.value) {
      exp.value -= maxExp.value
      level.value++
      maxExp.value = Math.floor(maxExp.value * 1.2)
      // 升级奖励
      crystals.value += 10
    }
    saveUserData()
  }
  
  function addCrystals(amount: number) {
    crystals.value += amount
    saveUserData()
  }
  
  function spendCrystals(amount: number): boolean {
    if (crystals.value >= amount) {
      crystals.value -= amount
      saveUserData()
      return true
    }
    return false
  }
  
  function updateStats(key: keyof typeof stats.value, value: number) {
    if (stats.value[key] !== undefined) {
      stats.value[key] += value
      saveUserData()
    }
  }
  
  function updateSettings(newSettings: Partial<typeof settings.value>) {
    settings.value = { ...settings.value, ...newSettings }
    saveUserData()
  }
  
  return {
    // State
    userId,
    username,
    avatar,
    level,
    exp,
    maxExp,
    crystals,
    coins,
    stats,
    settings,
    
    // Getters
    expProgress,
    levelTitle,
    
    // Actions
    initUser,
    loadUserData,
    saveUserData,
    addExp,
    addCrystals,
    spendCrystals,
    updateStats,
    updateSettings,
  }
})
