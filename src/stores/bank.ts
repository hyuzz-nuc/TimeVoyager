/**
 * Pinia Store - 能量银行管理
 * 功能：步数兑换星能晶体、专注时间兑换
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBankStore = defineStore('bank', () => {
  // 兑换配置
  const exchangeRates = ref({
    stepsToCrystal: 1000,  // 1000 步 = 1 晶体
    focusMinutesToCrystal: 25,  // 25 分钟专注 = 1 晶体
  })
  
  // 今日数据
  const todayData = ref({
    steps: 0,           // 今日步数
    exchangedSteps: 0,  // 已兑换步数
    focusMinutes: 0,    // 今日专注时长
    exchangedMinutes: 0,// 已兑换专注时长
  })
  
  // 历史总兑换
  const totalExchanged = ref({
    crystals: 0,        // 累计获得晶体
    steps: 0,           // 累计兑换步数
    minutes: 0,         // 累计兑换专注时长
  })
  
  // 步数同步状态
  const stepsSync = ref({
    enabled: false,     // 是否启用步数同步
    lastSyncTime: 0,    // 最后同步时间
    source: '',         // 同步来源（Apple Health / Google Fit）
  })
  
  // Getters
  const availableSteps = computed(() => {
    return Math.max(0, todayData.value.steps - todayData.value.exchangedSteps)
  })
  
  const availableMinutes = computed(() => {
    return Math.max(0, todayData.value.focusMinutes - todayData.value.exchangedMinutes)
  })
  
  const stepsCrystals = computed(() => {
    return Math.floor(availableSteps.value / exchangeRates.value.stepsToCrystal)
  })
  
  const minutesCrystals = computed(() => {
    return Math.floor(availableMinutes.value / exchangeRates.value.focusMinutesToCrystal)
  })
  
  // Actions
  function loadData() {
    const today = new Date().toDateString()
    const saved = localStorage.getItem(`timevoyager_bank_${today}`)
    if (saved) {
      const data = JSON.parse(saved)
      todayData.value = data.todayData || todayData.value
      totalExchanged.value = data.totalExchanged || totalExchanged.value
      stepsSync.value = data.stepsSync || stepsSync.value
    }
  }
  
  function saveData() {
    const today = new Date().toDateString()
    const data = {
      todayData: todayData.value,
      totalExchanged: totalExchanged.value,
      stepsSync: stepsSync.value,
    }
    localStorage.setItem(`timevoyager_bank_${today}`, JSON.stringify(data))
  }
  
  // 同步步数（模拟，实际需要从健康 API 获取）
  function syncSteps(steps: number) {
    todayData.value.steps = steps
    stepsSync.value.lastSyncTime = Date.now()
    saveData()
    return steps
  }
  
  // 记录专注时长
  function addFocusMinutes(minutes: number) {
    todayData.value.focusMinutes += minutes
    saveData()
  }
  
  // 兑换步数为晶体
  function exchangeSteps(userStore: any): number {
    const available = availableSteps.value
    const crystals = Math.floor(available / exchangeRates.value.stepsToCrystal)
    
    if (crystals > 0) {
      const stepsUsed = crystals * exchangeRates.value.stepsToCrystal
      
      todayData.value.exchangedSteps += stepsUsed
      totalExchanged.value.crystals += crystals
      totalExchanged.value.steps += stepsUsed
      
      // 发放晶体
      if (userStore && userStore.addCrystals) {
        userStore.addCrystals(crystals)
      }
      
      saveData()
      return crystals
    }
    
    return 0
  }
  
  // 兑换专注时长为晶体
  function exchangeMinutes(userStore: any): number {
    const available = availableMinutes.value
    const crystals = Math.floor(available / exchangeRates.value.focusMinutesToCrystal)
    
    if (crystals > 0) {
      const minutesUsed = crystals * exchangeRates.value.focusMinutesToCrystal
      
      todayData.value.exchangedMinutes += minutesUsed
      totalExchanged.value.crystals += crystals
      totalExchanged.value.minutes += minutesUsed
      
      // 发放晶体
      if (userStore && userStore.addCrystals) {
        userStore.addCrystals(crystals)
      }
      
      saveData()
      return crystals
    }
    
    return 0
  }
  
  // 兑换全部
  function exchangeAll(userStore: any) {
    const stepCrystals = exchangeSteps(userStore)
    const minuteCrystals = exchangeMinutes(userStore)
    return stepCrystals + minuteCrystals
  }
  
  // 启用步数同步
  function enableStepsSync(source: string) {
    stepsSync.value.enabled = true
    stepsSync.value.source = source
    saveData()
  }
  
  // 禁用步数同步
  function disableStepsSync() {
    stepsSync.value.enabled = false
    saveData()
  }
  
  // 初始化
  loadData()
  
  return {
    // State
    exchangeRates,
    todayData,
    totalExchanged,
    stepsSync,
    
    // Getters
    availableSteps,
    availableMinutes,
    stepsCrystals,
    minutesCrystals,
    
    // Actions
    loadData,
    saveData,
    syncSteps,
    addFocusMinutes,
    exchangeSteps,
    exchangeMinutes,
    exchangeAll,
    enableStepsSync,
    disableStepsSync,
  }
})
