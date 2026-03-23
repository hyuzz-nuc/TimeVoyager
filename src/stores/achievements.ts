/**
 * Pinia Store - 成就系统管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Achievement {
  id: string
  name: string
  description: string
  category: AchievementCategory
  icon: string
  unlocked: boolean
  progress: number
  target: number
  reward: AchievementReward
  unlockedAt?: number
}

export type AchievementCategory = 'focus' | 'collection' | 'battle' | 'exploration' | 'special'

export interface AchievementReward {
  crystals: number
  coins?: number
  spiritId?: string
  spiritStage?: string
}

export const useAchievementStore = defineStore('achievements', () => {
  // 成就列表
  const achievements = ref<Achievement[]>([])
  
  // 成就配置（16 个成就）
  const achievementConfig = ref<Achievement[]>([
    // 专注类 (7 个)
    {
      id: 'first_focus',
      name: '专注新手',
      description: '完成第一次专注',
      category: 'focus',
      icon: 'mdi-timer-outline',
      unlocked: false,
      progress: 0,
      target: 1,
      reward: { crystals: 10 }
    },
    {
      id: 'focus_1h',
      name: '专注 1 小时',
      description: '累计专注 1 小时',
      category: 'focus',
      icon: 'mdi-timer',
      unlocked: false,
      progress: 0,
      target: 60,
      reward: { crystals: 50 }
    },
    {
      id: 'focus_10h',
      name: '专注达人',
      description: '累计专注 10 小时',
      category: 'focus',
      icon: 'mdi-timer-sand',
      unlocked: false,
      progress: 0,
      target: 600,
      reward: { crystals: 100 }
    },
    {
      id: 'focus_100h',
      name: '专注大师',
      description: '累计专注 100 小时',
      category: 'focus',
      icon: 'mdi-timer-sand-complete',
      unlocked: false,
      progress: 0,
      target: 6000,
      reward: { crystals: 500, spiritId: 'focus', spiritStage: 'seed' }
    },
    {
      id: 'perfect_day',
      name: '完美一天',
      description: '单日完成 4 次专注',
      category: 'focus',
      icon: 'mdi-star-circle',
      unlocked: false,
      progress: 0,
      target: 4,
      reward: { crystals: 50 }
    },
    {
      id: 'week_streak',
      name: '坚持不懈',
      description: '连续 7 天专注',
      category: 'focus',
      icon: 'mdi-calendar-week',
      unlocked: false,
      progress: 0,
      target: 7,
      reward: { crystals: 100 }
    },
    {
      id: 'month_streak',
      name: '持之以恒',
      description: '连续 30 天专注',
      category: 'focus',
      icon: 'mdi-calendar-month',
      unlocked: false,
      progress: 0,
      target: 30,
      reward: { crystals: 300, spiritId: 'time', spiritStage: 'seed' }
    },
    
    // 收集类 (4 个)
    {
      id: 'first_spirit',
      name: '初遇星灵',
      description: '获得第一只星灵',
      category: 'collection',
      icon: 'mdi-star',
      unlocked: false,
      progress: 0,
      target: 1,
      reward: { crystals: 20 }
    },
    {
      id: 'spirit_10',
      name: '星灵收集者',
      description: '收集 10 只星灵',
      category: 'collection',
      icon: 'mdi-star-multiple',
      unlocked: false,
      progress: 0,
      target: 10,
      reward: { crystals: 100 }
    },
    {
      id: 'all_elements',
      name: '全元素收集',
      description: '收集所有 7 种基础元素星灵',
      category: 'collection',
      icon: 'mdi-element',
      unlocked: false,
      progress: 0,
      target: 7,
      reward: { crystals: 200, spiritId: 'energy', spiritStage: 'seed' }
    },
    {
      id: 'max_level_spirit',
      name: '星灵大师',
      description: '将一只星灵培养到 100 级',
      category: 'collection',
      icon: 'mdi-star-circle-outline',
      unlocked: false,
      progress: 0,
      target: 1,
      reward: { crystals: 500 }
    },
    
    // 对战类 (4 个)
    {
      id: 'first_battle',
      name: '初战告捷',
      description: '赢得第一次对战',
      category: 'battle',
      icon: 'mdi-sword',
      unlocked: false,
      progress: 0,
      target: 1,
      reward: { crystals: 30 }
    },
    {
      id: 'battle_10',
      name: '战功赫赫',
      description: '赢得 10 场对战',
      category: 'battle',
      icon: 'mdi-sword-cross',
      unlocked: false,
      progress: 0,
      target: 10,
      reward: { crystals: 100 }
    },
    {
      id: 'battle_100',
      name: '战无不胜',
      description: '赢得 100 场对战',
      category: 'battle',
      icon: 'mdi-trophy',
      unlocked: false,
      progress: 0,
      target: 100,
      reward: { crystals: 500, spiritId: 'dark', spiritStage: 'seed' }
    },
    {
      id: 'undefeated',
      name: '不败传说',
      description: '连续 10 场对战不败',
      category: 'battle',
      icon: 'mdi-medal',
      unlocked: false,
      progress: 0,
      target: 10,
      reward: { crystals: 300 }
    },
    
    // 探索类 (1 个)
    {
      id: 'first_explore',
      name: '探索者',
      description: '探索第一个星域',
      category: 'exploration',
      icon: 'mdi-map-marker',
      unlocked: false,
      progress: 0,
      target: 1,
      reward: { crystals: 20 }
    },
    {
      id: 'explore_100',
      name: '星域征服者',
      description: '探索 100 个星域格子',
      category: 'exploration',
      icon: 'mdi-map',
      unlocked: false,
      progress: 0,
      target: 100,
      reward: { crystals: 200 }
    },
    {
      id: 'all_regions',
      name: '宇宙漫游者',
      description: '探索所有类型的星域',
      category: 'exploration',
      icon: 'mdi-earth',
      unlocked: false,
      progress: 0,
      target: 13,
      reward: { crystals: 300, spiritId: 'cosmos', spiritStage: 'seed' }
    },
  ])
  
  // Getters
  const unlockedCount = computed(() => {
    return achievements.value.filter(a => a.unlocked).length
  })
  
  const totalCount = computed(() => {
    return achievements.value.length
  })
  
  const completionRate = computed(() => {
    return Math.round((unlockedCount.value / totalCount.value) * 100)
  })
  
  const achievementsByCategory = computed(() => {
    const groups: Record<string, Achievement[]> = {}
    achievements.value.forEach(a => {
      if (!groups[a.category]) groups[a.category] = []
      groups[a.category].push(a)
    })
    return groups
  })
  
  const unlockedAchievements = computed(() => {
    return achievements.value.filter(a => a.unlocked)
  })
  
  // Actions
  function loadAchievements() {
    const saved = localStorage.getItem('timevoyager_achievements')
    if (saved) {
      const data = JSON.parse(saved)
      // 合并保存的数据和配置
      achievements.value = achievementConfig.value.map(config => {
        const savedAch = data.find((a: Achievement) => a.id === config.id)
        return savedAch ? { ...config, ...savedAch } : { ...config }
      })
    } else {
      achievements.value = JSON.parse(JSON.stringify(achievementConfig.value))
    }
  }
  
  function saveAchievements() {
    const data = achievements.value.map(a => ({
      id: a.id,
      unlocked: a.unlocked,
      progress: a.progress,
      unlockedAt: a.unlockedAt,
    }))
    localStorage.setItem('timevoyager_achievements', JSON.stringify(data))
  }
  
  function updateProgress(achievementId: string, progress: number) {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.progress = Math.min(progress, achievement.target)
      
      // 检查是否达成
      if (achievement.progress >= achievement.target) {
        unlockAchievement(achievement)
      }
      
      saveAchievements()
    }
  }
  
  function incrementProgress(achievementId: string, amount: number = 1) {
    const achievement = achievements.value.find(a => a.id === achievementId)
    if (achievement && !achievement.unlocked) {
      achievement.progress += amount
      if (achievement.progress >= achievement.target) {
        unlockAchievement(achievement)
      }
      saveAchievements()
    }
  }
  
  function unlockAchievement(achievement: Achievement) {
    if (!achievement.unlocked) {
      achievement.unlocked = true
      achievement.unlockedAt = Date.now()
      
      // 发放奖励
      // TODO: 调用 userStore.addCrystals(achievement.reward.crystals)
      console.log(`Achievement unlocked: ${achievement.name}`)
      console.log(`Reward: ${achievement.reward.crystals} crystals`)
      
      // 播放成就解锁动画/音效
      // TODO: 实现成就解锁通知
    }
  }
  
  function checkAllAchievements(userStats: any) {
    // 专注类
    updateProgress('first_focus', userStats.totalSessions || 0)
    updateProgress('focus_1h', (userStats.totalFocusTime || 0) / 60)
    updateProgress('focus_10h', (userStats.totalFocusTime || 0) / 60)
    updateProgress('focus_100h', (userStats.totalFocusTime || 0) / 60)
    updateProgress('perfect_day', userStats.todaySessions || 0)
    
    // 收集类
    updateProgress('first_spirit', userStats.spiritsCollected || 0)
    updateProgress('spirit_10', userStats.spiritsCollected || 0)
    
    // 对战类
    updateProgress('first_battle', userStats.totalWins || 0)
    updateProgress('battle_10', userStats.totalWins || 0)
    updateProgress('battle_100', userStats.totalWins || 0)
    
    // 探索类
    updateProgress('first_explore', userStats.tilesExplored || 0)
    updateProgress('explore_100', userStats.tilesExplored || 0)
  }
  
  // 初始化
  loadAchievements()
  
  return {
    // State
    achievements,
    achievementConfig,
    
    // Getters
    unlockedCount,
    totalCount,
    completionRate,
    achievementsByCategory,
    unlockedAchievements,
    
    // Actions
    loadAchievements,
    saveAchievements,
    updateProgress,
    incrementProgress,
    unlockAchievement,
    checkAllAchievements,
  }
})
