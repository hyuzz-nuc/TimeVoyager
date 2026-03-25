/**
 * Pinia Store - 体力系统管理
 * 体力随时间恢复，用于探索地图
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useEnergyStore = defineStore('energy', () => {
  // 体力配置
  const MAX_ENERGY = 100           // 最大体力
  const RECOVER_INTERVAL = 5 * 60 * 1000  // 每 5 分钟恢复 1 点
  const RECOVER_AMOUNT = 1         // 每次恢复量
  
  // 体力状态
  const energy = ref(MAX_ENERGY)
  const lastRecoverTime = ref(Date.now())
  
  // Getters
  const currentEnergy = computed(() => {
    // 计算应该恢复的体力
    const now = Date.now()
    const elapsed = now - lastRecoverTime.value
    const recoverCount = Math.floor(elapsed / RECOVER_INTERVAL)
    
    if (recoverCount > 0) {
      const recovered = Math.min(recoverCount * RECOVER_AMOUNT, MAX_ENERGY - energy.value)
      return energy.value + recovered
    }
    
    return energy.value
  })
  
  const energyPercent = computed(() => {
    return Math.floor((currentEnergy.value / MAX_ENERGY) * 100)
  })
  
  const timeToFull = computed(() => {
    const missing = MAX_ENERGY - currentEnergy.value
    if (missing <= 0) return '已满'
    
    const minutes = Math.ceil(missing * (RECOVER_INTERVAL / 1000 / 60))
    return `${minutes}分钟`
  })
  
  // Actions
  function initEnergy() {
    const saved = localStorage.getItem('timevoyager_energy')
    if (saved) {
      const data = JSON.parse(saved)
      energy.value = data.energy || MAX_ENERGY
      lastRecoverTime.value = data.lastRecoverTime || Date.now()
    }
    // 初始化时恢复一次
    recoverEnergy()
  }
  
  function saveEnergy() {
    const data = {
      energy: energy.value,
      lastRecoverTime: lastRecoverTime.value,
    }
    localStorage.setItem('timevoyager_energy', JSON.stringify(data))
  }
  
  // 恢复体力（随时间）
  function recoverEnergy() {
    const now = Date.now()
    const elapsed = now - lastRecoverTime.value
    const recoverCount = Math.floor(elapsed / RECOVER_INTERVAL)
    
    if (recoverCount > 0) {
      const recovered = Math.min(recoverCount * RECOVER_AMOUNT, MAX_ENERGY - energy.value)
      energy.value += recovered
      lastRecoverTime.value = now
      saveEnergy()
    }
  }
  
  // 消耗体力
  function consumeEnergy(amount: number): boolean {
    // 先恢复再消耗
    recoverEnergy()
    
    if (currentEnergy.value >= amount) {
      energy.value -= amount
      saveEnergy()
      return true
    }
    return false
  }
  
  // 购买体力（待实现）
  function buyEnergy(amount: number, cost: number) {
    // 可以用星能晶体购买体力
    // TODO: 调用 authStore.spendCrystals
  }
  
  // 初始化
  initEnergy()
  
  return {
    // Config
    MAX_ENERGY,
    
    // State
    energy,
    lastRecoverTime,
    
    // Getters
    currentEnergy,
    energyPercent,
    timeToFull,
    
    // Actions
    initEnergy,
    saveEnergy,
    recoverEnergy,
    consumeEnergy,
    buyEnergy,
  }
})
