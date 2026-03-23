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
    crystals: 0,
    coins: 0,
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
  const crystals = computed(() => user.value.crystals)
  
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
      crystals: 100, // 初始赠送 100 晶体
      coins: 0,
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
    crystals,
    
    // Actions
    initUser,
    createUser,
    saveUser,
    updateNickname,
    addCrystals,
    spendCrystals,
    addCoins,
    spendCoins,
    showNewbieGuide,
    completeNewbieGuide,
    nextGuideStep,
    claimInitialSpirit,
    hasClaimedInitialSpirit,
  }
})
