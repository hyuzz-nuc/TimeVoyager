<template>
  <div class="evolution-test-view">
    <div class="header">
      <h1>🧪 进化弹窗测试</h1>
      <button @click="showModal = true" class="open-btn">
        打开进化弹窗
      </button>
    </div>

    <!-- 测试星灵列表 -->
    <div class="test-spirits">
      <h2>可进化星灵（{{ canEvolveSpirits.length }}个）</h2>
      <div class="spirit-list">
        <div
          v-for="spirit in canEvolveSpirits"
          :key="spirit.id"
          class="spirit-item"
        >
          <v-icon :icon="getSpiritIcon(spirit.id)" size="32" :color="getElementColor(spirit.element)" />
          <div class="spirit-info">
            <div class="spirit-name">{{ spirit.name }}</div>
            <div class="spirit-detail">
              Lv.{{ spirit.level }} • {{ getStageName(spirit.stage) }}
              <span class="evolve-tag">可进化</span>
            </div>
          </div>
        </div>
        <div v-if="canEvolveSpirits.length === 0" class="empty-state">
          没有可进化的星灵（需要等级达标）
        </div>
      </div>
    </div>

    <!-- 测试日志 -->
    <div class="test-log">
      <h2>测试日志</h2>
      <div class="log-list">
        <div v-for="(log, idx) in logs" :key="idx" class="log-entry">
          <span class="log-time">{{ log.time }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </div>

    <!-- 进化弹窗 -->
    <EvolutionModal
      :visible="showModal"
      :spirits="canEvolveSpirits"
      @close="handleClose"
      @evolve="handleEvolve"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import EvolutionModal from './EvolutionModal.vue'
import type { Spirit, SpiritStage } from '@/stores/spirits'
import { STAGE_NAMES, STAGE_LEVELS } from '@/stores/spirits'

const showModal = ref(false)
const logs = ref<Array<{ time: string; message: string }>>([])

// 测试用星灵数据
const testSpirits = ref<Spirit[]>([
  {
    id: 'fire',
    name: '火焰星灵',
    element: '火',
    level: 20,
    exp: 2000,
    stage: 'seed',
    obtainedAt: Date.now(),
    favorite: false,
  },
  {
    id: 'water',
    name: '流水星灵',
    element: '水',
    level: 50,
    exp: 5000,
    stage: 'grow',
    obtainedAt: Date.now(),
    favorite: false,
  },
  {
    id: 'thunder',
    name: '雷霆星灵',
    element: '雷',
    level: 80,
    exp: 8000,
    stage: 'mature',
    obtainedAt: Date.now(),
    favorite: false,
  },
  {
    id: 'light',
    name: '光辉星灵',
    element: '光',
    level: 15,
    exp: 1500,
    stage: 'seed',
    obtainedAt: Date.now(),
    favorite: false,
  },
])

// 可进化的星灵
const canEvolveSpirits = computed(() => {
  return testSpirits.value.filter(spirit => {
    const evolutionOrder: SpiritStage[] = ['seed', 'grow', 'mature', 'cosmic']
    const currentIndex = evolutionOrder.indexOf(spirit.stage)
    return currentIndex < evolutionOrder.length - 1 && 
           spirit.level >= STAGE_LEVELS[spirit.stage][1]
  })
})

// 添加日志
function addLog(message: string) {
  const now = new Date()
  const time = now.toLocaleTimeString('zh-CN', { hour12: false })
  logs.value.push({ time, message })
}

// 处理关闭
function handleClose() {
  showModal.value = false
  addLog('弹窗已关闭')
}

// 处理进化
function handleEvolve(spirit: Spirit) {
  addLog(`开始进化：${spirit.name} (${spirit.stage})`)
  
  // 模拟进化
  setTimeout(() => {
    const evolutionOrder: SpiritStage[] = ['seed', 'grow', 'mature', 'cosmic']
    const currentIndex = evolutionOrder.indexOf(spirit.stage)
    const nextStage = evolutionOrder[currentIndex + 1]
    
    addLog(`✅ 进化成功：${spirit.name} → ${getStageName(nextStage)}`)
  }, 100)
}

// 辅助函数
function getSpiritIcon(id: string): string {
  const iconMap: Record<string, string> = {
    'fire': 'mdi-fire',
    'water': 'mdi-water',
    'thunder': 'mdi-lightning-bolt',
    'light': 'mdi-white-balance-sunny',
  }
  return iconMap[id] || 'mdi-star'
}

function getElementColor(element: string): string {
  const colorMap: Record<string, string> = {
    '火': '#ff4444',
    '水': '#4488ff',
    '雷': '#ffaa00',
    '光': '#ffdd44',
  }
  return colorMap[element] || '#8888ff'
}

function getStageName(stage: SpiritStage): string {
  return STAGE_NAMES[stage] || stage
}

// 初始化
addLog('测试页面加载完成')
addLog(`可进化星灵数量：${canEvolveSpirits.value.length}`)
</script>

<style scoped>
.evolution-test-view {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h1 {
  margin: 0;
  font-size: 24px;
}

.open-btn {
  background: linear-gradient(135deg, #00c8ff 0%, #00ffff 100%);
  border: none;
  border-radius: 12px;
  padding: 12px 24px;
  color: #000;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.open-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.4);
}

.test-spirits {
  margin-bottom: 24px;
}

.test-spirits h2 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #00c8ff;
}

.spirit-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.spirit-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(0, 200, 255, 0.05);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 12px;
}

.spirit-info {
  flex: 1;
}

.spirit-name {
  font-size: 16px;
  font-weight: 600;
  color: #fff;
}

.spirit-detail {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.evolve-tag {
  background: linear-gradient(135deg, #00c8ff, #00ffff);
  color: #000;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: #888;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
}

.test-log {
  margin-top: 24px;
}

.test-log h2 {
  font-size: 18px;
  margin-bottom: 12px;
  color: #00c8ff;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.log-entry {
  display: flex;
  gap: 12px;
  padding: 8px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  font-family: monospace;
  font-size: 13px;
}

.log-time {
  color: #00c8ff;
  min-width: 80px;
}

.log-message {
  color: #fff;
}
</style>
