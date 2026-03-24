<template>
  <div class="battle-view">
    <!-- 战斗场景 -->
    <div v-if="inBattle" class="battle-scene safe-area">
      <!-- 顶部信息栏 -->
      <div class="battle-header">
        <button class="back-btn" @click="tryEscape">
          <span class="icon">←</span>
        </button>
        <div class="battle-info">
          <span class="enemy-name">{{ enemy?.name }}</span>
          <span class="turn-info">回合：{{ turnCount }}</span>
        </div>
        <div class="placeholder"></div>
      </div>

      <!-- 敌方区域 -->
      <div class="enemy-area">
        <div class="character enemy">
          <div class="sprite-container">
            <div class="character-sprite enemy-sprite">
              <v-icon :icon="getEnemyIcon()" size="80" color="error" />
            </div>
            <!-- 敌方状态效果 -->
            <div class="status-effects">
              <div
                v-for="(effect, idx) in enemyDebuffs"
                :key="idx"
                class="status-badge debuff"
                :title="getEffectDescription(effect)"
              >
                {{ getEffectIcon(effect.effect.type) }} {{ effect.remainingTurns }}
              </div>
            </div>
          </div>
          <div class="hp-bar enemy-hp">
            <div class="hp-text">
              {{ enemy?.name }} Lv.{{ enemy?.level }}
            </div>
            <v-progress-linear
              :model-value="enemyHpPercent"
              color="error"
              height="8"
              rounded
              class="hp-progress"
            />
            <div class="hp-value">{{ enemy?.hp }} / {{ enemy?.maxHp }}</div>
          </div>
        </div>
      </div>

      <!-- 战斗日志 -->
      <div class="battle-log">
        <div class="log-header">【战斗日志】</div>
        <div class="log-entries">
          <div
            v-for="(log, index) in displayLogs"
            :key="index"
            class="log-entry"
            :class="{ latest: index === displayLogs.length - 1 }"
          >
            {{ log }}
          </div>
        </div>
      </div>

      <!-- 玩家区域 -->
      <div class="player-area">
        <div class="character player">
          <div class="sprite-container">
            <div class="character-sprite player-sprite">
              <v-icon :icon="getPlayerIcon()" size="80" color="primary" />
            </div>
            <!-- 玩家状态效果 -->
            <div class="status-effects">
              <div
                v-for="(effect, idx) in playerBuffs"
                :key="idx"
                class="status-badge buff"
                :title="getEffectDescription(effect)"
              >
                {{ getEffectIcon(effect.effect.type) }} {{ effect.remainingTurns }}
              </div>
              <div
                v-for="(effect, idx) in playerDebuffs"
                :key="idx"
                class="status-badge debuff"
                :title="getEffectDescription(effect)"
              >
                {{ getEffectIcon(effect.effect.type) }} {{ effect.remainingTurns }}
              </div>
            </div>
          </div>
          <div class="hp-bar player-hp">
            <div class="hp-text">
              {{ playerSpirit?.name }} Lv.{{ playerSpirit?.level }}
            </div>
            <v-progress-linear
              :model-value="playerHpPercent"
              color="success"
              height="8"
              rounded
              class="hp-progress"
            />
            <div class="hp-value">{{ playerSpirit?.hp }} / {{ playerSpirit?.maxHp }}</div>
          </div>
        </div>
      </div>

      <!-- 技能操作区 -->
      <div class="skill-area" v-if="playerTurn && !battleResult">
        <!-- 第一排技能：普攻 + 技能 1 -->
        <div class="skill-row">
          <button
            v-for="skill in availableSkills.slice(0, 2)"
            :key="skill.config.id"
            class="skill-btn"
            :class="{
              disabled: !skill.available || skill.currentCooldown > 0,
              ultimate: skill.config.type === 'ultimate'
            }"
            :disabled="!skill.available || skill.currentCooldown > 0"
            @click="useSkill(skill)"
          >
            <div class="skill-icon">{{ getSkillIcon(skill.config.type) }}</div>
            <div class="skill-name">{{ skill.config.name }}</div>
            <div class="skill-cooldown" v-if="skill.currentCooldown > 0">
              {{ skill.currentCooldown }}
            </div>
          </button>
          <!-- 占位 -->
          <button v-if="availableSkills.length < 2" class="skill-btn placeholder" disabled></button>
        </div>

        <!-- 第二排技能：技能 2 + 技能 3 -->
        <div class="skill-row">
          <button
            v-for="skill in availableSkills.slice(2, 4)"
            :key="skill.config.id"
            class="skill-btn"
            :class="{
              disabled: !skill.available || skill.currentCooldown > 0,
              ultimate: skill.config.type === 'ultimate'
            }"
            :disabled="!skill.available || skill.currentCooldown > 0"
            @click="useSkill(skill)"
          >
            <div class="skill-icon">{{ getSkillIcon(skill.config.type) }}</div>
            <div class="skill-name">{{ skill.config.name }}</div>
            <div class="skill-cooldown" v-if="skill.currentCooldown > 0">
              {{ skill.currentCooldown }}
            </div>
          </button>
          <!-- 占位 -->
          <template v-if="availableSkills.length < 4">
            <button v-for="i in (4 - availableSkills.length)" :key="i" class="skill-btn placeholder" disabled></button>
          </template>
        </div>

        <!-- 终极技能（单独一排） -->
        <div class="skill-row ultimate-row" v-if="ultimateSkill">
          <button
            class="skill-btn ultimate"
            :class="{ disabled: ultimateSkill.currentCooldown > 0 }"
            :disabled="ultimateSkill.currentCooldown > 0"
            @click="useSkill(ultimateSkill)"
          >
            <div class="skill-icon">🌌</div>
            <div class="skill-name">
              {{ ultimateSkill.config.name }}
              <span class="cooldown-text">({{ ultimateSkill.currentCooldown }}/{{ ultimateSkill.config.cooldown }})</span>
            </div>
          </button>
        </div>

        <!-- 功能按钮 -->
        <div class="function-buttons">
          <button class="func-btn" @click="showSwitchModal = true">
            <span class="icon">🔄</span> 切换
          </button>
          <button class="func-btn" @click="showItemModal = true">
            <span class="icon">🎒</span> 道具
          </button>
          <button class="func-btn" @click="toggleAuto">
            <span class="icon">{{ autoBattle ? '⏸️' : '▶️' }}</span>
            {{ autoBattle ? '自动' : '手动' }}
          </button>
        </div>
      </div>

      <!-- 敌方回合提示 -->
      <div v-if="!playerTurn && !battleResult" class="enemy-turn-indicator">
        敌方回合...
      </div>

      <!-- 战斗结果弹窗 -->
      <div v-if="battleResult" class="battle-result-overlay" @click="handleResultClick">
        <div class="result-card" @click.stop>
          <div class="result-icon">
            <v-icon
              :icon="battleResult === 'victory' ? 'mdi-trophy' : 'mdi-skull-crossbones'"
              :color="battleResult === 'victory' ? '#FFD700' : '#666'"
              size="80"
            />
          </div>
          <h2 class="result-title">
            {{ battleResult === 'victory' ? '🎉 胜利！' : '💀 失败...' }}
          </h2>
          <div v-if="battleResult === 'victory'" class="reward-section">
            <div class="reward-item">
              <span class="reward-icon">💎</span>
              <span class="reward-amount">+{{ reward?.crystals }} 星能晶体</span>
            </div>
            <div class="reward-item" v-if="reward?.exp">
              <span class="reward-icon">📖</span>
              <span class="reward-amount">+{{ reward.exp }} 经验</span>
            </div>
          </div>
          <div class="battle-stats">
            <div class="stat-row">
              <span>回合数：</span>
              <span class="stat-value">{{ turnCount }}</span>
            </div>
            <div class="stat-row">
              <span>最高伤害：</span>
              <span class="stat-value">{{ maxDamage }} </span>
            </div>
          </div>
          <button class="continue-btn" @click="handleContinue">
            {{ battleResult === 'victory' ? '继续' : '再来一次' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 战斗外界面 -->
    <div v-else class="battle-lobby safe-area">
      <div class="lobby-header">
        <h1 class="title">星域对战</h1>
        <v-chip color="primary" size="small" variant="tonal">
          胜率：{{ winRate }}%
        </v-chip>
      </div>

      <!-- 战斗统计 -->
      <v-card class="stats-card" elevation="2">
        <v-card-text>
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-value">{{ totalBattles }}</div>
              <div class="stat-label">总战斗</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <div class="stat-value">{{ totalWins }}</div>
              <div class="stat-label">胜利</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <div class="stat-value">{{ winStreak }}</div>
              <div class="stat-label">连胜</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- 选择对手 -->
      <v-card class="selection-card" elevation="2">
        <v-card-title class="card-title">选择对手</v-card-title>
        <v-card-text>
          <div class="enemy-list">
            <div
              v-for="enemy in availableEnemies"
              :key="enemy.id"
              class="enemy-card"
              :class="{ selected: selectedEnemyId === enemy.id }"
              @click="selectedEnemyId = enemy.id"
            >
              <div class="enemy-info">
                <v-icon :icon="getEnemyIcon(enemy.id)" size="40" :color="getEnemyColor(enemy.id)" />
                <div class="enemy-details">
                  <div class="enemy-name">{{ enemy.name }}</div>
                  <div class="enemy-level">Lv.{{ enemy.level }}</div>
                </div>
                <v-chip color="error" size="small" variant="tonal">
                  ⭐{{ enemy.difficulty }}
                </v-chip>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- 出战星灵选择 -->
      <v-card class="selection-card" elevation="2">
        <v-card-title class="card-title">出战星灵</v-card-title>
        <v-card-text>
          <div class="spirit-list">
            <div
              v-for="spirit in availableSpirits"
              :key="spirit.id"
              class="spirit-card"
              :class="{ selected: selectedSpiritId === spirit.id }"
              @click="selectedSpiritId = spirit.id"
            >
              <div class="spirit-info">
                <v-icon icon="mdi-star" size="40" color="primary" />
                <div class="spirit-details">
                  <div class="spirit-name">{{ spirit.name }}</div>
                  <div class="spirit-level">Lv.{{ spirit.level }}</div>
                </div>
                <div class="spirit-hp">HP: {{ spirit.hp }}/{{ spirit.maxHp }}</div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- 开始战斗按钮 -->
      <button
        class="start-battle-btn"
        :disabled="!selectedSpiritId || !selectedEnemyId"
        @click="startBattle"
      >
        <span class="icon">⚔️</span> 开始战斗
      </button>
    </div>

    <!-- 切换星灵弹窗 -->
    <div v-if="showSwitchModal" class="modal-overlay" @click="showSwitchModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">选择上阵星灵</h3>
        <div class="switch-list">
          <div
            v-for="spirit in backupSpirits"
            :key="spirit.id"
            class="switch-item"
            :class="{ disabled: spirit.hp <= 0 }"
            @click="switchSpirit(spirit)"
          >
            <div class="spirit-info">
              <v-icon icon="mdi-star" size="32" color="primary" />
              <div class="spirit-details">
                <div class="spirit-name">{{ spirit.name }}</div>
                <div class="spirit-level">Lv.{{ spirit.level }} • HP: {{ spirit.hp }}/{{ spirit.maxHp }}</div>
              </div>
            </div>
          </div>
        </div>
        <button class="modal-close-btn" @click="showSwitchModal = false">取消</button>
      </div>
    </div>

    <!-- 道具弹窗 -->
    <div v-if="showItemModal" class="modal-overlay" @click="showItemModal = false">
      <div class="modal-content" @click.stop>
        <h3 class="modal-title">🎒 使用道具</h3>
        <div class="item-list">
          <div
            v-for="(count, itemId) in itemInventory"
            :key="itemId"
            class="item-item"
            :class="{ disabled: count <= 0 }"
            @click="useItemFn(getItemConfig(itemId))"
          >
            <span class="item-icon">{{ getItemIcon(itemId) }}</span>
            <div class="item-details">
              <div class="item-name">{{ getItemName(itemId) }}</div>
              <div class="item-desc">{{ getItemDescription(itemId) }}</div>
            </div>
            <span class="item-count">×{{ count }}</span>
          </div>
          <div v-if="Object.keys(itemInventory).length === 0" class="empty-message">
            没有道具
          </div>
        </div>
        <button class="modal-close-btn" @click="showItemModal = false">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { BattleSpirit, BattleEnemy, BattleReward } from '@/stores/battle'
import type { BattleSkill, BattleStatusEffect } from '@/engine/skillEngine'
import {
  useSkill,
  calculateDamage,
  onTurnEnd,
  reduceCooldowns,
  isAlive,
  getEffectName,
  createBattleSkill,
} from '@/engine/skillEngine'
import { SPIRIT_SKILLS } from '@/data/spiritSkills'
import { EXTRA_SPIRIT_SKILLS } from '@/data/extraSpiritSkills'
import { ENEMY_SKILLS } from '@/data/enemySkills'
import { useSpiritStore } from '@/stores/spirits'
import { chooseBestSkill, getAIDecisionLog } from '@/engine/enemyAI'
import { ITEMS, useItem, type ItemConfig } from '@/data/items'

// ==================== 状态定义 ====================

const inBattle = ref(false)
const playerSpirit = ref<BattleSpirit | null>(null)
const enemy = ref<BattleEnemy | null>(null)
const playerTurn = ref(true)
const battleResult = ref<'victory' | 'defeat' | null>(null)
const reward = ref<BattleReward | null>(null)
const turnCount = ref(0)
const maxDamage = ref(0)
const autoBattle = ref(false)

// 弹窗状态
const showSwitchModal = ref(false)
const showItemModal = ref(false)

// 道具库存（简化实现，后续从用户数据获取）
const itemInventory = ref<Record<string, number>>({
  'potion_small': 3,
  'potion_medium': 2,
  'antidote': 2,
  'awaken': 1,
  'smoke_bomb': 1,
})

// 战斗日志
const battleLogs = ref<string[]>([])
const displayLogs = computed(() => battleLogs.value.slice(-8))

// 选择状态
const selectedSpiritId = ref<string | null>(null)
const selectedEnemyId = ref<string | null>(null)

// ==================== 计算属性 ====================

const playerHpPercent = computed(() => {
  if (!playerSpirit.value) return 0
  return Math.round((playerSpirit.value.hp / playerSpirit.value.maxHp) * 100)
})

const enemyHpPercent = computed(() => {
  if (!enemy.value) return 0
  return Math.round((enemy.value.hp / enemy.value.maxHp) * 100)
})

const playerBuffs = computed(() => playerSpirit.value?.buffs || [])
const playerDebuffs = computed(() => playerSpirit.value?.debuffs || [])
const enemyDebuffs = computed(() => enemy.value?.debuffs || [])

// 可用技能（排除被动）
const availableSkills = computed(() => {
  if (!playerSpirit.value) return []
  return playerSpirit.value.skills.filter(s => s.config.type !== 'passive')
})

// 终极技能
const ultimateSkill = computed(() => {
  if (!playerSpirit.value) return null
  return playerSpirit.value.skills.find(s => s.config.type === 'ultimate') || null
})

// 后备星灵
const backupSpirits = computed(() => {
  if (!playerSpirit.value) return []
  return availableSpirits.value.filter(s => s.id !== playerSpirit.value?.id && s.hp > 0)
})

// 战斗统计
const totalBattles = ref(0)
const totalWins = ref(0)
const winStreak = ref(0)
const winRate = computed(() => {
  if (totalBattles.value === 0) return 0
  return Math.round((totalWins.value / totalBattles.value) * 100)
})

// ==================== 可用星灵列表 ====================

const availableSpirits = computed(() => {
  const spiritStore = useSpiritStore()
  
  // 从 spiritStore 获取已收集的星灵
  if (spiritStore.spirits && spiritStore.spirits.length > 0) {
    return spiritStore.spirits.map(spirit => {
      // 查找基础属性
      const spiritType = spiritStore.spiritTypes.find(t => t.id === spirit.id)
      const element = spiritType?.element || '光'
      
      // 根据等级和阶段计算属性
      const stageMultipliers = {
        seed: 1.0,
        grow: 1.2,
        mature: 1.5,
        cosmic: 2.0,
      }
      const multiplier = stageMultipliers[spirit.stage] || 1.0
      
      // 基础属性（根据等级）
      const baseHp = 100 + spirit.level * 20
      const baseAttack = 20 + spirit.level * 5
      const baseDefense = 10 + spirit.level * 3
      const baseSpeed = 15 + spirit.level * 2
      
      return {
        id: spirit.id,
        name: spirit.name,
        element: element as any,
        level: spirit.level,
        hp: Math.floor(baseHp * multiplier),
        maxHp: Math.floor(baseHp * multiplier),
        attack: Math.floor(baseAttack * multiplier),
        defense: Math.floor(baseDefense * multiplier),
        speed: Math.floor(baseSpeed * multiplier),
        stage: spirit.stage,
        skills: [],
        buffs: [],
        debuffs: [],
      } as BattleSpirit
    })
  }
  
  // 如果没有收集星灵，返回模拟数据（用于测试）
  return [
    {
      id: 'fire',
      name: '火焰星灵',
      element: '火' as any,
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
    } as BattleSpirit,
    {
      id: 'water',
      name: '流水星灵',
      element: '水' as any,
      level: 28,
      hp: 220,
      maxHp: 220,
      attack: 30,
      defense: 25,
      speed: 22,
      stage: 'grow',
      skills: [],
      buffs: [],
      debuffs: [],
    } as BattleSpirit,
    {
      id: 'thunder',
      name: '雷霆星灵',
      element: '雷' as any,
      level: 32,
      hp: 180,
      maxHp: 180,
      attack: 40,
      defense: 18,
      speed: 35,
      stage: 'grow',
      skills: [],
      buffs: [],
      debuffs: [],
    } as BattleSpirit,
  ]
})

// ==================== 可用敌人列表 ====================

const availableEnemies = ref([
  {
    id: 'shadow_minion',
    name: '暗影小兵',
    element: '暗' as any,
    level: 10,
    hp: 100,
    maxHp: 100,
    attack: 20,
    defense: 10,
    speed: 15,
    difficulty: 1,
    skills: [],
    debuffs: [],
    buffs: [],
    reward: { crystals: 10, exp: 20 },
  } as BattleEnemy,
  {
    id: 'shadow_knight',
    name: '暗影骑士',
    element: '暗' as any,
    level: 25,
    hp: 300,
    maxHp: 300,
    attack: 40,
    defense: 25,
    speed: 30,
    difficulty: 2,
    skills: [],
    debuffs: [],
    buffs: [],
    reward: { crystals: 30, exp: 60 },
  } as BattleEnemy,
  {
    id: 'void_demon_lord',
    name: '虚空魔王',
    element: '虚空' as any,
    level: 80,
    hp: 3000,
    maxHp: 3000,
    attack: 200,
    defense: 120,
    speed: 80,
    difficulty: 4,
    skills: [],
    debuffs: [],
    buffs: [],
    reward: { crystals: 100, exp: 500 },
  } as BattleEnemy,
])

// ==================== 战斗初始化 ====================

// 初始化星灵技能
function initSpiritSkills(spirit: BattleSpirit) {
  const skillsConfig = SPIRIT_SKILLS[spirit.id] || EXTRA_SPIRIT_SKILLS[spirit.id]
  if (!skillsConfig) {
    console.warn(`未找到星灵 ${spirit.id} 的技能配置`)
    return
  }

  // 根据等级解锁技能
  const unlockedSkills = skillsConfig.skills
    .filter(s => spirit.level >= s.unlockLevel)
    .map(s => createBattleSkill(s))

  spirit.skills = unlockedSkills
}

// 初始化敌人技能
function initEnemySkills(enemyData: BattleEnemy) {
  const skillsConfig = ENEMY_SKILLS[enemyData.id]
  if (!skillsConfig) {
    console.warn(`未找到敌人 ${enemyData.id} 的技能配置`)
    return
  }

  const skills = skillsConfig.skills.map(s => createBattleSkill(s))
  enemyData.skills = skills
}

// 开始战斗
function startBattle() {
  if (!selectedSpiritId.value || !selectedEnemyId.value) return

  const spiritData = availableSpirits.value.find(s => s.id === selectedSpiritId.value)
  const enemyData = availableEnemies.value.find(e => e.id === selectedEnemyId.value)

  if (!spiritData || !enemyData) return

  // 深拷贝并初始化
  playerSpirit.value = { ...spiritData }
  enemy.value = { ...enemyData }

  // 初始化技能
  initSpiritSkills(playerSpirit.value)
  initEnemySkills(enemy.value)
  
  // 初始化特殊机制字段
  playerSpirit.value.history = []
  playerSpirit.value.swallowStacks = 0
  playerSpirit.value.chaosDice = 0
  playerSpirit.value.chaosLuck = 0
  
  if (enemy.value) {
    enemy.value.history = []
    enemy.value.swallowStacks = 0
    enemy.value.chaosDice = 0
    enemy.value.chaosLuck = 0
  }

  // 重置状态
  inBattle.value = true
  playerTurn.value = playerSpirit.value.speed >= enemy.value.speed
  battleResult.value = null
  turnCount.value = 0
  maxDamage.value = 0
  battleLogs.value = []
  reward.value = null

  // 战斗开始日志
  addLog(`遭遇 ${enemy.value.name}！`)
  addLog(playerTurn.value ? '你的回合！' : '敌方先手！')

  // 如果敌方先手且非自动战斗，触发敌方行动
  if (!playerTurn.value && !autoBattle.value) {
    setTimeout(enemyAction, 1000)
  }
}

// ==================== 战斗逻辑 ====================

// 添加日志
function addLog(message: string) {
  battleLogs.value.push(message)
}

// 使用技能
function useSkill(skill: BattleSkill) {
  if (!playerSpirit.value || !enemy.value || !playerTurn.value) return
  if (skill.currentCooldown > 0) return

  turnCount.value++

  // 释放技能
  const result = useSkill(playerSpirit.value, enemy.value, skill)

  // 记录日志
  result.log.forEach(log => addLog(log))

  // 记录最高伤害
  if (result.damage && result.damage > maxDamage.value) {
    maxDamage.value = result.damage
  }

  // 检查胜利
  if (!isAlive(enemy.value)) {
    endBattle('victory')
    return
  }

  // 回合结束处理
  const endLogs = onTurnEnd(enemy.value, turnCount.value)
  endLogs.forEach(log => addLog(log))

  // 减少冷却
  reduceCooldowns(enemy.value)

  // 切换回合
  playerTurn.value = false

  // 敌方行动
  if (!battleResult.value) {
    setTimeout(enemyAction, 1000)
  }
}

// 敌方行动
function enemyAction() {
  if (!enemy.value || !playerSpirit.value || battleResult.value) return

  // 使用 AI 选择最佳技能
  const bestSkill = chooseBestSkill(enemy.value, playerSpirit.value)
  
  if (!bestSkill) {
    // 没有可用技能，跳过
    playerTurn.value = true
    addLog('敌方没有可用技能！')
    return
  }

  // 记录 AI 决策（调试用）
  // const aiLog = getAIDecisionLog(enemy.value, playerSpirit.value, bestSkill)
  // console.log(aiLog)

  // 释放技能
  const result = useSkill(enemy.value, playerSpirit.value, bestSkill)
  result.log.forEach(log => addLog(log))

  // 检查失败
  if (!isAlive(playerSpirit.value)) {
    endBattle('defeat')
    return
  }

  // 回合结束处理
  const endLogs = onTurnEnd(playerSpirit.value, turnCount.value)
  endLogs.forEach(log => addLog(log))

  // 减少冷却
  reduceCooldowns(playerSpirit.value)

  // 切换回合
  playerTurn.value = true
  addLog('你的回合！')
}

// 结束战斗
function endBattle(result: 'victory' | 'defeat') {
  battleResult.value = result
  inBattle.value = false

  totalBattles.value++
  if (result === 'victory') {
    totalWins.value++
    winStreak.value++
    reward.value = enemy.value?.reward || null
    addLog('🎉 胜利！')
    if (reward.value) {
      addLog(`获得奖励：${reward.value.crystals} 星能晶体，${reward.value.exp || 0} 经验`)
    }
  } else {
    winStreak.value = 0
    addLog('💀 失败...')
  }
}

// 使用道具
function useItemFn(item: ItemConfig) {
  if (!playerSpirit.value || !inBattle.value || !playerTurn.value) return
  if (!itemInventory.value[item.id] || itemInventory.value[item.id] <= 0) return
  
  // 检查目标
  let target: BattleSpirit | null = null
  if (item.target === 'self') {
    target = playerSpirit.value
  } else if (item.target === 'ally') {
    // 简化：对自己使用
    target = playerSpirit.value
  } else if (item.target === 'enemy' && enemy.value) {
    target = enemy.value
  }
  
  if (!target) return
  
  // 使用道具
  const result = useItem(item, target, playerSpirit.value)
  
  // 记录日志
  result.log.forEach(log => addLog(log))
  
  // 消耗道具
  if (result.consumed) {
    itemInventory.value[item.id]--
  }
  
  // 逃跑道具特殊处理
  if (item.effect.escape && result.success) {
    setTimeout(() => {
      tryEscape()
    }, 1000)
    return
  }
  
  // 切换回合（如果不是逃跑）
  if (!item.effect.escape) {
    playerTurn.value = false
    setTimeout(enemyAction, 1000)
  }
  
  showItemModal.value = false
}

// 切换星灵
function switchSpirit(newSpirit: BattleSpirit) {
  if (!playerSpirit.value || !enemy.value) return

  addLog(`切换 ${playerSpirit.value.name} 下场，${newSpirit.name} 上场！`)

  // 深拷贝新星灵并初始化技能
  playerSpirit.value = { ...newSpirit }
  initSpiritSkills(playerSpirit.value)

  showSwitchModal.value = false
  playerTurn.value = false

  // 切换消耗一回合
  setTimeout(enemyAction, 1000)
}

// 逃跑
function tryEscape() {
  if (!inBattle.value) return
  // 简单实现：直接返回
  inBattle.value = false
  playerSpirit.value = null
  enemy.value = null
  battleLogs.value = []
}

// 切换自动战斗
function toggleAuto() {
  autoBattle.value = !autoBattle.value
  if (autoBattle.value && playerTurn.value && inBattle.value) {
    autoBattleLoop()
  }
}

// 自动战斗循环
async function autoBattleLoop() {
  while (autoBattle.value && inBattle.value && playerTurn.value && !battleResult.value) {
    const skills = playerSpirit.value?.skills.filter(s => s.currentCooldown === 0 && s.config.type !== 'passive') || []
    if (skills.length > 0) {
      const bestSkill = skills.reduce((best, current) => {
        const bestDmg = best.config.damageMultiplier || 0
        const currDmg = current.config.damageMultiplier || 0
        return currDmg > bestDmg ? current : best
      })
      useSkill(bestSkill)
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
  }
}

// 处理结果点击
function handleResultClick() {
  // 点击背景关闭
}

// 继续
function handleContinue() {
  if (battleResult.value === 'victory') {
    // 胜利：返回
    inBattle.value = false
    playerSpirit.value = null
    enemy.value = null
    battleLogs.value = []
    battleResult.value = null
  } else {
    // 失败：重新开始
    startBattle()
  }
}

// ==================== 辅助函数 ====================

function getEnemyIcon(enemyId?: string) {
  const id = enemyId || enemy.value?.id
  const iconMap: Record<string, string> = {
    'shadow_minion': 'mdi-ghost',
    'shadow_knight': 'mdi-shield-cross',
    'void_demon_lord': 'mdi-crown',
  }
  return iconMap[id || ''] || 'mdi-skull-crossbones'
}

function getEnemyColor(enemyId?: string) {
  const id = enemyId || enemy.value?.id
  const colorMap: Record<string, string> = {
    'shadow_minion': 'grey',
    'shadow_knight': 'purple',
    'void_demon_lord': 'error',
  }
  return colorMap[id || ''] || 'grey'
}

function getPlayerIcon() {
  const element = playerSpirit.value?.element
  const iconMap: Record<string, string> = {
    '火': 'mdi-fire',
    '水': 'mdi-water',
    '木': 'mdi-tree',
    '雷': 'mdi-lightning-bolt',
    '暗': 'mdi-weather-night',
    '光': 'mdi-white-balance-sunny',
  }
  return iconMap[element || ''] || 'mdi-star'
}

function getSkillIcon(type: string) {
  const iconMap: Record<string, string> = {
    'basic': '⚔️',
    'active': '💥',
    'passive': '✨',
    'ultimate': '🌌',
  }
  return iconMap[type] || '⭐'
}

function getEffectIcon(type: string) {
  const iconMap: Record<string, string> = {
    'burn': '🔥',
    'poison': '☠️',
    'freeze': '❄️',
    'paralyze': '⚡',
    'stun': '😵',
    'bind': '⛓️',
    'weak': '😰',
    'corrode': '💔',
    'silence': '🔇',
    'attack_up': '⚔️',
    'defense_up': '🛡️',
    'speed_up': '💨',
    'shield': '🔮',
    'regen': '💖',
  }
  return iconMap[type] || '•'
}

function getEffectDescription(effect: BattleStatusEffect) {
  return `${getEffectName(effect.effect.type)} (${effect.remainingTurns}回合)`
}

function getItemConfig(itemId: string): ItemConfig {
  return ITEMS[itemId]
}

function getItemIcon(itemId: string): string {
  return ITEMS[itemId]?.icon || '📦'
}

function getItemName(itemId: string): string {
  return ITEMS[itemId]?.name || '未知道具'
}

function getItemDescription(itemId: string): string {
  return ITEMS[itemId]?.description || ''
}
</script>

<style scoped>
.safe-area {
  padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
}

.battle-view {
  min-height: 100vh;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  color: #fff;
}

/* ==================== 战斗场景 ==================== */

.battle-scene {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

/* 顶部信息栏 */
.battle-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 12px;
}

.back-btn {
  background: none;
  border: none;
  color: #fff;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
}

.battle-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.enemy-name {
  font-size: 16px;
  font-weight: 600;
}

.turn-info {
  font-size: 12px;
  color: #aaa;
}

.placeholder {
  width: 32px;
}

/* 角色区域 */
.enemy-area {
  display: flex;
  justify-content: flex-end;
}

.player-area {
  display: flex;
  justify-content: flex-start;
}

.character {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.sprite-container {
  position: relative;
}

.character-sprite {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

/* 状态效果 */
.status-effects {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  max-width: 120px;
}

.status-badge {
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
}

.status-badge.buff {
  border: 1px solid #4ade80;
  color: #4ade80;
}

.status-badge.debuff {
  border: 1px solid #f87171;
  color: #f87171;
}

/* HP 条 */
.hp-bar {
  width: 180px;
  text-align: center;
}

.hp-text {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 4px;
}

.hp-progress {
  border-radius: 4px;
}

.hp-value {
  font-size: 11px;
  color: #aaa;
  margin-top: 4px;
}

/* 战斗日志 */
.battle-log {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  padding: 12px;
  max-height: 120px;
  overflow-y: auto;
}

.log-header {
  font-size: 12px;
  color: #888;
  margin-bottom: 8px;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.log-entry {
  font-size: 12px;
  color: #ddd;
  padding: 2px 0;
}

.log-entry.latest {
  color: #ffd700;
  font-weight: 500;
}

/* ==================== 技能操作区 ==================== */

.skill-area {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 8px;
}

.skill-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.ultimate-row {
  margin-top: 4px;
}

.skill-btn {
  position: relative;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: 2px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  padding: 12px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-height: 70px;
}

.skill-btn:not(.disabled):hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.skill-btn.disabled {
  background: linear-gradient(135deg, #444 0%, #333 100%);
  border-color: rgba(255, 255, 255, 0.1);
  cursor: not-allowed;
  opacity: 0.6;
}

.skill-btn.ultimate {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  grid-column: span 2;
  min-height: 60px;
  flex-direction: row;
  justify-content: center;
  gap: 12px;
}

.skill-btn.placeholder {
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  cursor: default;
}

.skill-icon {
  font-size: 24px;
}

.skill-name {
  font-size: 13px;
  font-weight: 500;
  text-align: center;
}

.ultimate .skill-name {
  font-size: 15px;
  font-weight: 600;
}

.cooldown-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.8);
  margin-left: 4px;
}

.skill-cooldown {
  position: absolute;
  top: 4px;
  right: 4px;
  background: rgba(0, 0, 0, 0.7);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

/* 功能按钮 */
.function-buttons {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.func-btn {
  flex: 1;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  padding: 10px;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;
}

.func-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

/* 敌方回合提示 */
.enemy-turn-indicator {
  text-align: center;
  padding: 12px;
  background: rgba(248, 113, 113, 0.2);
  border-radius: 8px;
  color: #f87171;
  font-weight: 600;
}

/* ==================== 战斗结果 ==================== */

.battle-result-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  max-width: 320px;
  width: 90%;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.result-icon {
  margin-bottom: 16px;
}

.result-title {
  font-size: 28px;
  font-weight: 700;
  margin: 16px 0;
}

.reward-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 16px;
  margin: 16px 0;
}

.reward-item {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 16px;
  margin: 8px 0;
}

.reward-icon {
  font-size: 20px;
}

.reward-amount {
  color: #ffd700;
  font-weight: 600;
}

.battle-stats {
  text-align: left;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 12px;
  margin: 16px 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  font-size: 14px;
}

.stat-value {
  color: #ffd700;
  font-weight: 600;
}

.continue-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 12px;
  padding: 14px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

.continue-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* ==================== 战斗外界面 ==================== */

.battle-lobby {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  padding-bottom: calc(16px + env(safe-area-inset-bottom));
}

.lobby-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
}

.stats-card,
.selection-card {
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  padding: 16px !important;
  padding-bottom: 8px !important;
  color: #fff;
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #667eea;
}

.stat-label {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 50px;
  background: rgba(255, 255, 255, 0.1);
}

.enemy-list,
.spirit-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.enemy-card,
.spirit-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.enemy-card:hover,
.spirit-card:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  transform: translateX(4px);
}

.spirit-card.selected,
.enemy-card.selected {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.15);
}

.enemy-info,
.spirit-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.enemy-details,
.spirit-details {
  flex: 1;
}

.enemy-name,
.spirit-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.enemy-level,
.spirit-level {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.spirit-hp {
  font-size: 13px;
  color: #4ade80;
}

.start-battle-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
  border-radius: 16px;
  padding: 16px;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
  transition: all 0.2s;
}

.start-battle-btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.start-battle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ==================== 弹窗 ==================== */

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 20px;
  padding: 24px;
  max-width: 400px;
  width: 90%;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 16px 0;
  text-align: center;
  color: #fff;
}

.switch-list,
.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.switch-item,
.item-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.switch-item:not(.disabled):hover,
.item-item:not(.disabled):hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.1);
}

.switch-item.disabled,
.item-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.item-icon {
  font-size: 28px;
  margin-right: 12px;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 15px;
  font-weight: 600;
  color: #fff;
}

.item-desc {
  font-size: 12px;
  color: #888;
  margin-top: 2px;
}

.item-count {
  font-size: 14px;
  color: #ffd700;
  font-weight: 600;
}

.modal-close-btn {
  width: 100%;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 12px;
  padding: 12px;
  color: #fff;
  font-size: 15px;
  cursor: pointer;
  margin-top: 16px;
}

.modal-close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
