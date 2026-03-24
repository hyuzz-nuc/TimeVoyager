/**
 * 技能系统类型定义
 */

// 技能类型
export type SkillType = 
  | 'basic'      // 普通攻击
  | 'active'     // 主动技能
  | 'passive'    // 被动技能
  | 'ultimate'   // 终极技能

// 技能目标类型
export type SkillTarget = 
  | 'enemy'      // 敌方单体
  | 'enemyAll'   // 敌方全体
  | 'self'       // 自身
  | 'ally'       // 友方单体
  | 'allyAll'    // 友方全体

// 状态效果类型
export type StatusEffectType =
  | 'burn'       // 灼烧
  | 'poison'     // 中毒
  | 'freeze'     // 冻结
  | 'paralyze'   // 麻痹
  | 'stun'       // 眩晕
  | 'bind'       // 束缚
  | 'weak'       // 虚弱
  | 'corrode'    // 腐蚀
  | 'silence'    // 沉默
  | 'attack_up'  // 攻击提升
  | 'defense_up' // 防御提升
  | 'speed_up'   // 速度提升
  | 'shield'     // 护盾
  | 'regen'      // 持续回复

// 状态效果
export interface StatusEffect {
  type: StatusEffectType
  probability: number        // 触发概率 0-1
  duration: number           // 持续回合数
  value?: number             // 效果数值（如伤害百分比）
  damagePerTurn?: number     // 每回合伤害（DoT）
  description: string
}

// 技能配置
export interface SkillConfig {
  id: string
  name: string
  type: SkillType
  target: SkillTarget
  unlockLevel: number        // 解锁等级
  
  // 伤害相关
  damageMultiplier?: number  // 伤害倍率（如 1.5 = 150%）
  
  // 冷却
  cooldown: number           // 总冷却回合
  initialCooldown?: number   // 初始冷却（默认等于 cooldown）
  
  // 效果
  effect?: StatusEffect      // 附加效果
  
  // 特殊效果
  healingMultiplier?: number // 治疗倍率
  shieldMultiplier?: number  // 护盾倍率
  stealHpMultiplier?: number // 吸血倍率
  
  // 描述
  description: string
}

// 被动技能配置
export interface PassiveSkillConfig {
  id: string
  name: string
  unlockLevel: number
  
  // 被动效果类型
  effectType: 
    | 'damage_boost'      // 伤害提升
    | 'defense_boost'     // 防御提升
    | 'speed_boost'       // 速度提升
    | 'crit_boost'        // 暴击提升
    | 'heal_boost'        // 治疗提升
    | 'effect_boost'      // 效果提升
    | 'resistance'        // 抗性
    | 'special'           // 特殊效果
  
  // 效果参数
  element?: string         // 适用元素
  value: number            // 效果数值
  description: string
}

// 星灵技能组
export interface SpiritSkills {
  spiritId: string
  skills: SkillConfig[]
  passives: PassiveSkillConfig[]
}

// 战斗中的技能（带冷却状态）
export interface BattleSkill {
  config: SkillConfig
  currentCooldown: number
  available: boolean
}

// 战斗中的状态效果
export interface BattleStatusEffect {
  effect: StatusEffect
  remainingTurns: number
  stackable: boolean
  maxStacks?: number
  currentStacks?: number
}

// 属性类型
export type Element = 
  | '火' | '水' | '木' | '雷' | '暗' | '光' 
  | '星' | '时' | '能' | '虚空' | '混沌' | '冰'

// 属性克制关系
export const ELEMENT_COUNTERS: Record<string, string[]> = {
  '火': ['木'],
  '木': ['水'],
  '水': ['火'],
  '雷': ['水'],
  '暗': ['虚空'],
  '光': ['暗'],
  '虚空': ['光'],
  // 其他属性无克制
}

// 获取克制系数
export function getElementMultiplier(attackElement: Element, defenseElement: Element): number {
  const counters = ELEMENT_COUNTERS[attackElement]
  if (!counters) return 1.0
  
  // 检查是否克制
  if (counters.includes(defenseElement)) return 1.5
  
  // 检查是否被克
  const defenseCounters = ELEMENT_COUNTERS[defenseElement]
  if (defenseCounters?.includes(attackElement)) return 0.8
  
  // 光暗互相克制
  if (attackElement === '光' && defenseElement === '暗') return 1.5
  if (attackElement === '暗' && defenseElement === '光') return 1.5
  
  return 1.0
}

// 阶段类型
export type SpiritStage = 'seed' | 'grow' | 'mature' | 'cosmic'

// 阶段名称
export const STAGE_NAMES: Record<SpiritStage, string> = {
  seed: '星灵之种',
  grow: '生长期',
  mature: '成熟期',
  cosmic: '星域形态',
}

// 阶段等级范围
export const STAGE_LEVELS: Record<SpiritStage, [number, number]> = {
  seed: [1, 20],
  grow: [21, 50],
  mature: [51, 80],
  cosmic: [81, 100],
}
