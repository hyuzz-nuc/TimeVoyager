/**
 * Pinia Store - 用户系统管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 用户状态
  const isLoggedIn = ref(false)
  const user = ref({
    id: '',
    nickname: '时光旅行者',
    level: 1,
    essence: 0,      // 时光精粹（免费货币）
    crystals: 0,     // 星能晶体（高级货币）
    coins: 0,        // 金币（基础货币）
    exp: 0,          // 当前经验值
    createdAt: 0,
  })
  
  // 新手引导状态
  const newbieGuide = ref({
    shown: false,
    step: 0,
    initialSpiritClaimed: false,
  })
  
  // Getters
  const userId = computed(() => user.value.id)
  const nickname = computed(() => user.value.nickname)
  const level = computed(() => user.value.level)
  const essence = computed(() => user.value.essence)      // 时光精粹
  const crystals = computed(() => user.value.crystals)    // 星能晶体
  const coins = computed(() => user.value.coins)          // 金币
  const exp = computed(() => user.value.exp)              // 经验值
  const hasCompletedGuide = computed(() => newbieGuide.value.shown && newbieGuide.value.step >= 999)
  const userState = computed(() => ({
    hasCompletedGuide: hasCompletedGuide.value,
    hasClaimedInitialSpirit: newbieGuide.value.initialSpiritClaimed,
  }))
  
  // Actions
  function initUser() {
    const saved = localStorage.getItem('timevoyager_user')
    if (saved) {
      const data = JSON.parse(saved)
      user.value = data.user || user.value
      newbieGuide.value = data.newbieGuide || newbieGuide.value
      isLoggedIn.value = true
    } else {
      // 新用户
      createUser()
    }
  }
  
  function createUser() {
    user.value = {
      id: generateUserId(),
      nickname: '时光旅行者',
      level: 1,
      essence: 100,  // 初始赠送 100 时光精粹
      crystals: 0,
      coins: 0,
      exp: 0,
      createdAt: Date.now(),
    }
    newbieGuide.value = {
      shown: false,
      step: 0,
      initialSpiritClaimed: false,
    }
    isLoggedIn.value = true
    saveUser()
  }
  
  function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }
  
  function saveUser() {
    const data = {
      user: user.value,
      newbieGuide: newbieGuide.value,
    }
    localStorage.setItem('timevoyager_user', JSON.stringify(data))
  }
  
  function updateNickname(newNickname: string) {
    user.value.nickname = newNickname
    saveUser()
  }
  
  // 时光精粹（免费货币）
  function addEssence(amount: number) {
    user.value.essence += amount
    saveUser()
  }
  
  function spendEssence(amount: number): boolean {
    if (user.value.essence >= amount) {
      user.value.essence -= amount
      saveUser()
      return true
    }
    return false
  }
  
  // 星能晶体（高级货币）
  function addCrystals(amount: number) {
    user.value.crystals += amount
    saveUser()
  }
  
  function spendCrystals(amount: number): boolean {
    if (user.value.crystals >= amount) {
      user.value.crystals -= amount
      saveUser()
      return true
    }
    return false
  }
  
  // 金币（基础货币）
  function addCoins(amount: number) {
    user.value.coins += amount
    saveUser()
  }
  
  function spendCoins(amount: number): boolean {
    if (user.value.coins >= amount) {
      user.value.coins -= amount
      saveUser()
      return true
    }
    return false
  }
  
  // 经验值
  function addExp(amount: number) {
    user.value.exp += amount
    // 检查升级
    const expNeeded = user.value.level * 100
    if (user.value.exp >= expNeeded) {
      user.value.level++
      user.value.exp -= expNeeded
      // 升级奖励
      user.value.essence += 50
    }
    saveUser()
  }
  
  // 新手引导
  function showNewbieGuide() {
    newbieGuide.value.shown = true
    newbieGuide.value.step = 1
    saveUser()
  }
  
  function completeNewbieGuide() {
    newbieGuide.value.shown = true
    newbieGuide.value.step = 999 // 完成
    saveUser()
  }
  
  function nextGuideStep() {
    newbieGuide.value.step++
    saveUser()
  }
  
  // 初始星灵
  function claimInitialSpirit() {
    if (!newbieGuide.value.initialSpiritClaimed) {
      newbieGuide.value.initialSpiritClaimed = true
      saveUser()
      return true
    }
    return false
  }
  
  function hasClaimedInitialSpirit() {
    return newbieGuide.value.initialSpiritClaimed
  }
  
  // 初始化
  initUser()
  
  return {
    // State
    isLoggedIn,
    user,
    newbieGuide,
    
    // Getters
    userId,
    nickname,
    level,
    essence,      // 时光精粹
    crystals,     // 星能晶体
    coins,        // 金币
    exp,          // 经验值
    
    // Actions
    initUser,
    createUser,
    saveUser,
    updateNickname,
    addEssence,   // 添加时光精粹
    spendEssence, // 消耗时光精粹
    addCrystals,  // 添加星能晶体
    spendCrystals,// 消耗星能晶体
    addCoins,     // 添加金币
    spendCoins,   // 消耗金币
    addExp,       // 添加经验值
    showNewbieGuide,
    completeNewbieGuide,
    nextGuideStep,
    claimInitialSpirit,
    hasClaimedInitialSpirit,
  }
})
