<template>
  <div class="skill-test-view">
    <div class="header">
      <h1>🧪 技能系统测试</h1>
      <button @click="runAllTests" class="run-btn" :disabled="running">
        {{ running ? '测试中...' : '运行所有测试' }}
      </button>
    </div>

    <div class="test-results">
      <div v-for="(result, idx) in testResults" :key="idx" class="test-item" :class="result.status">
        <div class="test-header">
          <span class="test-icon">{{ result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⏳' }}</span>
          <span class="test-name">{{ result.name }}</span>
        </div>
        <div v-if="result.error" class="test-error">{{ result.error }}</div>
        <div v-if="result.log" class="test-log">{{ result.log }}</div>
      </div>
    </div>

    <div class="summary" v-if="testResults.length > 0">
      <div class="summary-item pass">✅ 通过：{{ passCount }}</div>
      <div class="summary-item fail">❌ 失败：{{ failCount }}</div>
      <div class="summary-item total">📊 总计：{{ testResults.length }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
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
  type SkillConfig,
} from '@/engine/skillEngine'
import { getElementMultiplier } from '@/types/skills'
import { chooseBestSkill } from '@/engine/enemyAI'

const running = ref(false)
const testResults = ref<Array<{ name: string; status: 'pass' | 'fail' | 'pending'; error?: string; log?: string }>>([])

const passCount = computed(() => testResults.value.filter(t => t.status === 'pass').length)
const failCount = computed(() => testResults.value.filter(t => t.status === 'fail').length)

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

// 测试辅助函数
function test(name: string, fn: () => void | string) {
  try {
    const result = fn()
    testResults.value.push({
      name,
      status: 'pass',
      log: typeof result === 'string' ? result : undefined,
    })
  } catch (error) {
    testResults.value.push({
      name,
      status: 'fail',
      error: error instanceof Error ? error.message : String(error),
    })
  }
}

// 断言函数
function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message)
  }
}

function assertInRange(value: number, min: number, max: number, message: string) {
  assert(value >= min && value <= max, `${message} - 期望在 ${min}-${max} 之间，实际：${value}`)
}

// ==================== 测试用例 ====================

function runAllTests() {
  running.value = true
  testResults.value = []

  // 1. 属性克制测试
  test('属性克制 - 火克制木', () => {
    const multiplier = getElementMultiplier('火', '木')
    assert(multiplier === 1.5, `期望 1.5，实际：${multiplier}`)
  })

  test('属性克制 - 木克制水', () => {
    const multiplier = getElementMultiplier('木', '水')
    assert(multiplier === 1.5, `期望 1.5，实际：${multiplier}`)
  })

  test('属性克制 - 水克制火', () => {
    const multiplier = getElementMultiplier('水', '火')
    assert(multiplier === 1.5, `期望 1.5，实际：${multiplier}`)
  })

  test('属性克制 - 光暗互相克制', () => {
    assert(getElementMultiplier('光', '暗') === 1.5, '光克暗失败')
    assert(getElementMultiplier('暗', '光') === 1.5, '暗克光失败')
  })

  test('属性克制 - 火被水克', () => {
    const multiplier = getElementMultiplier('火', '水')
    assert(multiplier === 0.8, `期望 0.8，实际：${multiplier}`)
  })

  // 2. 伤害计算测试
  test('伤害计算 - 基础伤害', () => {
    const attacker = createTestSpirit({ attack: 100 })
    const defender = createTestSpirit({ defense: 50 })
    const skill = createTestSkill(1.0)

    const damage = calculateDamage(attacker, defender, skill)
    // 基础伤害 = 100 * 1.0 - 50 * 0.5 = 75，考虑随机波动
    assertInRange(damage, 65, 85, '基础伤害')
  })

  test('伤害计算 - 克制时伤害增加', () => {
    const attacker = createTestSpirit({ element: '火', attack: 100 })
    const defender = createTestSpirit({ element: '木', defense: 50 })
    const skill = createTestSkill(1.0)

    const damage = calculateDamage(attacker, defender, skill)
    // 克制 1.5 倍，期望约 112
    assertInRange(damage, 100, 125, '克制伤害')
  })

  test('伤害计算 - 被克制时伤害减少', () => {
    const attacker = createTestSpirit({ element: '火', attack: 100 })
    const defender = createTestSpirit({ element: '水', defense: 50 })
    const skill = createTestSkill(1.0)

    const damage = calculateDamage(attacker, defender, skill)
    // 被克制 0.8 倍，期望约 60
    assertInRange(damage, 50, 70, '被克制伤害')
  })

  // 3. 治疗计算测试
  test('治疗计算 - 基础治疗', () => {
    const healer = createTestSpirit({ maxHp: 200 })
    const skill = createTestSkill(0, 0.3)

    const healing = calculateHealing(healer, skill)
    // 200 * 0.3 = 60
    assertInRange(healing, 50, 70, '治疗量')
  })

  // 4. 状态效果测试
  test('状态效果 - 施加灼烧', () => {
    const target = createTestSpirit()
    const effect = {
      type: 'burn' as const,
      probability: 1.0,
      duration: 3,
      damagePerTurn: 0.05,
      description: '灼烧',
    }

    const applied = applyStatusEffect(target, effect)
    assert(applied === true, '施加失败')
    assert(target.debuffs.length === 1, `期望 1 个 debuff，实际：${target.debuffs.length}`)
    assert(target.debuffs[0].effect.type === 'burn', '效果类型错误')
  })

  test('状态效果 - 概率触发（0% 概率）', () => {
    const target = createTestSpirit()
    const effect = {
      type: 'burn' as const,
      probability: 0.0,
      duration: 3,
      damagePerTurn: 0.05,
      description: '灼烧',
    }

    const applied = applyStatusEffect(target, effect)
    assert(applied === false, '0% 概率应该不触发')
  })

  test('状态效果 - DoT 伤害', () => {
    const target = createTestSpirit({ maxHp: 200, hp: 200 })
    const effect = {
      type: 'burn' as const,
      probability: 1.0,
      duration: 3,
      damagePerTurn: 0.05,
      description: '灼烧',
    }

    applyStatusEffect(target, effect)
    onTurnEnd(target)

    // 200 * 0.05 = 10 伤害
    assert(target.hp === 190, `期望 190 HP，实际：${target.hp}`)
  })

  test('状态效果 - 持续时间递减', () => {
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

    assert(target.debuffs[0].remainingTurns === 2, `期望 2 回合，实际：${target.debuffs[0].remainingTurns}`)
  })

  test('状态效果 - 到期移除', () => {
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

    assert(target.debuffs.length === 0, `期望 debuff 被移除，实际：${target.debuffs.length}`)
  })

  // 5. 冷却系统测试
  test('冷却系统 - 减少冷却', () => {
    const spirit = createTestSpirit({
      skills: [createTestSkill(1.5, 0, 3)],
    })

    spirit.skills[0].currentCooldown = 3
    reduceCooldowns(spirit)

    assert(spirit.skills[0].currentCooldown === 2, `期望 2，实际：${spirit.skills[0].currentCooldown}`)
  })

  test('冷却系统 - 冷却为 0 不减少', () => {
    const spirit = createTestSpirit({
      skills: [createTestSkill(1.5, 0, 0)],
    })

    reduceCooldowns(spirit)

    assert(spirit.skills[0].currentCooldown === 0, `期望 0，实际：${spirit.skills[0].currentCooldown}`)
  })

  // 6. 存活检查测试
  test('存活检查 - HP>0 存活', () => {
    const spirit = createTestSpirit({ hp: 1 })
    assert(isAlive(spirit) === true, '应该存活')
  })

  test('存活检查 - HP<=0 死亡', () => {
    const spirit = createTestSpirit({ hp: 0 })
    assert(isAlive(spirit) === false, '应该死亡')
  })

  // 7. AI 技能选择测试
  test('AI - 选择伤害最高的技能', () => {
    const attacker = createTestSpirit({
      skills: [
        createTestSkill(1.0, 0, 0, '弱技能'),
        createTestSkill(2.0, 0, 0, '强技能'),
      ],
    })

    const defender = createTestSpirit()
    const bestSkill = chooseBestSkill(attacker, defender)

    assert(bestSkill?.config.name === '强技能', `期望选择强技能，实际：${bestSkill?.config.name}`)
  })

  test('AI - HP 低时优先治疗', () => {
    const attacker = createTestSpirit({
      hp: 30,
      maxHp: 200,
      skills: [
        createTestSkill(1.5, 0, 0, '攻击'),
        createTestSkill(0, 0.5, 0, '治疗'),
      ],
    })

    const defender = createTestSpirit()
    const bestSkill = chooseBestSkill(attacker, defender)

    assert(bestSkill?.config.name === '治疗', `期望选择治疗，实际：${bestSkill?.config.name}`)
  })

  running.value = false
}

// 辅助函数：创建测试技能
function createTestSkill(damageMult: number = 1.0, healMult: number = 0, cooldown: number = 0, name: string = '测试技能'): SkillConfig {
  return {
    id: 'test',
    name,
    type: healMult > 0 ? 'active' : 'basic',
    target: healMult > 0 ? 'self' : 'enemy',
    unlockLevel: 1,
    damageMultiplier: damageMult > 0 ? damageMult : undefined,
    healingMultiplier: healMult > 0 ? healMult : undefined,
    cooldown,
    description: '测试技能',
  }
}
</script>

<style scoped>
.skill-test-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.run-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.run-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.run-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-results {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.test-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
}

.test-item.pass {
  border-color: #4ade80;
  background: rgba(74, 222, 128, 0.1);
}

.test-item.fail {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

.test-item.pending {
  border-color: #fbbf24;
  background: rgba(251, 191, 36, 0.1);
}

.test-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.test-icon {
  font-size: 16px;
}

.test-name {
  font-weight: 600;
  font-size: 14px;
}

.test-error {
  color: #f87171;
  font-size: 13px;
  margin-top: 8px;
  padding: 8px;
  background: rgba(248, 113, 113, 0.1);
  border-radius: 4px;
}

.test-log {
  color: #4ade80;
  font-size: 13px;
  margin-top: 8px;
}

.summary {
  display: flex;
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
}

.summary-item {
  font-size: 16px;
  font-weight: 600;
}

.summary-item.pass {
  color: #4ade80;
}

.summary-item.fail {
  color: #f87171;
}

.summary-item.total {
  color: #fbbf24;
}
</style>
