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

// 历史状态记录（用于时间回溯）
export interface BattleHistoryState {
  turn: number
  hp: number
  maxHp: number
  buffs: BattleStatusEffect[]
  debuffs: BattleStatusEffect[]
}

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
  // 时间回溯相关
  history?: BattleHistoryState[]  // 历史记录（最多 5 回合）
  swallowStacks?: number          // 黑洞吞噬层数
  chaosDice?: number              // 混沌骰子点数（1-6）
  chaosLuck?: number              // 混沌幸运值（0-100）
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
  
  // 特殊技能处理：时间回溯
  if (config.id === 'time_rewind') {
    const success = timeRewind(attacker, 2) // 回溯 2 回合
    if (success) {
      result.success = true
      result.log.push(`时间回溯成功！恢复到 2 回合前的状态`)
    } else {
      result.log.push(`时间回溯失败！没有足够的历史记录`)
    }
    skill.currentCooldown = config.cooldown
    return result
  }
  
  // 特殊技能处理：黑洞吞噬
  if (config.id === 'bh_swallow') {
    if (config.damageMultiplier) {
      const damage = calculateDamage(attacker, defender, config)
      defender.hp = Math.max(0, defender.hp - damage)
      result.damage = damage
      result.log.push(`造成 ${damage} 点伤害！`)
    }
    
    const swallowed = blackHoleSwallow(attacker, defender)
    if (swallowed > 0) {
      const bonus = getBlackHoleBonus(attacker.swallowStacks || 0)
      result.success = true
      result.log.push(`吞噬了敌方的增益！当前层数：${attacker.swallowStacks} (攻击 +${bonus.attack * 100}%, 防御 +${bonus.defense * 100}%)`)
    } else {
      result.log.push(`敌方没有增益可以吞噬`)
    }
    skill.currentCooldown = config.cooldown
    return result
  }
  
  // 特殊技能处理：混沌骰子（每回合开始时掷骰）
  if (attacker.id === 'cosmos') {
    if (!attacker.chaosDice || attacker.chaosDice === 0) {
      rollChaosDice(attacker)
      updateChaosLuck(attacker, attacker.chaosDice!)
      result.log.push(`🎲 混沌骰子：${attacker.chaosDice} 点`)
    }
  }
  
  // 根据技能类型处理
  switch (config.target) {
    case 'enemy':
    case 'enemyAll':
      // 攻击技能
      if (config.damageMultiplier) {
        let damage = calculateDamage(attacker, defender, config)
        
        // 混沌倍率
        if (attacker.chaosDice) {
          const multiplier = getChaosMultiplier(attacker.chaosDice)
          if (multiplier === 0) {
            result.log.push(`混沌骰子 1 点！技能失败，反伤 20%`)
            attacker.hp = Math.floor(attacker.hp * 0.8)
            skill.currentCooldown = config.cooldown
            return result
          }
          damage = Math.floor(damage * multiplier)
          if (multiplier > 1.0) {
            result.log.push(`混沌骰子 ${attacker.chaosDice} 点！伤害 ×${multiplier}`)
          }
        }
        
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
    
    // 混沌 6 点：无冷却
    if (attacker.chaosDice === 6) {
      skill.currentCooldown = 0
      result.log.push(`混沌骰子 6 点！技能无冷却！`)
    }
  }
  
  // 混沌骰子重置（下次攻击时重新掷）
  if (attacker.id === 'cosmos') {
    attacker.chaosDice = 0
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
export function onTurnEnd(spirit: BattleSpirit, turn: number): string[] {
  const logs: string[] = []
  
  // 保存历史状态（时间回溯用）
  saveHistoryState(spirit, turn)
  
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

// ==================== 特殊机制 ====================

/**
 * 保存历史状态（用于时间回溯）
 * 每回合结束时调用
 */
export function saveHistoryState(spirit: BattleSpirit, turn: number) {
  if (!spirit.history) {
    spirit.history = []
  }
  
  // 保存当前状态（深拷贝）
  const state: BattleHistoryState = {
    turn,
    hp: spirit.hp,
    maxHp: spirit.maxHp,
    buffs: JSON.parse(JSON.stringify(spirit.buffs)),
    debuffs: JSON.parse(JSON.stringify(spirit.debuffs)),
  }
  
  // 添加到历史记录（最多保留 5 回合）
  spirit.history.push(state)
  if (spirit.history.length > 5) {
    spirit.history.shift()
  }
}

/**
 * 时间回溯到指定回合
 * @param spirit 星灵
 * @param turnsBack 回溯几回合（1-5）
 * @returns 是否成功
 */
export function timeRewind(spirit: BattleSpirit, turnsBack: number): boolean {
  if (!spirit.history || spirit.history.length === 0) {
    return false
  }
  
  const targetIndex = Math.max(0, spirit.history.length - turnsBack)
  const targetState = spirit.history[targetIndex]
  
  if (!targetState) {
    return false
  }
  
  // 恢复状态
  spirit.hp = targetState.hp
  spirit.maxHp = targetState.maxHp
  spirit.buffs = JSON.parse(JSON.stringify(targetState.buffs))
  spirit.debuffs = JSON.parse(JSON.stringify(targetState.debuffs))
  
  // 清除回溯后的历史记录
  spirit.history = spirit.history.slice(0, targetIndex)
  
  return true
}

/**
 * 黑洞吞噬增益
 * @param attacker 攻击方（黑洞星灵）
 * @param defender 防御方
 * @returns 吞噬的增益数量
 */
export function blackHoleSwallow(attacker: BattleSpirit, defender: BattleSpirit): number {
  if (defender.buffs.length === 0) {
    return 0
  }
  
  // 随机选择 1 个增益吞噬
  const buffIndex = Math.floor(Math.random() * defender.buffs.length)
  const buff = defender.buffs[buffIndex]
  
  // 从敌方移除
  defender.buffs.splice(buffIndex, 1)
  
  // 添加到自身（复制）
  attacker.buffs.push(JSON.parse(JSON.stringify(buff)))
  
  // 增加吞噬层数
  if (!attacker.swallowStacks) {
    attacker.swallowStacks = 0
  }
  attacker.swallowStacks++
  
  return 1
}

/**
 * 获取黑洞吞噬层数加成
 */
export function getBlackHoleBonus(swallowStacks: number): { attack: number; defense: number } {
  const bonuses = [
    { attack: 0, defense: 0 },      // 0 层
    { attack: 0.1, defense: 0 },    // 1 层
    { attack: 0.2, defense: 0 },    // 2 层
    { attack: 0.3, defense: 0.1 },  // 3 层
    { attack: 0.4, defense: 0.2 },  // 4 层
    { attack: 0.5, defense: 0.3 },  // 5 层（满层）
  ]
  
  const index = Math.min(swallowStacks, 5)
  return bonuses[index]
}

/**
 * 混沌骰子
 * @param spirit 混沌星灵
 * @returns 骰子点数（1-6）
 */
export function rollChaosDice(spirit: BattleSpirit): number {
  // 基础概率 1/6
  let probabilities = [1/6, 1/6, 1/6, 1/6, 1/6, 1/6]
  
  // 根据幸运值调整概率（幸运值越高，6 点概率越大）
  if (spirit.chaosLuck && spirit.chaosLuck > 0) {
    const luckBonus = Math.min(spirit.chaosLuck / 100, 1.0) // 最大 100%
    probabilities[5] += luckBonus * 0.1667 // 最多增加到 33.3%
    
    // 重新归一化
    const total = probabilities.reduce((a, b) => a + b, 0)
    probabilities = probabilities.map(p => p / total)
  }
  
  // 掷骰子
  const rand = Math.random()
  let cumulative = 0
  for (let i = 0; i < 6; i++) {
    cumulative += probabilities[i]
    if (rand < cumulative) {
      spirit.chaosDice = i + 1
      return spirit.chaosDice
    }
  }
  
  spirit.chaosDice = 6
  return 6
}

/**
 * 获取混沌技能效果倍率
 * @param dice 骰子点数
 * @returns 倍率（0-2.0）
 */
export function getChaosMultiplier(dice: number): number {
  const multipliers = [
    0,      // 1 点：技能失败
    0.5,    // 2 点：50% 效果
    0.8,    // 3 点：80% 效果
    1.0,    // 4 点：100% 效果（正常）
    1.5,    // 5 点：150% 效果
    2.0,    // 6 点：200% 效果 + 无冷却
  ]
  
  return multipliers[dice - 1] || 1.0
}

/**
 * 更新混沌幸运值
 * @param spirit 混沌星灵
 * @param dice 骰子点数
 */
export function updateChaosLuck(spirit: BattleSpirit, dice: number) {
  if (!spirit.chaosLuck) {
    spirit.chaosLuck = 0
  }
  
  // 掷出 1 点：幸运值 +10%
  if (dice === 1) {
    spirit.chaosLuck = Math.min(100, spirit.chaosLuck + 10)
  }
  // 掷出 6 点：幸运值 -20%
  else if (dice === 6) {
    spirit.chaosLuck = Math.max(0, spirit.chaosLuck - 20)
  }
}

// 创建战斗技能
export function createBattleSkill(config: SkillConfig): BattleSkill {
  return {
    config,
    currentCooldown: config.initialCooldown || 0,
    available: true,
  }
}
