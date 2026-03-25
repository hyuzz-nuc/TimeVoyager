/**
 * Pinia Store - 等级系统管理
 * 用户等级通过探索、任务、专注、步数获得经验值
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useLevelStore = defineStore('level', () => {
  // 等级配置
  const BASE_EXP = 100        // 基础升级经验
  const EXP_MULTIPLIER = 1.5  // 每级经验增长系数
  
  // 等级状态（从 auth store 同步）
  const level = ref(1)
  const exp = ref(0)
  
  // Getters
  const expNeeded = computed(() => {
    // 升级所需经验 = 基础经验 * 等级^1.5
    return Math.floor(BASE_EXP * Math.pow(level.value, EXP_MULTIPLIER))
  })
  
  const expPercent = computed(() => {
    return Math.floor((exp.value / expNeeded.value) * 100)
  })
  
  const expProgress = computed(() => ({
    current: exp.value,
    needed: expNeeded.value,
    percent: expPercent.value,
  }))
  
  // Actions
  function initLevel(userLevel: number, userExp: number) {
    level.value = userLevel
    exp.value = userExp
  }
  
  function addExp(amount: number): { leveledUp: boolean, newLevel?: number } {
    exp.value += amount
    
    // 检查升级
    if (exp.value >= expNeeded.value) {
      exp.value -= expNeeded.value
      level.value++
      
      return {
        leveledUp: true,
        newLevel: level.value,
      }
    }
    
    return { leveledUp: false }
  }
  
  function getExpSources() {
    return {
      // 探索地图
      exploreTile: 10,           // 每次探索
      exploreReward: 20,         // 发现奖励
      
      // 每日任务
      dailyTaskComplete: 50,     // 完成一个任务
      dailyTaskAll: 200,         // 完成所有任务
      
      // 专注
      focusMinute: 1,            // 每分钟专注
      focusSession: 30,          // 完成一次专注
      
      // 步数
      step1000: 10,              // 每 1000 步
    }
  }
  
  function getLevelTitle(lvl: number): string {
    const titles = [
      { level: 1, title: '新手旅行者' },
      { level: 5, title: '见习探索者' },
      { level: 10, title: '资深旅行者' },
      { level: 15, title: '时空行者' },
      { level: 20, title: '维度穿越者' },
      { level: 30, title: '时间守护者' },
      { level: 50, title: '永恒旅者' },
      { level: 100, title: '时空之主' },
    ]
    
    for (let i = titles.length - 1; i >= 0; i--) {
      if (lvl >= titles[i].level) {
        return titles[i].title
      }
    }
    
    return '旅行者'
  }
  
  const currentTitle = computed(() => getLevelTitle(level.value))
  
  return {
    // Config
    BASE_EXP,
    EXP_MULTIPLIER,
    
    // State
    level,
    exp,
    
    // Getters
    expNeeded,
    expPercent,
    expProgress,
    currentTitle,
    
    // Actions
    initLevel,
    addExp,
    getExpSources,
    getLevelTitle,
  }
})
