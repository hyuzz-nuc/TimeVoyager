/**
 * 进化系统配置
 * 定义进化阶段、材料消耗、属性加成等
 */

import type { SpiritStage } from '@/stores/spirits'

// 进化阶段顺序
export const EVOLUTION_ORDER: SpiritStage[] = ['seed', 'grow', 'mature', 'cosmic']

// 进化材料配置
export interface EvolutionCost {
  evolutionStone: number    // 进化石
  crystals: number          // 星能晶体
  essence?: number          // 属性精华（可选）
  legendFragment?: number   // 传说碎片（可选）
}

// 各阶段进化消耗
export const EVOLUTION_COSTS: Record<string, EvolutionCost> = {
  // 种子期 → 生长期
  'seed_to_grow': {
    evolutionStone: 10,
    crystals: 500,
  },
  
  // 生长期 → 成熟期
  'grow_to_mature': {
    evolutionStone: 30,
    crystals: 2000,
    essence: 5,
  },
  
  // 成熟期 → 星域形态
  'mature_to_cosmic': {
    evolutionStone: 50,
    crystals: 10000,
    essence: 20,
    legendFragment: 1,
  },
}

// 阶段属性加成
export const STAGE_BONUSES: Record<SpiritStage, { attack: number; defense: number; hp: number }> = {
  seed: { attack: 0, defense: 0, hp: 0 },       // 基础
  grow: { attack: 0.2, defense: 0.2, hp: 0.2 }, // +20%
  mature: { attack: 0.5, defense: 0.5, hp: 0.5 }, // +50%
  cosmic: { attack: 1.0, defense: 1.0, hp: 1.0 }, // +100%
}

// 获取进化消耗
export function getEvolutionCost(fromStage: SpiritStage): EvolutionCost | null {
  const currentIndex = EVOLUTION_ORDER.indexOf(fromStage)
  if (currentIndex >= EVOLUTION_ORDER.length - 1) {
    return null // 已经是最高阶段
  }
  
  const nextStage = EVOLUTION_ORDER[currentIndex + 1]
  const key = `${fromStage}_to_${nextStage}`
  return EVOLUTION_COSTS[key] || null
}

// 获取下一阶段
export function getNextStage(currentStage: SpiritStage): SpiritStage | null {
  const currentIndex = EVOLUTION_ORDER.indexOf(currentStage)
  if (currentIndex >= EVOLUTION_ORDER.length - 1) {
    return null
  }
  return EVOLUTION_ORDER[currentIndex + 1]
}

// 检查材料是否足够
export function canAffordEvolution(materials: Record<string, number>, cost: EvolutionCost): boolean {
  if (materials.evolutionStone < cost.evolutionStone) return false
  if (materials.crystals < cost.crystals) return false
  if (cost.essence && materials.essence < cost.essence) return false
  if (cost.legendFragment && materials.legendFragment < cost.legendFragment) return false
  return true
}

// 扣除材料
export function deductMaterials(
  materials: Record<string, number>,
  cost: EvolutionCost
): Record<string, number> {
  return {
    evolutionStone: materials.evolutionStone - cost.evolutionStone,
    crystals: materials.crystals - cost.crystals,
    essence: materials.essence - (cost.essence || 0),
    legendFragment: materials.legendFragment - (cost.legendFragment || 0),
  }
}

// 计算阶段属性加成
export function calculateStageBonus(
  baseAttack: number,
  baseDefense: number,
  baseHp: number,
  stage: SpiritStage
): { attack: number; defense: number; hp: number } {
  const bonus = STAGE_BONUSES[stage]
  return {
    attack: Math.floor(baseAttack * (1 + bonus.attack)),
    defense: Math.floor(baseDefense * (1 + bonus.defense)),
    hp: Math.floor(baseHp * (1 + bonus.hp)),
  }
}

// 获取阶段中文名称
export function getStageName(stage: SpiritStage): string {
  const names: Record<SpiritStage, string> = {
    seed: '星灵之种',
    grow: '生长期',
    mature: '成熟期',
    cosmic: '星域形态',
  }
  return names[stage] || stage
}

// 获取阶段等级范围
export function getStageLevelRange(stage: SpiritStage): [number, number] {
  const ranges: Record<SpiritStage, [number, number]> = {
    seed: [1, 20],
    grow: [21, 50],
    mature: [51, 80],
    cosmic: [81, 100],
  }
  return ranges[stage] || [1, 100]
}
