/**
 * 技能效果引擎
 * 处理技能释放、伤害计算、状态应用等核心逻辑
 */

import type {
  SkillConfig,
  BattleSkill,
  BattleStatusEffect,
  StatusEffect,
  Element,
} from '../types/skills'
import { getElementMultiplier } from '../types/skills'

// 战斗星灵接口
export interface BattleSpirit {
  id: string
  name: string
  element: Element
  level: number
  hp: number
  maxHp: number
  attack: number
  defense: number
  speed: number
  energy?: number      // 能量（部分星灵使用）
  maxEnergy?: number
  skills: BattleSkill[]
  stage: string
  buffs: BattleStatusEffect[]
  debuffs: BattleStatusEffect[]
}

// 技能释放结果
export interface SkillResult {
  success: boolean
  damage?: number
  healing?: number
  shield?: number
  effects?: StatusEffect[]
  log: string[]
  critical?: boolean
  multiplier?: number
}

// 伤害计算公式
export function calculateDamage(
  attacker: BattleSpirit,
  defender: BattleSpirit,
  skill: SkillConfig
): number {
  // 基础伤害
  const baseDamage = attacker.attack * (skill.damageMultiplier || 1.0)
  
  // 防御减免
  const defenseReduction = defender.defense * 0.5
  let damage = Math.max(1, baseDamage - defenseReduction)
  
  // 属性克制
  const elementMultiplier = getElementMultiplier(attacker.element, defender.element as Element)
  damage *= elementMultiplier
  
  // 暴击计算（基础 5%，雷霆星灵等被动增加）
  const critChance = 0.05
  const isCrit = Math.random() < critChance
  if (isCrit) {
    damage *= 1.5
  }
  
  // 随机波动（±5%）
  const randomFactor = 0.95 + Math.random() * 0.1
  damage *= randomFactor
  
  return Math.floor(damage)
}

// 治疗计算公式
export function calculateHealing(
  healer: BattleSpirit,
  skill: SkillConfig
): number {
  const baseHeal = healer.maxHp * (skill.healingMultiplier || 0.2)
  
  // 治疗暴击（10% 概率，治疗 +50%）
  const isCrit = Math.random() < 0.1
  if (isCrit) {
    return Math.floor(baseHeal * 1.5)
  }
  
  return Math.floor(baseHeal)
}

// 护盾计算公式
export function calculateShield(
  target: BattleSpirit,
  skill: SkillConfig
): number {
  const baseShield = target.maxHp * (skill.shieldMultiplier || 0.2)
  return Math.floor(baseShield)
}

// 释放技能
export function useSkill(
  attacker: BattleSpirit,
  defender: BattleSpirit,
  skill: BattleSkill
): SkillResult {
  const result: SkillResult = {
    success: false,
    log: [],
  }
  
  // 检查冷却
  if (skill.currentCooldown > 0) {
    result.log.push(`${skill.config.name} 还在冷却中！`)
    return result
  }
  
  const config = skill.config
  
  result.log.push(`${attacker.name} 使用 ${config.name}！`)
  
  // 根据技能类型处理
  switch (config.target) {
    case 'enemy':
    case 'enemyAll':
      // 攻击技能
      if (config.damageMultiplier) {
        const damage = calculateDamage(attacker, defender, config)
        defender.hp = Math.max(0, defender.hp - damage)
        result.damage = damage
        result.success = true
        result.log.push(`造成 ${damage} 点伤害！`)
        
        // 吸血效果
        if (config.stealHpMultiplier) {
          const heal = Math.floor(damage * config.stealHpMultiplier)
          attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal)
          result.healing = heal
          result.log.push(`吸血恢复 ${heal} HP！`)
        }
      }
      
      // 应用效果
      if (config.effect) {
        const applied = applyStatusEffect(defender, config.effect, config.target === 'enemyAll')
        if (applied) {
          result.effects = [config.effect]
          result.log.push(`敌方进入 ${getEffectName(config.effect.type)} 状态！`)
        }
      }
      break
      
    case 'self':
      // 自身技能
      if (config.healingMultiplier) {
        const heal = calculateHealing(attacker, config)
        attacker.hp = Math.min(attacker.maxHp, attacker.hp + heal)
        result.healing = heal
        result.success = true
        result.log.push(`恢复 ${heal} HP！`)
      }
      
      if (config.shieldMultiplier) {
        const shield = calculateShield(attacker, config)
        result.shield = shield
        result.success = true
        result.log.push(`获得 ${shield} 点护盾！`)
      }
      
      if (config.effect) {
        const applied = applyStatusEffect(attacker, config.effect, false)
        if (applied) {
          result.effects = [config.effect]
          result.log.push(`获得 ${getEffectName(config.effect.type)} 效果！`)
        }
      }
      break
      
    case 'ally':
    case 'allyAll':
      // 友方技能（治疗/增益）
      if (config.healingMultiplier) {
        const heal = calculateHealing(attacker, config)
        defender.hp = Math.min(defender.maxHp, defender.hp + heal)
        result.healing = heal
        result.success = true
        result.log.push(`为 ${defender.name} 恢复 ${heal} HP！`)
      }
      
      if (config.effect) {
        const applied = applyStatusEffect(defender, config.effect, config.target === 'allyAll')
        if (applied) {
          result.effects = [config.effect]
          result.log.push(`${defender.name} 获得 ${getEffectName(config.effect.type)} 效果！`)
        }
      }
      break
  }
  
  // 设置冷却
  if (result.success) {
    skill.currentCooldown = config.cooldown
  }
  
  return result
}

// 应用状态效果
export function applyStatusEffect(
  target: BattleSpirit,
  effect: StatusEffect,
  isArea: boolean = false
): boolean {
  // 概率判定
  if (effect.probability < 1.0 && Math.random() > effect.probability) {
    return false
  }
  
  // 选择目标数组（增益或减益）
  const isBuff = isBuffEffect(effect.type)
  const effectArray = isBuff ? target.buffs : target.debuffs
  
  // 检查是否已有相同效果
  const existing = effectArray.find(e => e.effect.type === effect.type)
  if (existing) {
    // 可叠加则叠加，否则刷新持续时间
    if (existing.stackable && existing.maxStacks) {
      if (existing.currentStacks! < existing.maxStacks) {
        existing.currentStacks!++
      }
      existing.remainingTurns = effect.duration
    } else {
      existing.remainingTurns = effect.duration
    }
  } else {
    // 添加新效果
    effectArray.push({
      effect,
      remainingTurns: effect.duration,
      stackable: false,
      currentStacks: 1,
    })
  }
  
  return true
}

// 判断是否为增益效果
function isBuffEffect(type: StatusEffect['type']): boolean {
  const buffs = ['attack_up', 'defense_up', 'speed_up', 'shield', 'regen']
  return buffs.includes(type)
}

// 获取效果中文名
export function getEffectName(type: StatusEffect['type']): string {
  const names: Record<StatusEffect['type'], string> = {
    burn: '灼烧',
    poison: '中毒',
    freeze: '冻结',
    paralyze: '麻痹',
    stun: '眩晕',
    bind: '束缚',
    weak: '虚弱',
    corrode: '腐蚀',
    silence: '沉默',
    attack_up: '攻击提升',
    defense_up: '防御提升',
    speed_up: '速度提升',
    shield: '护盾',
    regen: '持续回复',
  }
  return names[type]
}

// 回合结束处理（DoT 伤害、效果移除）
export function onTurnEnd(spirit: BattleSpirit): string[] {
  const logs: string[] = []
  
  // 处理减益效果
  spirit.debuffs = spirit.debuffs.filter(effect => {
    // DoT 伤害
    if (effect.effect.damagePerTurn) {
      const damage = Math.floor(spirit.maxHp * effect.effect.damagePerTurn)
      spirit.hp = Math.max(1, spirit.hp - damage)
      logs.push(`${spirit.name} 受到 ${getEffectName(effect.effect.type)} 伤害：${damage} HP`)
    }
    
    // 减少持续时间
    effect.remainingTurns--
    
    // 返回 true 保留效果
    return effect.remainingTurns > 0
  })
  
  // 处理增益效果
  spirit.buffs = spirit.buffs.filter(effect => {
    effect.remainingTurns--
    return effect.remainingTurns > 0
  })
  
  return logs
}

// 减少冷却
export function reduceCooldowns(spirit: BattleSpirit) {
  spirit.skills.forEach(skill => {
    if (skill.currentCooldown > 0) {
      skill.currentCooldown--
    }
  })
}

// 检查是否存活
export function isAlive(spirit: BattleSpirit): boolean {
  return spirit.hp > 0
}

// 获取可用技能
export function getAvailableSkills(spirit: BattleSpirit): BattleSkill[] {
  return spirit.skills.filter(skill => 
    skill.currentCooldown === 0 && skill.config.type !== 'passive'
  )
}

// 创建战斗技能
export function createBattleSkill(config: SkillConfig): BattleSkill {
  return {
    config,
    currentCooldown: config.initialCooldown || 0,
    available: true,
  }
}
