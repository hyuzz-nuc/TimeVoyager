/**
 * 敌方 AI 引擎
 * 实现智能技能选择和目标选择
 */

import type { BattleSpirit, BattleSkill } from './skillEngine'
import { getElementMultiplier } from '../types/skills'

// AI 配置
export interface AIConfig {
  aggression: number    // 攻击性（0-1，越高越倾向攻击）
  intelligence: number  // 智能度（0-1，越高越会判断局势）
  survival: number      // 生存欲（0-1，越高越倾向保命）
}

// 默认 AI 配置
const DEFAULT_AI_CONFIG: AIConfig = {
  aggression: 0.7,
  intelligence: 0.8,
  survival: 0.6,
}

// 技能评分
interface SkillScore {
  skill: BattleSkill
  score: number
  reason: string
}

/**
 * 选择最佳技能
 * @param attacker 攻击方
 * @param defender 防御方
 * @param config AI 配置
 */
export function chooseBestSkill(
  attacker: BattleSpirit,
  defender: BattleSpirit,
  config: AIConfig = DEFAULT_AI_CONFIG
): BattleSkill | null {
  const availableSkills = attacker.skills.filter(s => 
    s.currentCooldown === 0 && 
    s.config.type !== 'passive'
  )

  if (availableSkills.length === 0) {
    return null
  }

  // 如果只有一个技能，直接返回
  if (availableSkills.length === 1) {
    return availableSkills[0]
  }

  // 为每个技能评分
  const scoredSkills: SkillScore[] = availableSkills.map(skill => {
    const score = evaluateSkill(skill, attacker, defender, config)
    return { skill, ...score }
  })

  // 按分数排序
  scoredSkills.sort((a, b) => b.score - a.score)

  // 返回最高分的技能
  return scoredSkills[0].skill
}

/**
 * 评估技能分数
 */
function evaluateSkill(
  skill: BattleSkill,
  attacker: BattleSpirit,
  defender: BattleSpirit,
  config: AIConfig
): { score: number; reason: string } {
  let score = 0
  const reasons: string[] = []
  const configData = skill.config

  // 1. 基础伤害评分（30% 权重）
  if (configData.damageMultiplier) {
    const baseScore = configData.damageMultiplier * 30
    score += baseScore
    reasons.push(`伤害倍率${configData.damageMultiplier}`)
  }

  // 2. 收割评分（20% 权重）- 优先攻击 HP 低的敌人
  if (configData.damageMultiplier && config.intelligence > 0.5) {
    const enemyHpPercent = defender.hp / defender.maxHp
    if (enemyHpPercent < 0.3) {
      score += 20 * (1 - enemyHpPercent)
      reasons.push('可以收割')
    }
  }

  // 3. 克制评分（15% 权重）- 优先攻击被克制的敌人
  if (config.intelligence > 0.6) {
    const multiplier = getElementMultiplier(attacker.element, defender.element)
    if (multiplier > 1.0) {
      score += 15 * (multiplier - 1.0)
      reasons.push('属性克制')
    } else if (multiplier < 1.0) {
      score -= 10 * (1.0 - multiplier)
      reasons.push('属性被克')
    }
  }

  // 4. 生存评分（20% 权重）- HP 低时优先治疗/防御
  const myHpPercent = attacker.hp / attacker.maxHp
  if (myHpPercent < 0.3 && config.survival > 0.5) {
    if (configData.healingMultiplier) {
      score += 40
      reasons.push('紧急治疗')
    } else if (configData.shieldMultiplier || configData.effect?.type === 'defense_up') {
      score += 30
      reasons.push('紧急防御')
    }
  }

  // 5. 效果评分（15% 权重）- 控制/增益效果
  if (configData.effect && config.intelligence > 0.7) {
    const effectType = configData.effect.type
    
    // 控制效果（冻结、眩晕、麻痹）
    if (['freeze', 'stun', 'paralyze'].includes(effectType)) {
      score += 15 * configData.effect.probability
      reasons.push('控制效果')
    }
    
    // 减益效果（虚弱、腐蚀）
    if (['weak', 'corrode', 'bind'].includes(effectType)) {
      score += 10 * configData.effect.probability
      reasons.push('减益效果')
    }
    
    // 增益效果（攻击提升、防御提升）
    if (['attack_up', 'defense_up', 'speed_up'].includes(effectType)) {
      score += 8
      reasons.push('增益效果')
    }
    
    // 持续伤害（灼烧、中毒）
    if (['burn', 'poison'].includes(effectType) && configData.effect.damagePerTurn) {
      const totalDamage = configData.effect.damagePerTurn * configData.effect.duration
      score += 12 * totalDamage
      reasons.push('持续伤害')
    }
  }

  // 6. 冷却效率评分（10% 权重）- 优先使用冷却短的技能
  if (configData.cooldown > 0) {
    const cooldownPenalty = configData.cooldown * 5
    score -= cooldownPenalty
    reasons.push(`冷却${configData.cooldown}回合`)
  }

  // 7. 终极技能加分
  if (configData.type === 'ultimate') {
    score += 25
    reasons.push('终极技能')
  }

  return { score, reason: reasons.join(', ') }
}

/**
 * 选择最佳目标（多目标战斗时使用）
 * @param attacker 攻击方
 * @param targets 可选目标列表
 * @param config AI 配置
 */
export function chooseBestTarget(
  attacker: BattleSpirit,
  targets: BattleSpirit[],
  config: AIConfig = DEFAULT_AI_CONFIG
): BattleSpirit | null {
  if (targets.length === 0) return null
  if (targets.length === 1) return targets[0]

  // 为每个目标评分
  const scoredTargets = targets.map(target => {
    const score = evaluateTarget(attacker, target, config)
    return { target, score }
  })

  // 按分数排序
  scoredTargets.sort((a, b) => b.score - a.score)

  return scoredTargets[0].target
}

/**
 * 评估目标分数
 */
function evaluateTarget(
  attacker: BattleSpirit,
  target: BattleSpirit,
  config: AIConfig
): number {
  let score = 0

  // 1. HP 评分（40% 权重）- 优先攻击 HP 低的
  const hpPercent = target.hp / target.maxHp
  score += 40 * (1 - hpPercent)

  // 2. 克制评分（30% 权重）- 优先攻击被克制的
  const multiplier = getElementMultiplier(attacker.element, target.element)
  if (multiplier > 1.0) {
    score += 30 * (multiplier - 1.0)
  } else if (multiplier < 1.0) {
    score -= 20 * (1.0 - multiplier)
  }

  // 3. 威胁评分（20% 权重）- 优先攻击高攻击的敌人
  const attackRatio = target.attack / attacker.attack
  if (attackRatio > 1.2) {
    score += 15
  } else if (attackRatio < 0.8) {
    score -= 10
  }

  // 4. 状态评分（10% 权重）- 优先攻击有增益的敌人（驱散）
  if (target.buffs.length > 0) {
    score += 10
  }

  return score
}

/**
 * 判断是否应该使用防御/治疗技能
 */
export function shouldDefend(
  spirit: BattleSpirit,
  config: AIConfig = DEFAULT_AI_CONFIG
): boolean {
  const hpPercent = spirit.hp / spirit.maxHp
  
  // HP 低于 30% 且生存欲高时使用防御
  if (hpPercent < 0.3 && config.survival > 0.6) {
    return true
  }
  
  // HP 低于 50% 且有致命威胁时
  if (hpPercent < 0.5 && config.survival > 0.8) {
    return true
  }
  
  return false
}

/**
 * 判断是否应该收割
 */
export function shouldNuke(
  attacker: BattleSpirit,
  defender: BattleSpirit,
  skill: BattleSkill,
  config: AIConfig = DEFAULT_AI_CONFIG
): boolean {
  if (!skill.config.damageMultiplier) return false
  
  // 计算预期伤害
  const expectedDamage = attacker.attack * skill.config.damageMultiplier
  const canKill = expectedDamage >= defender.hp
  
  // 可以击杀且攻击性高时
  return canKill && config.aggression > 0.5
}

/**
 * 获取 AI 决策日志
 */
export function getAIDecisionLog(
  attacker: BattleSpirit,
  defender: BattleSpirit,
  chosenSkill: BattleSkill
): string {
  const { score, reason } = evaluateSkill(chosenSkill, attacker, defender, DEFAULT_AI_CONFIG)
  return `AI 选择 ${chosenSkill.config.name} (${reason}) - 评分：${score.toFixed(1)}`
}
