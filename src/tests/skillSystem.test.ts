/**
 * 技能系统单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  calculateDamage,
  calculateHealing,
  useSkill,
  applyStatusEffect,
  onTurnEnd,
  reduceCooldowns,
  isAlive,
  createBattleSkill,
  type BattleSpirit,
} from '../engine/skillEngine'
import { getElementMultiplier } from '../types/skills'
import { chooseBestSkill } from '../engine/enemyAI'

// 测试用星灵
function createTestSpirit(overrides: Partial<BattleSpirit> = {}): BattleSpirit {
  return {
    id: 'fire',
    name: '火焰星灵',
    element: '火',
    level: 30,
    hp: 200,
    maxHp: 200,
    attack: 35,
    defense: 20,
    speed: 25,
    stage: 'grow',
    skills: [],
    buffs: [],
    debuffs: [],
    ...overrides,
  }
}

describe('技能系统', () => {
  describe('属性克制', () => {
    it('火克制木', () => {
      const multiplier = getElementMultiplier('火', '木')
      expect(multiplier).toBe(1.5)
    })

    it('木克制水', () => {
      const multiplier = getElementMultiplier('木', '水')
      expect(multiplier).toBe(1.5)
    })

    it('水克制火', () => {
      const multiplier = getElementMultiplier('水', '火')
      expect(multiplier).toBe(1.5)
    })

    it('光暗互相克制', () => {
      expect(getElementMultiplier('光', '暗')).toBe(1.5)
      expect(getElementMultiplier('暗', '光')).toBe(1.5)
    })

    it('无克制关系', () => {
      const multiplier = getElementMultiplier('火', '水')
      expect(multiplier).toBe(0.8)
    })
  })

  describe('伤害计算', () => {
    it('基础伤害计算', () => {
      const attacker = createTestSpirit({ attack: 100 })
      const defender = createTestSpirit({ defense: 50 })
      const skill = createBattleSkill({
        id: 'test',
        name: '测试技能',
        type: 'basic',
        target: 'enemy',
        unlockLevel: 1,
        damageMultiplier: 1.0,
        cooldown: 0,
        description: '测试',
      })

      const damage = calculateDamage(attacker, defender, skill)
      
      // 基础伤害 = 100 * 1.0 - 50 * 0.5 = 75
      // 考虑随机波动 (0.95-1.05)，期望值约 75
      expect(damage).toBeGreaterThan(65)
      expect(damage).toBeLessThan(85)
    })

    it('克制时伤害增加', () => {
      const attacker = createTestSpirit({ element: '火', attack: 100 })
      const defender = createTestSpirit({ element: '木', defense: 50 })
      const skill = createBattleSkill({
        id: 'test',
        name: '测试技能',
        type: 'basic',
        target: 'enemy',
        unlockLevel: 1,
        damageMultiplier: 1.0,
        cooldown: 0,
        description: '测试',
      })

      const damage = calculateDamage(attacker, defender, skill)
      
      // 克制 1.5 倍，期望值约 112
      expect(damage).toBeGreaterThan(100)
    })

    it('被克制时伤害减少', () => {
      const attacker = createTestSpirit({ element: '火', attack: 100 })
      const defender = createTestSpirit({ element: '水', defense: 50 })
      const skill = createBattleSkill({
        id: 'test',
        name: '测试技能',
        type: 'basic',
        target: 'enemy',
        unlockLevel: 1,
        damageMultiplier: 1.0,
        cooldown: 0,
        description: '测试',
      })

      const damage = calculateDamage(attacker, defender, skill)
      
      // 被克制 0.8 倍，期望值约 60
      expect(damage).toBeLessThan(70)
    })
  })

  describe('治疗计算', () => {
    it('基础治疗计算', () => {
      const healer = createTestSpirit({ maxHp: 200 })
      const skill = createBattleSkill({
        id: 'heal',
        name: '治疗',
        type: 'active',
        target: 'self',
        unlockLevel: 1,
        healingMultiplier: 0.3,
        cooldown: 3,
        description: '回复 30% HP',
      })

      const healing = calculateHealing(healer, skill)
      
      // 200 * 0.3 = 60
      expect(healing).toBeGreaterThan(50)
      expect(healing).toBeLessThan(70)
    })
  })

  describe('状态效果', () => {
    it('施加灼烧效果', () => {
      const target = createTestSpirit()
      const effect = {
        type: 'burn' as const,
        probability: 1.0,
        duration: 3,
        damagePerTurn: 0.05,
        description: '灼烧',
      }

      const applied = applyStatusEffect(target, effect)
      
      expect(applied).toBe(true)
      expect(target.debuffs.length).toBe(1)
      expect(target.debuffs[0].effect.type).toBe('burn')
      expect(target.debuffs[0].remainingTurns).toBe(3)
    })

    it('概率触发效果', () => {
      const target = createTestSpirit()
      const effect = {
        type: 'burn' as const,
        probability: 0.0, // 0% 概率
        duration: 3,
        damagePerTurn: 0.05,
        description: '灼烧',
      }

      const applied = applyStatusEffect(target, effect)
      
      expect(applied).toBe(false)
    })

    it('回合结束扣除 DoT 伤害', () => {
      const target = createTestSpirit({ maxHp: 200, hp: 200 })
      const effect = {
        type: 'burn' as const,
        probability: 1.0,
        duration: 3,
        damagePerTurn: 0.05, // 5%
        description: '灼烧',
      }

      applyStatusEffect(target, effect)
      const logs = onTurnEnd(target)

      // 200 * 0.05 = 10 伤害
      expect(target.hp).toBe(190)
      expect(logs.length).toBeGreaterThan(0)
    })

    it('状态效果持续时间递减', () => {
      const target = createTestSpirit()
      const effect = {
        type: 'burn' as const,
        probability: 1.0,
        duration: 3,
        damagePerTurn: 0.05,
        description: '灼烧',
      }

      applyStatusEffect(target, effect)
      onTurnEnd(target)

      expect(target.debuffs[0].remainingTurns).toBe(2)
    })

    it('状态效果到期移除', () => {
      const target = createTestSpirit()
      const effect = {
        type: 'burn' as const,
        probability: 1.0,
        duration: 1,
        damagePerTurn: 0.05,
        description: '灼烧',
      }

      applyStatusEffect(target, effect)
      onTurnEnd(target)

      expect(target.debuffs.length).toBe(0)
    })
  })

  describe('冷却系统', () => {
    it('减少技能冷却', () => {
      const spirit = createTestSpirit({
        skills: [
          createBattleSkill({
            id: 'skill1',
            name: '技能 1',
            type: 'active',
            target: 'enemy',
            unlockLevel: 1,
            damageMultiplier: 1.5,
            cooldown: 3,
            description: '测试',
          }),
        ],
      })

      // 设置冷却为 3
      spirit.skills[0].currentCooldown = 3
      
      reduceCooldowns(spirit)
      
      expect(spirit.skills[0].currentCooldown).toBe(2)
    })

    it('冷却为 0 时不再减少', () => {
      const spirit = createTestSpirit({
        skills: [
          createBattleSkill({
            id: 'skill1',
            name: '技能 1',
            type: 'active',
            target: 'enemy',
            unlockLevel: 1,
            damageMultiplier: 1.5,
            cooldown: 0,
            description: '测试',
          }),
        ],
      })

      reduceCooldowns(spirit)
      
      expect(spirit.skills[0].currentCooldown).toBe(0)
    })
  })

  describe('存活检查', () => {
    it('HP>0 时存活', () => {
      const spirit = createTestSpirit({ hp: 1 })
      expect(isAlive(spirit)).toBe(true)
    })

    it('HP<=0 时死亡', () => {
      const spirit = createTestSpirit({ hp: 0 })
      expect(isAlive(spirit)).toBe(false)
    })
  })
})

describe('敌方 AI', () => {
  describe('技能选择', () => {
    it('选择伤害最高的技能', () => {
      const attacker = createTestSpirit({
        skills: [
          createBattleSkill({
            id: 'weak',
            name: '弱技能',
            type: 'active',
            target: 'enemy',
            unlockLevel: 1,
            damageMultiplier: 1.0,
            cooldown: 0,
            description: '测试',
          }),
          createBattleSkill({
            id: 'strong',
            name: '强技能',
            type: 'active',
            target: 'enemy',
            unlockLevel: 1,
            damageMultiplier: 2.0,
            cooldown: 0,
            description: '测试',
          }),
        ],
      })

      const defender = createTestSpirit()
      const bestSkill = chooseBestSkill(attacker, defender)

      expect(bestSkill?.config.name).toBe('强技能')
    })

    it('HP 低时优先治疗', () => {
      const attacker = createTestSpirit({
        hp: 30,
        maxHp: 200,
        skills: [
          createBattleSkill({
            id: 'attack',
            name: '攻击',
            type: 'active',
            target: 'enemy',
            unlockLevel: 1,
            damageMultiplier: 1.5,
            cooldown: 0,
            description: '测试',
          }),
          createBattleSkill({
            id: 'heal',
            name: '治疗',
            type: 'active',
            target: 'self',
            unlockLevel: 1,
            healingMultiplier: 0.5,
            cooldown: 0,
            description: '测试',
          }),
        ],
      })

      const defender = createTestSpirit()
      const bestSkill = chooseBestSkill(attacker, defender)

      // HP<30% 时应该优先治疗
      expect(bestSkill?.config.name).toBe('治疗')
    })

    it('优先攻击被克制的敌人', () => {
      const attacker = createTestSpirit({ element: '火' })
      const defender = createTestSpirit({ element: '木' }) // 被火克制
      
      const skill = createBattleSkill({
        id: 'attack',
        name: '攻击',
        type: 'active',
        target: 'enemy',
        unlockLevel: 1,
        damageMultiplier: 1.0,
        cooldown: 0,
        description: '测试',
      })

      attacker.skills = [skill]
      
      const bestSkill = chooseBestSkill(attacker, defender)
      
      expect(bestSkill).not.toBeNull()
    })
  })
})
