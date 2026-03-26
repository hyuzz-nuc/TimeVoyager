/**
 * Pinia Store - 星灵收集管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getEvolutionCost, getNextStage, canAffordEvolution, deductMaterials } from '@/data/evolution'

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

// 材料库存
export interface MaterialInventory {
  evolutionStone: number
  crystals: number
  essence: number
  legendFragment: number
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
  
  // 材料库存
  const materials = ref<MaterialInventory>({
    evolutionStone: 100,    // 初始赠送 100 个进化石
    crystals: 10000,        // 初始赠送 10000 晶体
    essence: 50,            // 初始赠送 50 个精华
    legendFragment: 5,      // 初始赠送 5 个传说碎片
  })
  
  // 星灵图鉴数据（19 种星灵，8 元素体系）
  const spiritTypes = ref([
    // 🔥 火系 (3)
    { id: 'fire', name: '火焰星灵', element: '火' },
    { id: 'star', name: '恒星星灵', element: '火' },
    { id: 'meteor', name: '流星星灵', element: '火' },
    // 💧 水系 (3)
    { id: 'water', name: '流水星灵', element: '水' },
    { id: 'moon', name: '月球星灵', element: '水' },
    { id: 'aurora', name: '极球星灵', element: '水' },
    // 🌿 木系 (2)
    { id: 'wood', name: '自然星灵', element: '木' },
    { id: 'nebula', name: '星云星灵', element: '木' },
    // ⚡ 雷系 (3)
    { id: 'thunder', name: '雷霆星灵', element: '雷' },
    { id: 'comet', name: '彗星星灵', element: '雷' },
    { id: 'focus', name: '专注星灵', element: '雷' },
    // 🌑 暗系 (2)
    { id: 'dark', name: '暗影星灵', element: '暗' },
    { id: 'blackhole', name: '黑洞星灵', element: '暗' },
    // ✨ 光系 (2)
    { id: 'light', name: '光辉星灵', element: '光' },
    { id: 'energy', name: '能量星灵', element: '光' },
    // 🕳️ 空系 (4)
    { id: 'galaxy', name: '星系星灵', element: '空' },
    { id: 'cosmos', name: '宇宙星灵', element: '空' },
    { id: 'time', name: '时间星灵', element: '空' },
    // 💫 能系 (3)
    { id: 'base_blue', name: '基础星灵', element: '能' },
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
  
  // 检查是否可以进化
  function canEvolve(spirit: Spirit): boolean {
    const currentIndex = EVOLUTION_ORDER.indexOf(spirit.stage)
    return currentIndex < EVOLUTION_ORDER.length - 1 && spirit.level >= STAGE_LEVELS[spirit.stage][1]
  }
  
  // 检查材料是否足够进化
  function canAffordEvolutionFor(spirit: Spirit): boolean {
    const cost = getEvolutionCost(spirit.stage)
    if (!cost) return false
    return canAffordEvolution(materials.value, cost)
  }
  
  // 获取进化所需材料
  function getEvolutionCostFor(spirit: Spirit) {
    return getEvolutionCost(spirit.stage)
  }
  
  // 执行进化
  function evolveSpirit(spiritId: string): { success: boolean; error?: string } {
    const spirit = spirits.value.find(s => s.id === spiritId)
    if (!spirit) {
      return { success: false, error: '星灵不存在' }
    }
    
    // 检查是否可以进化
    if (!canEvolve(spirit)) {
      return { success: false, error: '等级不足，无法进化' }
    }
    
    // 检查材料
    const cost = getEvolutionCost(spirit.stage)
    if (!cost) {
      return { success: false, error: '无法获取进化消耗' }
    }
    
    if (!canAffordEvolution(materials.value, cost)) {
      return { success: false, error: '材料不足' }
    }
    
    // 扣除材料
    materials.value = deductMaterials(materials.value, cost)
    
    // 阶段进化
    const nextStage = getNextStage(spirit.stage)
    if (nextStage) {
      spirit.stage = nextStage
      // 重置等级到下一阶段起始等级（可选）
      // spirit.level = STAGE_LEVELS[nextStage][0]
    }
    
    saveSpirits()
    saveMaterials()
    
    return { success: true }
  }
  
  // 保存材料
  function saveMaterials() {
    localStorage.setItem('timevoyager_materials', JSON.stringify(materials.value))
  }
  
  // 加载材料
  function loadMaterials() {
    const saved = localStorage.getItem('timevoyager_materials')
    if (saved) {
      materials.value = JSON.parse(saved)
    }
  }
  
  // 添加材料（测试用）
  function addMaterials(delta: Partial<MaterialInventory>) {
    if (delta.evolutionStone) materials.value.evolutionStone += delta.evolutionStone
    if (delta.crystals) materials.value.crystals += delta.crystals
    if (delta.essence) materials.value.essence += delta.essence
    if (delta.legendFragment) materials.value.legendFragment += delta.legendFragment
    saveMaterials()
  }
  
  return {
    // State
    spirits,
    unlockedIds,
    spiritTypes,
    materials,
    
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
    canEvolve,
    canAffordEvolutionFor,
    getEvolutionCostFor,
    evolveSpirit,
    loadMaterials,
    saveMaterials,
    addMaterials,
  }
})
