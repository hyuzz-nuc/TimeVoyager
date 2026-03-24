/**
 * 道具系统配置
 */

import type { BattleSpirit } from '../engine/skillEngine'

// 道具类型
export type ItemType = 
  | 'heal'        // 治疗类
  | 'status'      // 状态解除类
  | 'buff'        // 增益类
  | 'special'     // 特殊类

// 道具目标
export type ItemTarget = 'self' | 'ally' | 'enemy'

// 道具配置
export interface ItemConfig {
  id: string
  name: string
  type: ItemType
  target: ItemTarget
  icon: string
  description: string
  effect: ItemEffect
  maxStack: number
  price?: number   // 商店价格
  sellPrice?: number // 出售价格
}

// 道具效果
export interface ItemEffect {
  // 治疗效果
  healPercent?: number
  healFlat?: number
  
  // 状态解除
  cleanse?: boolean
  cleanseTypes?: string[]
  
  // 增益效果
  buffType?: string
  buffValue?: number
  buffDuration?: number
  
  // 复活效果
  revive?: boolean
  revivePercent?: number
  
  // 伤害效果
  damagePercent?: number
  
  // 逃跑效果
  escape?: boolean
}

// 道具使用结果
export interface ItemUseResult {
  success: boolean
  log: string[]
  consumed: boolean
}

/**
 * 道具配置列表
 */
export const ITEMS: Record<string, ItemConfig> = {
  // ==================== 治疗类道具 ====================
  
  // 小型治疗药水
  potion_small: {
    id: 'potion_small',
    name: '小型治疗药水',
    type: 'heal',
    target: 'self',
    icon: '🧪',
    description: '回复 30% HP',
    effect: {
      healPercent: 0.3,
    },
    maxStack: 99,
    price: 50,
    sellPrice: 25,
  },
  
  // 中型治疗药水
  potion_medium: {
    id: 'potion_medium',
    name: '中型治疗药水',
    type: 'heal',
    target: 'self',
    icon: '🧪',
    description: '回复 50% HP',
    effect: {
      healPercent: 0.5,
    },
    maxStack: 99,
    price: 100,
    sellPrice: 50,
  },
  
  // 大型治疗药水
  potion_large: {
    id: 'potion_large',
    name: '大型治疗药水',
    type: 'heal',
    target: 'self',
    icon: '🧪',
    description: '回复 80% HP',
    effect: {
      healPercent: 0.8,
    },
    maxStack: 99,
    price: 200,
    sellPrice: 100,
  },
  
  // 完全治疗药水
  potion_full: {
    id: 'potion_full',
    name: '完全治疗药水',
    type: 'heal',
    target: 'self',
    icon: '💎',
    description: '回复 100% HP',
    effect: {
      healPercent: 1.0,
    },
    maxStack: 10,
    price: 500,
    sellPrice: 250,
  },
  
  // 治疗喷雾
  spray: {
    id: 'spray',
    name: '治疗喷雾',
    type: 'heal',
    target: 'self',
    icon: '💨',
    description: '回复 20% HP，解除灼烧/中毒',
    effect: {
      healPercent: 0.2,
      cleanse: true,
      cleanseTypes: ['burn', 'poison'],
    },
    maxStack: 99,
    price: 80,
    sellPrice: 40,
  },
  
  // ==================== 状态解除类 ====================
  
  // 解毒剂
  antidote: {
    id: 'antidote',
    name: '解毒剂',
    type: 'status',
    target: 'self',
    icon: '💊',
    description: '解除中毒状态',
    effect: {
      cleanse: true,
      cleanseTypes: ['poison'],
    },
    maxStack: 99,
    price: 30,
    sellPrice: 15,
  },
  
  // 解冻剂
  ice_melt: {
    id: 'ice_melt',
    name: '解冻剂',
    type: 'status',
    target: 'self',
    icon: '🔥',
    description: '解除冻结状态',
    effect: {
      cleanse: true,
      cleanseTypes: ['freeze'],
    },
    maxStack: 99,
    price: 30,
    sellPrice: 15,
  },
  
  // 清醒剂
  awaken: {
    id: 'awaken',
    name: '清醒剂',
    type: 'status',
    target: 'self',
    icon: '⚡',
    description: '解除麻痹/眩晕状态',
    effect: {
      cleanse: true,
      cleanseTypes: ['paralyze', 'stun'],
    },
    maxStack: 99,
    price: 40,
    sellPrice: 20,
  },
  
  // 万能药
  panacea: {
    id: 'panacea',
    name: '万能药',
    type: 'status',
    target: 'self',
    icon: '✨',
    description: '解除所有异常状态',
    effect: {
      cleanse: true,
    },
    maxStack: 99,
    price: 150,
    sellPrice: 75,
  },
  
  // ==================== 增益类 ====================
  
  // 攻击强化剂
  attack_boost: {
    id: 'attack_boost',
    name: '攻击强化剂',
    type: 'buff',
    target: 'self',
    icon: '⚔️',
    description: '3 回合内攻击 +30%',
    effect: {
      buffType: 'attack_up',
      buffValue: 0.3,
      buffDuration: 3,
    },
    maxStack: 10,
    price: 120,
    sellPrice: 60,
  },
  
  // 防御强化剂
  defense_boost: {
    id: 'defense_boost',
    name: '防御强化剂',
    type: 'buff',
    target: 'self',
    icon: '🛡️',
    description: '3 回合内防御 +30%',
    effect: {
      buffType: 'defense_up',
      buffValue: 0.3,
      buffDuration: 3,
    },
    maxStack: 10,
    price: 120,
    sellPrice: 60,
  },
  
  // 速度强化剂
  speed_boost: {
    id: 'speed_boost',
    name: '速度强化剂',
    type: 'buff',
    target: 'self',
    icon: '💨',
    description: '3 回合内速度 +30%',
    effect: {
      buffType: 'speed_up',
      buffValue: 0.3,
      buffDuration: 3,
    },
    maxStack: 10,
    price: 120,
    sellPrice: 60,
  },
  
  // 全能药剂
  omni_boost: {
    id: 'omni_boost',
    name: '全能药剂',
    type: 'buff',
    target: 'self',
    icon: '🌟',
    description: '3 回合内全属性 +20%',
    effect: {
      buffType: 'all_up',
      buffValue: 0.2,
      buffDuration: 3,
    },
    maxStack: 5,
    price: 300,
    sellPrice: 150,
  },
  
  // ==================== 特殊类 ====================
  
  // 复活药
  revive: {
    id: 'revive',
    name: '复活药',
    type: 'special',
    target: 'ally',
    icon: '🔄',
    description: '复活星灵并回复 50% HP',
    effect: {
      revive: true,
      revivePercent: 0.5,
    },
    maxStack: 10,
    price: 1000,
    sellPrice: 500,
  },
  
  // 高级复活药
  revive_max: {
    id: 'revive_max',
    name: '高级复活药',
    type: 'special',
    target: 'ally',
    icon: '💎',
    description: '复活星灵并回复 100% HP',
    effect: {
      revive: true,
      revivePercent: 1.0,
    },
    maxStack: 5,
    price: 2000,
    sellPrice: 1000,
  },
  
  // 烟雾弹（逃跑）
  smoke_bomb: {
    id: 'smoke_bomb',
    name: '烟雾弹',
    type: 'special',
    target: 'self',
    icon: '💨',
    description: '100% 从普通战斗中逃跑',
    effect: {
      escape: true,
    },
    maxStack: 20,
    price: 50,
    sellPrice: 25,
  },
  
  // 伤害手雷
  damage_grenade: {
    id: 'damage_grenade',
    name: '伤害手雷',
    type: 'special',
    target: 'enemy',
    icon: '💣',
    description: '造成攻击力 200% 的伤害',
    effect: {
      damagePercent: 2.0,
    },
    maxStack: 10,
    price: 200,
    sellPrice: 100,
  },
}

// 导出道具 ID 列表
export const ITEM_IDS = Object.keys(ITEMS)

// 根据类型筛选道具
export function getItemsByType(type: ItemType): ItemConfig[] {
  return ITEM_IDS
    .map(id => ITEMS[id])
    .filter(item => item.type === type)
}

// 使用道具
export function useItem(
  item: ItemConfig,
  target: BattleSpirit,
  user?: BattleSpirit
): ItemUseResult {
  const result: ItemUseResult = {
    success: false,
    log: [],
    consumed: true,
  }
  
  const effect = item.effect
  const logs: string[] = []
  
  // 治疗效果
  if (effect.healPercent || effect.healFlat) {
    const healAmount = effect.healPercent 
      ? Math.floor(target.maxHp * effect.healPercent)
      : (effect.healFlat || 0)
    
    const oldHp = target.hp
    target.hp = Math.min(target.maxHp, target.hp + healAmount)
    const actualHeal = target.hp - oldHp
    
    logs.push(`${item.icon} ${item.name}：回复 ${actualHeal} HP`)
    result.success = true
  }
  
  // 状态解除
  if (effect.cleanse) {
    const cleanseTypes = effect.cleanseTypes || null
    
    if (cleanseTypes) {
      // 解除特定状态
      const removedCount = target.debuffs.filter(e => 
        cleanseTypes.includes(e.effect.type)
      ).length
      target.debuffs = target.debuffs.filter(e => 
        !cleanseTypes.includes(e.effect.type)
      )
      
      if (removedCount > 0) {
        logs.push(`${item.icon} ${item.name}：解除了 ${removedCount} 个异常状态`)
        result.success = true
      } else {
        logs.push(`${item.icon} ${item.name}：没有可解除的异常状态`)
      }
    } else {
      // 解除所有状态
      const removedCount = target.debuffs.length
      target.debuffs = []
      
      if (removedCount > 0) {
        logs.push(`${item.icon} ${item.name}：解除了所有异常状态`)
        result.success = true
      } else {
        logs.push(`${item.icon} ${item.name}：没有可解除的异常状态`)
      }
    }
  }
  
  // 增益效果
  if (effect.buffType) {
    // 简化实现：直接添加到 buffs 数组
    target.buffs.push({
      effect: {
        type: effect.buffType as any,
        probability: 1.0,
        duration: effect.buffDuration || 3,
        value: effect.buffValue,
        description: `${effect.buffType} +${effect.buffValue! * 100}%`,
      },
      remainingTurns: effect.buffDuration || 3,
      stackable: false,
    })
    
    logs.push(`${item.icon} ${item.name}：获得增益效果，持续 ${effect.buffDuration} 回合`)
    result.success = true
  }
  
  // 复活效果
  if (effect.revive) {
    if (target.hp > 0) {
      logs.push(`${item.icon} ${item.name}：目标已经存活`)
      result.consumed = false
    } else {
      target.hp = Math.floor(target.maxHp * effect.revivePercent)
      logs.push(`${item.icon} ${item.name}：复活了 ${target.name}，回复 ${target.hp} HP`)
      result.success = true
    }
  }
  
  // 逃跑效果
  if (effect.escape) {
    logs.push(`${item.icon} ${item.name}：制造烟雾，准备逃跑...`)
    result.success = true
    // 逃跑逻辑由战斗系统处理
  }
  
  // 伤害效果
  if (effect.damagePercent && user) {
    // 伤害计算由战斗系统处理
    logs.push(`${item.icon} ${item.name}：对敌方造成 ${effect.damagePercent * 100}% 攻击力的伤害`)
    result.success = true
  }
  
  result.log = logs
  return result
}

// 获取道具图标
export function getItemIcon(itemId: string): string {
  return ITEMS[itemId]?.icon || '📦'
}

// 获取道具名称
export function getItemName(itemId: string): string {
  return ITEMS[itemId]?.name || '未知道具'
}

// 获取道具描述
export function getItemDescription(itemId: string): string {
  return ITEMS[itemId]?.description || ''
}
