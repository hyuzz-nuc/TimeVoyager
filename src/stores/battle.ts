/**
 * Pinia Store - 对战系统管理
 * 整合新技能系统
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BattleSpirit as SkillBattleSpirit, BattleStatusEffect } from '../engine/skillEngine'
import type { Element } from '../types/skills'

// 兼容旧接口，逐步迁移到新技能系统
export interface BattleSkill {
  id: string
  name: string
  type: 'attack' | 'defend' | 'skill' | 'item'
  power?: number
  effect?: string
  cooldown: number
  currentCooldown: number
  description: string
}

export interface BattleReward {
  crystals: number
  coins?: number
  exp?: number
  itemDrop?: string
}

// 战斗星灵 - 使用引擎定义
export interface BattleSpirit extends SkillBattleSpirit {}

// 战斗敌人 - 扩展星灵接口
export interface BattleEnemy extends Omit<SkillBattleSpirit, 'id' | 'stage' | 'energy' | 'maxEnergy'> {
  reward: BattleReward
  difficulty?: number
}

export const useBattleStore = defineStore('battle', () => {
  // 战斗状态
  const inBattle = ref(false)
  const playerSpirit = ref<BattleSpirit | null>(null)
  const enemy = ref<BattleEnemy | null>(null)
  const battleLog = ref<string[]>([])
  const playerTurn = ref(true)
  const battleResult = ref<'victory' | 'defeat' | null>(null)
  
  // 战斗统计
  const battleStats = ref({
    totalBattles: 0,
    totalWins: 0,
    totalLosses: 0,
    winStreak: 0,
    maxWinStreak: 0,
  })
  
  // Getters
  const playerHpPercent = computed(() => {
    if (!playerSpirit.value) return 0
    return Math.round((playerSpirit.value.hp / playerSpirit.value.maxHp) * 100)
  })
  
  const enemyHpPercent = computed(() => {
    if (!enemy.value) return 0
    return Math.round((enemy.value.hp / enemy.value.maxHp) * 100)
  })
  
  const winRate = computed(() => {
    if (battleStats.value.totalBattles === 0) return 0
    return Math.round((battleStats.value.totalWins / battleStats.value.totalBattles) * 100)
  })
  
  // Actions
  function loadStats() {
    const saved = localStorage.getItem('timevoyager_battle_stats')
    if (saved) {
      battleStats.value = JSON.parse(saved)
    }
  }
  
  function saveStats() {
    localStorage.setItem('timevoyager_battle_stats', JSON.stringify(battleStats.value))
  }
  
  // 开始战斗
  function startBattle(spirit: BattleSpirit, battleEnemy: BattleEnemy) {
    playerSpirit.value = { ...spirit }
    enemy.value = { ...battleEnemy }
    inBattle.value = true
    battleLog.value = [`遭遇 ${battleEnemy.name}！`]
    playerTurn.value = spirit.speed >= battleEnemy.speed
    battleResult.value = null
    
    if (playerTurn.value) {
      battleLog.value.push('你的回合！')
    } else {
      battleLog.value.push('敌方先手！')
    }
  }
  
  // 玩家攻击
  function playerAttack(skill: BattleSkill) {
    if (!playerSpirit.value || !enemy.value || !playerTurn.value) return
    
    // 计算伤害
    const damage = calculateDamage(playerSpirit.value, enemy.value, skill)
    
    // 应用伤害
    enemy.value.hp = Math.max(0, enemy.value.hp - damage)
    
    battleLog.value.push(`${playerSpirit.value.name} 使用 ${skill.name}！`)
    battleLog.value.push(`造成 ${damage} 点伤害！`)
    
    // 检查胜利
    if (enemy.value.hp <= 0) {
      endBattle('victory')
      return
    }
    
    // 切换回合
    playerTurn.value = false
    setTimeout(enemyAction, 1000)
  }
  
  // 计算伤害
  function calculateDamage(attacker: BattleSpirit | BattleEnemy, defender: BattleSpirit | BattleEnemy, skill: BattleSkill) {
    const baseDamage = attacker.attack * (skill.power || 1) / 100
    const defense = defender.defense
    const damage = Math.max(1, Math.floor(baseDamage - defense / 2))
    return damage
  }
  
  // 敌方行动
  function enemyAction() {
    if (!enemy.value || !playerSpirit.value || inBattle.value === false) return
    
    // 简单 AI：随机选择技能
    const skills = enemy.value.skills.filter(s => s.currentCooldown === 0)
    const skill = skills.length > 0 ? skills[Math.floor(Math.random() * skills.length)] : enemy.value.skills[0]
    
    // 计算伤害
    const damage = calculateDamage(enemy.value, playerSpirit.value, skill)
    
    // 应用伤害
    playerSpirit.value.hp = Math.max(0, playerSpirit.value.hp - damage)
    
    battleLog.value.push(`${enemy.value.name} 使用 ${skill.name}！`)
    battleLog.value.push(`造成 ${damage} 点伤害！`)
    
    // 检查失败
    if (playerSpirit.value.hp <= 0) {
      endBattle('defeat')
      return
    }
    
    // 更新冷却
    enemy.value.skills.forEach(s => {
      if (s.currentCooldown > 0) s.currentCooldown--
    })
    
    // 切换回合
    playerTurn.value = true
    battleLog.value.push('你的回合！')
  }
  
  // 结束战斗
  function endBattle(result: 'victory' | 'defeat') {
    battleResult.value = result
    inBattle.value = false
    
    // 更新统计
    battleStats.value.totalBattles++
    if (result === 'victory') {
      battleStats.value.totalWins++
      battleStats.value.winStreak++
      if (battleStats.value.winStreak > battleStats.value.maxWinStreak) {
        battleStats.value.maxWinStreak = battleStats.value.winStreak
      }
      battleLog.value.push('胜利！')
      if (enemy.value) {
        battleLog.value.push(`获得奖励：${enemy.value.reward.crystals} 晶体`)
      }
    } else {
      battleStats.value.totalLosses++
      battleStats.value.winStreak = 0
      battleLog.value.push('失败...')
    }
    
    saveStats()
  }
  
  // 获取战斗奖励
  function getBattleReward(): BattleReward | null {
    if (battleResult.value !== 'victory' || !enemy.value) return null
    return enemy.value.reward
  }
  
  // 重置战斗
  function resetBattle() {
    playerSpirit.value = null
    enemy.value = null
    battleLog.value = []
    playerTurn.value = true
    battleResult.value = null
    inBattle.value = false
  }
  
  // 初始化
  loadStats()
  
  return {
    // State
    inBattle,
    playerSpirit,
    enemy,
    battleLog,
    playerTurn,
    battleResult,
    battleStats,
    
    // Getters
    playerHpPercent,
    enemyHpPercent,
    winRate,
    
    // Actions
    loadStats,
    saveStats,
    startBattle,
    playerAttack,
    enemyAction,
    endBattle,
    getBattleReward,
    resetBattle,
  }
})
