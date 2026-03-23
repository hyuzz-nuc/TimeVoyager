/**
 * Pinia Store - 星灵收集管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Spirit {
  id: string
  name: string
  element: string
  level: number
  exp: number
  stage: SpiritStage
  obtainedAt: number
  favorite: boolean
}

export type SpiritStage = 'seed' | 'grow' | 'mature' | 'cosmic'

// 阶段中文名称
export const STAGE_NAMES: Record<SpiritStage, string> = {
  seed: '星灵之种',     // Lv.1-20
  grow: '生长期',      // Lv.21-50
  mature: '成熟期',    // Lv.51-80
  cosmic: '星域形态',  // Lv.81-100
}

// 阶段等级范围
export const STAGE_LEVELS: Record<SpiritStage, [number, number]> = {
  seed: [1, 20],
  grow: [21, 50],
  mature: [51, 80],
  cosmic: [81, 100],
}

export const useSpiritStore = defineStore('spirits', () => {
  // State
  const spirits = ref<Spirit[]>([])
  const unlockedIds = ref<Set<string>>(new Set())
  
  // 星灵图鉴数据（19 种基础星灵）
  const spiritTypes = ref([
    { id: 'base_blue', name: '基础星灵', element: '水' },
    { id: 'fire', name: '火焰星灵', element: '火' },
    { id: 'water', name: '流水星灵', element: '水' },
    { id: 'wood', name: '自然星灵', element: '木' },
    { id: 'thunder', name: '雷霆星灵', element: '雷' },
    { id: 'dark', name: '暗影星灵', element: '暗' },
    { id: 'light', name: '光辉星灵', element: '光' },
    { id: 'star', name: '恒星星灵', element: '星' },
    { id: 'moon', name: '月球星灵', element: '星' },
    { id: 'comet', name: '彗星星灵', element: '星' },
    { id: 'meteor', name: '流星星灵', element: '星' },
    { id: 'nebula', name: '星云星灵', element: '星' },
    { id: 'galaxy', name: '星系星灵', element: '星' },
    { id: 'blackhole', name: '黑洞星灵', element: '星' },
    { id: 'aurora', name: '极球星灵', element: '星' },
    { id: 'cosmos', name: '宇宙星灵', element: '星' },
    { id: 'time', name: '时间星灵', element: '时' },
    { id: 'focus', name: '专注星灵', element: '时' },
    { id: 'energy', name: '能量星灵', element: '能' },
  ])
  
  // Getters
  const collectedCount = computed(() => {
    return spirits.value.length
  })
  
  const unlockedCount = computed(() => {
    return unlockedIds.value.size
  })
  
  const totalCount = computed(() => {
    return spiritTypes.value.length * 4 // 4 个阶段
  })
  
  const completionRate = computed(() => {
    return Math.round((unlockedCount.value / totalCount.value) * 100)
  })
  
  const favoriteSpirits = computed(() => {
    return spirits.value.filter(s => s.favorite)
  })
  
  const spiritsByElement = computed(() => {
    const groups: Record<string, Spirit[]> = {}
    spirits.value.forEach(spirit => {
      const type = spiritTypes.value.find(t => t.id === spirit.id.replace(/_(baby|adult|final|base)$/, ''))
      if (type) {
        if (!groups[type.element]) groups[type.element] = []
        groups[type.element].push(spirit)
      }
    })
    return groups
  })
  
  // Actions
  function loadSpirits() {
    const saved = localStorage.getItem('timevoyager_spirits')
    if (saved) {
      const data = JSON.parse(saved)
      spirits.value = data.spirits || []
      unlockedIds.value = new Set(data.unlockedIds || [])
    }
  }
  
  function saveSpirits() {
    const data = {
      spirits: spirits.value,
      unlockedIds: Array.from(unlockedIds.value),
    }
    localStorage.setItem('timevoyager_spirits', JSON.stringify(data))
  }
  
  function addSpirit(spiritId: string, stage: SpiritStage = 'cosmic') {
    const key = `${spiritId}_${stage}`
    if (!unlockedIds.value.has(key)) {
      unlockedIds.value.add(key)
      
      // 根据阶段设置初始等级
      const levelMap: Record<SpiritStage, number> = {
        seed: 1,
        grow: 25,
        mature: 60,
        cosmic: 90,
      }
      
      const spirit: Spirit = {
        id: spiritId,
        name: getSpiritName(spiritId),
        element: getSpiritElement(spiritId),
        level: levelMap[stage],
        exp: 0,
        stage,
        obtainedAt: Date.now(),
        favorite: false,
      }
      
      spirits.value.push(spirit)
      saveSpirits()
      return true
    }
    return false
  }
  
  function getSpiritName(id: string): string {
    const type = spiritTypes.value.find(t => t.id === id.replace(/_(baby|adult|final|base)$/, ''))
    return type ? type.name : '未知星灵'
  }
  
  function getSpiritElement(id: string): string {
    const type = spiritTypes.value.find(t => t.id === id.replace(/_(baby|adult|final|base)$/, ''))
    return type ? type.element : '?'
  }
  
  function levelUpSpirit(spiritId: string, expGain: number) {
    const spirit = spirits.value.find(s => s.id === spiritId)
    if (spirit) {
      spirit.exp += expGain
      // 简单升级逻辑
      const expNeeded = spirit.level * 100
      if (spirit.exp >= expNeeded) {
        spirit.exp -= expNeeded
        spirit.level++
      }
      saveSpirits()
    }
  }
  
  function toggleFavorite(spiritId: string) {
    const spirit = spirits.value.find(s => s.id === spiritId)
    if (spirit) {
      spirit.favorite = !spirit.favorite
      saveSpirits()
    }
  }
  
  function hasSpirit(spiritId: string, stage?: SpiritStage): boolean {
    if (stage) {
      return unlockedIds.value.has(`${spiritId}_${stage}`)
    }
    // 检查是否有任何阶段
    return spirits.value.some(s => s.id === spiritId)
  }
  
  // 获取阶段中文名称
  function getStageName(stage: SpiritStage): string {
    return STAGE_NAMES[stage]
  }
  
  // 检查是否可以进化到下一阶段
  function canEvolve(spirit: Spirit): boolean {
    const evolutionOrder: SpiritStage[] = ['seed', 'grow', 'mature', 'cosmic']
    const currentIndex = evolutionOrder.indexOf(spirit.stage)
    return currentIndex < evolutionOrder.length - 1 && spirit.level >= STAGE_LEVELS[spirit.stage][1]
  }
  
  return {
    // State
    spirits,
    unlockedIds,
    spiritTypes,
    
    // Getters
    collectedCount,
    unlockedCount,
    totalCount,
    completionRate,
    favoriteSpirits,
    spiritsByElement,
    
    // Actions
    loadSpirits,
    saveSpirits,
    addSpirit,
    levelUpSpirit,
    toggleFavorite,
    hasSpirit,
    getSpiritName,
    getSpiritElement,
  }
})
