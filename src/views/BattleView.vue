<template>
  <div class="battle-view">
    <!-- 战斗场景 -->
    <div v-if="battleStore.inBattle" class="battle-scene">
      <!-- 敌方区域 -->
      <div class="enemy-area">
        <div class="character enemy">
          <div class="hp-bar">
            <div class="hp-text">{{ battleStore.enemy?.name }} Lv.{{ battleStore.enemy?.level }}</div>
            <v-progress-linear
              :model-value="battleStore.enemyHpPercent"
              color="error"
              height="8"
              rounded
            />
            <div class="hp-value">{{ battleStore.enemy?.hp }} / {{ battleStore.enemy?.maxHp }}</div>
          </div>
          <div class="character-sprite enemy-sprite">
            <v-icon :icon="getEnemyIcon()" size="80" color="error" />
          </div>
        </div>
      </div>

      <!-- 战斗日志 -->
      <div class="battle-log">
        <div v-for="(log, index) in battleStore.battleLog.slice(-5)" :key="index" class="log-entry">
          {{ log }}
        </div>
      </div>

      <!-- 玩家区域 -->
      <div class="player-area">
        <div class="character player">
          <div class="character-sprite player-sprite">
            <v-icon icon="mdi-star" size="80" color="primary" />
          </div>
          <div class="hp-bar">
            <div class="hp-text">{{ battleStore.playerSpirit?.name }} Lv.{{ battleStore.playerSpirit?.level }}</div>
            <v-progress-linear
              :model-value="battleStore.playerHpPercent"
              color="success"
              height="8"
              rounded
            />
            <div class="hp-value">{{ battleStore.playerSpirit?.hp }} / {{ battleStore.playerSpirit?.maxHp }}</div>
          </div>
        </div>
      </div>

      <!-- 行动按钮 -->
      <div class="action-buttons" v-if="battleStore.playerTurn && !battleStore.battleResult">
        <v-btn
          color="error"
          size="x-large"
          rounded="xl"
          @click="useSkill(attackSkill)"
        >
          <v-icon icon="mdi-sword" class="mr-2" />
          攻击
        </v-btn>
        
        <v-btn
          color="blue"
          size="x-large"
          rounded="xl"
          @click="useSkill(defendSkill)"
        >
          <v-icon icon="mdi-shield" class="mr-2" />
          防御
        </v-btn>
        
        <v-btn
          color="purple"
          size="x-large"
          rounded="xl"
          @click="useSkill(skillSkill)"
        >
          <v-icon icon="mdi-star-shooting" class="mr-2" />
          技能
        </v-btn>
      </div>

      <!-- 战斗结果 -->
      <div v-if="battleStore.battleResult" class="battle-result">
        <v-card class="result-card" elevation="8">
          <v-card-text class="text-center">
            <v-icon
              :icon="battleStore.battleResult === 'victory' ? 'mdi-trophy' : 'mdi-skull-crossbones'"
              :color="battleStore.battleResult === 'victory' ? 'accent' : 'grey'"
              size="80"
            />
            <h2 class="result-title">
              {{ battleStore.battleResult === 'victory' ? '胜利！' : '失败...' }}
            </h2>
            <div v-if="battleStore.battleResult === 'victory'" class="reward-info">
              <v-icon icon="mdi-gem" color="accent" size="24" />
              <span class="reward-amount">+{{ battleStore.getBattleReward()?.crystals }} 星能晶体</span>
            </div>
            <v-btn
              color="primary"
              size="large"
              rounded="xl"
              class="mt-4"
              @click="battleStore.resetBattle()"
            >
              继续
            </v-btn>
          </v-card-text>
        </v-card>
      </div>
    </div>

    <!-- 战斗外界面 -->
    <div v-else class="battle-lobby">
      <div class="header safe-area-top">
        <h1 class="title">星域对战</h1>
        <v-chip color="primary" size="small" variant="tonal">
          胜率：{{ battleStore.winRate }}%
        </v-chip>
      </div>

      <!-- 战斗统计 -->
      <v-card class="stats-card" elevation="2">
        <v-card-text>
          <div class="stats-row">
            <div class="stat-item">
              <div class="stat-value">{{ battleStore.battleStats.totalBattles }}</div>
              <div class="stat-label">总战斗</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <div class="stat-value">{{ battleStore.battleStats.totalWins }}</div>
              <div class="stat-label">胜利</div>
            </div>
            <div class="stat-divider" />
            <div class="stat-item">
              <div class="stat-value">{{ battleStore.battleStats.winStreak }}</div>
              <div class="stat-label">连胜</div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- 选择对手 -->
      <v-card class="enemy-selection" elevation="2">
        <v-card-title class="card-title">选择对手</v-card-title>
        <v-card-text>
          <div class="enemy-list">
            <v-card
              v-for="enemy in availableEnemies"
              :key="enemy.id"
              class="enemy-card"
              variant="outlined"
              @click="startBattle(enemy)"
            >
              <v-card-text>
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
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <!-- 出战星灵选择 -->
      <v-card class="spirit-selection" elevation="2">
        <v-card-title class="card-title">出战星灵</v-card-title>
        <v-card-text>
          <div class="spirit-list">
            <v-card
              v-for="spirit in availableSpirits"
              :key="spirit.id"
              class="spirit-card"
              variant="outlined"
              :class="{ selected: selectedSpirit?.id === spirit.id }"
              @click="selectedSpirit = spirit"
            >
              <v-card-text>
                <div class="spirit-info">
                  <v-icon icon="mdi-star" size="40" color="primary" />
                  <div class="spirit-details">
                    <div class="spirit-name">{{ spirit.name }}</div>
                    <div class="spirit-level">Lv.{{ spirit.level }}</div>
                  </div>
                  <div class="spirit-hp">
                    HP: {{ spirit.hp }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </div>
        </v-card-text>
      </v-card>

      <!-- 开始战斗按钮 -->
      <v-btn
        color="primary"
        size="x-large"
        block
        rounded="xl"
        :disabled="!selectedSpirit"
        @click="startBattleWithSpirit"
      >
        <v-icon icon="mdi-sword" class="mr-2" />
        开始战斗
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useBattleStore, type BattleEnemy, type BattleSpirit, type BattleSkill } from '@/stores/battle'
import { useSpiritStore } from '@/stores/spirits'
import { useUserStore } from '@/stores/user'

const battleStore = useBattleStore()
const spiritStore = useSpiritStore()
const userStore = useUserStore()

const selectedSpirit = ref<BattleSpirit | null>(null)

// 可用星灵（从 Store 获取）
const availableSpirits = computed(() => {
  // TODO: 从 spiritStore 获取已收集的星灵
  return [
    {
      id: '1',
      name: '火焰星灵',
      level: 30,
      hp: 150,
      maxHp: 150,
      attack: 25,
      defense: 15,
      speed: 20,
      skills: [],
      stage: 'grow',
    } as BattleSpirit,
  ]
})

// 可用敌人
const availableEnemies = ref<BattleEnemy[]>([
  {
    id: 'shadow_minion',
    name: '暗影小兵',
    level: 5,
    hp: 50,
    maxHp: 50,
    attack: 10,
    defense: 5,
    speed: 10,
    difficulty: 1,
    skills: [
      { id: 'scratch', name: '暗影爪', type: 'attack', power: 100, cooldown: 0, currentCooldown: 0, description: '普通攻击' },
    ],
    reward: { crystals: 5, exp: 10 },
  } as BattleEnemy,
  {
    id: 'shadow_knight',
    name: '暗影骑士',
    level: 20,
    hp: 150,
    maxHp: 150,
    attack: 25,
    defense: 15,
    speed: 18,
    difficulty: 2,
    skills: [
      { id: 'slash', name: '暗影斩', type: 'attack', power: 120, cooldown: 0, currentCooldown: 0, description: '高伤害攻击' },
      { id: 'defend', name: '防御姿态', type: 'defend', power: 0, cooldown: 3, currentCooldown: 0, description: '提升防御' },
    ],
    reward: { crystals: 15, exp: 30 },
  } as BattleEnemy,
  {
    id: 'shadow_lord',
    name: '暗影领主',
    level: 50,
    hp: 500,
    maxHp: 500,
    attack: 50,
    defense: 35,
    speed: 30,
    difficulty: 3,
    skills: [
      { id: 'storm', name: '暗影风暴', type: 'attack', power: 150, cooldown: 0, currentCooldown: 0, description: '群体伤害' },
      { id: 'pact', name: '黑暗契约', type: 'skill', power: 0, cooldown: 5, currentCooldown: 0, description: '牺牲 HP 提升攻击' },
    ],
    reward: { crystals: 50, exp: 100 },
  } as BattleEnemy,
])

// 技能定义
const attackSkill: BattleSkill = {
  id: 'attack',
  name: '攻击',
  type: 'attack',
  power: 100,
  cooldown: 0,
  currentCooldown: 0,
  description: '普通攻击',
}

const defendSkill: BattleSkill = {
  id: 'defend',
  name: '防御',
  type: 'defend',
  cooldown: 2,
  currentCooldown: 0,
  description: '减少受到的伤害',
}

const skillSkill: BattleSkill = {
  id: 'skill',
  name: '星灵技能',
  type: 'skill',
  power: 150,
  cooldown: 3,
  currentCooldown: 0,
  description: '强力技能',
}

const getEnemyIcon = (enemyId?: string) => {
  if (!enemyId) return 'mdi-skull-crossbones'
  const iconMap: Record<string, string> = {
    'shadow_minion': 'mdi-ghost',
    'shadow_knight': 'mdi-shield-cross',
    'shadow_lord': 'mdi-crown',
  }
  return iconMap[enemyId] || 'mdi-skull-crossbones'
}

const getEnemyColor = (enemyId?: string) => {
  if (!enemyId) return 'grey'
  const colorMap: Record<string, string> = {
    'shadow_minion': 'grey',
    'shadow_knight': 'purple',
    'shadow_lord': 'error',
  }
  return colorMap[enemyId] || 'grey'
}

const startBattleWithSpirit = () => {
  if (!selectedSpirit.value) return
  // 默认挑战第一个敌人
  startBattle(availableEnemies.value[0])
}

const startBattle = (enemy: BattleEnemy) => {
  if (!selectedSpirit.value) return
  battleStore.startBattle(selectedSpirit.value, enemy)
}

const useSkill = (skill: BattleSkill) => {
  battleStore.playerAttack(skill)
}
</script>

<style scoped>
.battle-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + 64px);
}

/* 战斗场景 */
.battle-scene {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

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
  gap: var(--spacing-sm);
}

.character-sprite {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
}

.hp-bar {
  width: 200px;
  text-align: center;
}

.hp-text {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
}

.hp-value {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

/* 战斗日志 */
.battle-log {
  background: var(--bg-card);
  border-radius: var(--border-radius);
  padding: var(--spacing-md);
  max-height: 150px;
  overflow-y: auto;
}

.log-entry {
  font-size: 13px;
  padding: 2px 0;
  border-bottom: 1px solid var(--border);
}

.log-entry:last-child {
  border-bottom: none;
}

/* 行动按钮 */
.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

/* 战斗结果 */
.battle-result {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.result-card {
  width: 300px;
}

.result-title {
  font-size: 24px;
  font-weight: 700;
  margin: var(--spacing-md) 0;
}

.reward-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: 18px;
  font-weight: 600;
}

.reward-amount {
  color: var(--accent);
}

/* 战斗外界面 */
.battle-lobby {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.header {
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
.enemy-selection,
.spirit-selection {
  border-radius: var(--border-radius-lg);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  padding: var(--spacing-md) !important;
  padding-bottom: var(--spacing-sm) !important;
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
  font-size: 24px;
  font-weight: 700;
  color: var(--primary);
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
}

.enemy-list,
.spirit-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.enemy-card,
.spirit-card {
  cursor: pointer;
  transition: all 0.2s;
}

.enemy-card:hover,
.spirit-card:hover {
  transform: translateX(4px);
  border-color: var(--primary);
}

.spirit-card.selected {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.enemy-info,
.spirit-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.enemy-details,
.spirit-details {
  flex: 1;
}

.enemy-name,
.spirit-name {
  font-size: 16px;
  font-weight: 600;
}

.enemy-level,
.spirit-level {
  font-size: 12px;
  color: var(--text-secondary);
}

.spirit-hp {
  font-size: 14px;
  color: var(--text-secondary);
}
</style>
