<template>
  <div v-if="visible" class="evolution-modal-overlay" @click="handleBackdropClick">
    <div class="evolution-modal" @click.stop>
      <!-- 背景能量场 -->
      <div class="energy-field">
        <div class="energy-ring ring-1"></div>
        <div class="energy-ring ring-2"></div>
        <div class="energy-ring ring-3"></div>
      </div>

      <!-- 顶部标题 -->
      <div class="modal-header">
        <div class="header-line line-left"></div>
        <h2 class="modal-title">
          <span class="title-icon">⚡</span>
          等级突破
          <span class="title-icon">⚡</span>
        </h2>
        <div class="header-line line-right"></div>
      </div>

      <!-- 星灵展示区 -->
      <div class="spirit-showcase">
        <!-- 左箭头 -->
        <button class="nav-arrow arrow-left" @click="previousSpirit" :disabled="spiritIndex <= 0">
          <svg viewBox="0 0 24 24" class="arrow-icon">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
          <div class="arrow-glow"></div>
        </button>

        <!-- 星灵全息投影 -->
        <div class="hologram-container">
          <div class="hologram-frame">
            <div class="frame-corner top-left"></div>
            <div class="frame-corner top-right"></div>
            <div class="frame-corner bottom-left"></div>
            <div class="frame-corner bottom-right"></div>
          </div>
          
          <div class="spirit-display">
            <!-- 星灵图标 -->
            <div class="spirit-icon-wrapper">
              <v-icon :icon="spiritIcon" size="120" :color="elementColor" class="spirit-icon" />
              <div class="icon-glow"></div>
            </div>
            
            <!-- 等级显示 -->
            <div class="level-display">
              <div class="level-label">LEVEL</div>
              <div class="level-value">{{ spirit.level }}</div>
              <div class="level-bar">
                <div class="level-progress" :style="{ width: expProgress + '%' }"></div>
              </div>
              <div class="exp-text">{{ spirit.exp }} / {{ expNeeded }}</div>
            </div>
          </div>

          <!-- 扫描光效 -->
          <div class="scan-line"></div>
        </div>

        <!-- 右箭头 -->
        <button class="nav-arrow arrow-right" @click="nextSpirit" :disabled="spiritIndex >= canEvolveSpirits.length - 1">
          <svg viewBox="0 0 24 24" class="arrow-icon">
            <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" fill="none" />
          </svg>
          <div class="arrow-glow"></div>
        </button>
      </div>

      <!-- 星灵信息 -->
      <div class="spirit-info-panel">
        <div class="info-row">
          <span class="info-label">星灵名称</span>
          <span class="info-value">{{ spirit.name }}</span>
        </div>
        <div class="info-row">
          <span class="info-label">当前阶段</span>
          <span class="info-value stage-badge" :class="spirit.stage">
            {{ getStageName(spirit.stage) }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">下一阶段</span>
          <span class="info-value next-stage">
            {{ getNextStageName(spirit.stage) }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">突破条件</span>
          <span class="info-value">
            Lv.{{ getStageMaxLevel(spirit.stage) }}
            <span v-if="spirit.level >= getStageMaxLevel(spirit.stage)" class="condition-met">✓ 已达成</span>
          </span>
        </div>
      </div>

      <!-- 进化材料 -->
      <div class="evolution-materials">
        <h3 class="materials-title">所需材料</h3>
        <div class="materials-list">
          <div class="material-item" :class="{ 'not-enough': !canAffordMaterial('evolutionStone') }">
            <div class="material-icon">💎</div>
            <div class="material-info">
              <div class="material-name">进化石</div>
              <div class="material-amount">×{{ evolutionCost?.evolutionStone || 0 }}</div>
            </div>
            <div class="material-status" :class="{ owned: hasMaterial('evolutionStone') }">
              {{ hasMaterial('evolutionStone') ? '✓' : '✕' }} {{ spiritStore.materials.evolutionStone }}
            </div>
          </div>
          <div class="material-item" :class="{ 'not-enough': !canAffordMaterial('crystals') }">
            <div class="material-icon">✨</div>
            <div class="material-info">
              <div class="material-name">星能晶体</div>
              <div class="material-amount">×{{ evolutionCost?.crystals || 0 }}</div>
            </div>
            <div class="material-status" :class="{ owned: hasMaterial('crystals') }">
              {{ hasMaterial('crystals') ? '✓' : '✕' }} {{ spiritStore.materials.crystals }}
            </div>
          </div>
          <div v-if="evolutionCost?.essence" class="material-item" :class="{ 'not-enough': !canAffordMaterial('essence') }">
            <div class="material-icon">🌟</div>
            <div class="material-info">
              <div class="material-name">属性精华</div>
              <div class="material-amount">×{{ evolutionCost.essence }}</div>
            </div>
            <div class="material-status" :class="{ owned: hasMaterial('essence') }">
              {{ hasMaterial('essence') ? '✓' : '✕' }} {{ spiritStore.materials.essence }}
            </div>
          </div>
          <div v-if="evolutionCost?.legendFragment" class="material-item" :class="{ 'not-enough': !canAffordMaterial('legendFragment') }">
            <div class="material-icon">💎</div>
            <div class="material-info">
              <div class="material-name">传说碎片</div>
              <div class="material-amount">×{{ evolutionCost.legendFragment }}</div>
            </div>
            <div class="material-status" :class="{ owned: hasMaterial('legendFragment') }">
              {{ hasMaterial('legendFragment') ? '✓' : '✕' }} {{ spiritStore.materials.legendFragment }}
            </div>
          </div>
        </div>
        <div v-if="evolutionError" class="error-message">⚠️ {{ evolutionError }}</div>
      </div>

      <!-- 底部按钮 -->
      <div class="modal-footer">
        <button class="btn btn-cancel" @click="handleCancel">
          <span class="btn-icon">✕</span>
          取消
        </button>
        <button class="btn btn-evolve" @click="handleEvolve" :disabled="!canEvolve">
          <span class="btn-icon">⚡</span>
          {{ canEvolve ? (materialsEnough ? '开始进化' : '材料不足') : '等级不足' }}
          <div class="btn-glow"></div>
        </button>
      </div>

      <!-- 进化动画 -->
      <div v-if="isEvolving" class="evolution-animation-overlay">
        <div class="evolution-energy"></div>
        <div class="evolution-text">进化中...</div>
        <div class="evolution-progress">
          <div class="progress-bar"></div>
        </div>
      </div>

      <!-- 进化完成 -->
      <div v-if="evolutionComplete" class="evolution-complete-overlay">
        <div class="complete-content">
          <div class="complete-icon">✨</div>
          <h2 class="complete-title">进化完成！</h2>
          <div class="complete-info">
            <div class="spirit-name">{{ spirit.name }}</div>
            <div class="stage-change">
              {{ getStageName(spirit.stage) }} → {{ getNextStageName(spirit.stage) }}
            </div>
          </div>
          <button class="btn btn-confirm" @click="handleComplete">
            确认
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import type { Spirit, SpiritStage } from '@/stores/spirits'
import { STAGE_NAMES, STAGE_LEVELS } from '@/stores/spirits'
import { getEvolutionCost, getNextStage } from '@/data/evolution'
import { useSpiritStore } from '@/stores/spirits'

interface Props {
  visible: boolean
  spirits: Spirit[]
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  evolve: [spirit: Spirit]
}>()

const spiritStore = useSpiritStore()
const spiritIndex = ref(0)
const isEvolving = ref(false)
const evolutionComplete = ref(false)
const evolutionError = ref<string | null>(null)

// 可以进化的星灵
const canEvolveSpirits = computed(() => {
  return props.spirits.filter(spirit => {
    const evolutionOrder: SpiritStage[] = ['seed', 'grow', 'mature', 'cosmic']
    const currentIndex = evolutionOrder.indexOf(spirit.stage)
    return currentIndex < evolutionOrder.length - 1 && spirit.level >= STAGE_LEVELS[spirit.stage][1]
  })
})

// 当前星灵
const spirit = computed(() => {
  return canEvolveSpirits.value[spiritIndex.value] || null
})

// 是否可以进化
const canEvolve = computed(() => {
  return spirit.value !== null && materialsEnough.value
})

// 材料是否足够
const materialsEnough = computed(() => {
  if (!evolutionCost.value) return false
  return (
    spiritStore.materials.evolutionStone >= evolutionCost.value.evolutionStone &&
    spiritStore.materials.crystals >= evolutionCost.value.crystals &&
    (!evolutionCost.value.essence || spiritStore.materials.essence >= evolutionCost.value.essence) &&
    (!evolutionCost.value.legendFragment || spiritStore.materials.legendFragment >= evolutionCost.value.legendFragment)
  )
})

// 进化消耗
const evolutionCost = computed(() => {
  if (!spirit.value) return null
  return getEvolutionCost(spirit.value.stage)
})

// 经验进度
const expProgress = computed(() => {
  if (!spirit.value) return 0
  const expNeeded = spirit.value.level * 100
  return Math.min(100, (spirit.value.exp / expNeeded) * 100)
})

const expNeeded = computed(() => {
  if (!spirit.value) return 0
  return spirit.value.level * 100
})

// 图标和颜色
const spiritIcon = computed(() => {
  const iconMap: Record<string, string> = {
    'fire': 'mdi-fire',
    'water': 'mdi-water',
    'wood': 'mdi-tree',
    'thunder': 'mdi-lightning-bolt',
    'dark': 'mdi-weather-night',
    'light': 'mdi-white-balance-sunny',
    'star': 'mdi-star',
    'moon': 'mdi-moon-waning-crescent',
    'comet': 'mdi-weather-hail',
    'meteor': 'mdi-weather-hail',
    'nebula': 'mdi-weather-cloudy',
    'galaxy': 'mdi-weather-hail',
    'blackhole': 'mdi-weather-hail',
    'aurora': 'mdi-weather-hail',
    'cosmos': 'mdi-weather-hail',
    'time': 'mdi-clock-outline',
    'focus': 'mdi-target',
    'energy': 'mdi-flash',
  }
  return iconMap[spirit.value?.id || ''] || 'mdi-star'
})

const elementColor = computed(() => {
  const colorMap: Record<string, string> = {
    '火': '#ff4444',
    '水': '#4488ff',
    '木': '#44ff44',
    '雷': '#ffaa00',
    '暗': '#aa44ff',
    '光': '#ffdd44',
    '星': '#8888ff',
    '时': '#ff44ff',
    '能': '#44ffff',
  }
  const element = spirit.value?.element || ''
  return colorMap[element] || '#8888ff'
})

// 切换星灵
function previousSpirit() {
  if (spiritIndex.value > 0) {
    spiritIndex.value--
    resetAnimation()
  }
}

function nextSpirit() {
  if (spiritIndex.value < canEvolveSpirits.value.length - 1) {
    spiritIndex.value++
    resetAnimation()
  }
}

// 获取阶段名称
function getStageName(stage: SpiritStage): string {
  return STAGE_NAMES[stage] || stage
}

function getNextStageName(stage: SpiritStage): string {
  const evolutionOrder: SpiritStage[] = ['seed', 'grow', 'mature', 'cosmic']
  const currentIndex = evolutionOrder.indexOf(stage)
  if (currentIndex < evolutionOrder.length - 1) {
    return STAGE_NAMES[evolutionOrder[currentIndex + 1]]
  }
  return '完全体'
}

function getStageMaxLevel(stage: SpiritStage): number {
  return STAGE_LEVELS[stage][1]
}

// 材料检查
function hasMaterial(type: string): boolean {
  if (!evolutionCost.value) return false
  if (type === 'evolutionStone') return spiritStore.materials.evolutionStone >= (evolutionCost.value.evolutionStone || 0)
  if (type === 'crystals') return spiritStore.materials.crystals >= (evolutionCost.value.crystals || 0)
  if (type === 'essence') return spiritStore.materials.essence >= (evolutionCost.value.essence || 0)
  if (type === 'legendFragment') return spiritStore.materials.legendFragment >= (evolutionCost.value.legendFragment || 0)
  return false
}

function canAffordMaterial(type: string): boolean {
  return hasMaterial(type)
}

// 重置动画
function resetAnimation() {
  isEvolving.value = false
  evolutionComplete.value = false
}

// 处理取消
function handleCancel() {
  emit('close')
}

// 处理进化
function handleEvolve() {
  if (!spirit.value || !canEvolve.value) return
  
  evolutionError.value = null
  isEvolving.value = true
  
  // 调用进化 API
  const result = spiritStore.evolveSpirit(spirit.value.id)
  
  // 模拟进化动画（2 秒）
  setTimeout(() => {
    isEvolving.value = false
    
    if (result.success) {
      evolutionComplete.value = true
    } else {
      evolutionError.value = result.error || '进化失败'
    }
  }, 2000)
}

// 处理完成
function handleComplete() {
  if (spirit.value) {
    emit('evolve', spirit.value)
  }
  evolutionComplete.value = false
  emit('close')
}

// 背景点击
function handleBackdropClick() {
  if (!isEvolving.value) {
    emit('close')
  }
}

// 监听可见性变化
watch(() => props.visible, (newVal) => {
  if (!newVal) {
    resetAnimation()
    spiritIndex.value = 0
  }
})
</script>

<style scoped>
/* ==================== 基础样式 ==================== */

.evolution-modal-overlay {
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
  backdrop-filter: blur(8px);
}

.evolution-modal {
  position: relative;
  background: linear-gradient(135deg, rgba(10, 10, 30, 0.95) 0%, rgba(20, 20, 50, 0.95) 100%);
  border: 2px solid rgba(0, 200, 255, 0.3);
  border-radius: 20px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 
    0 0 40px rgba(0, 200, 255, 0.2),
    inset 0 0 20px rgba(0, 200, 255, 0.1);
}

/* ==================== 背景能量场 ==================== */

.energy-field {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  border-radius: 20px;
  pointer-events: none;
}

.energy-ring {
  position: absolute;
  border: 2px solid rgba(0, 200, 255, 0.1);
  border-radius: 50%;
  animation: rotate 20s linear infinite;
}

.ring-1 {
  width: 400px;
  height: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.ring-2 {
  width: 300px;
  height: 300px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-direction: reverse;
  animation-duration: 15s;
}

.ring-3 {
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-duration: 10s;
}

@keyframes rotate {
  from { transform: translate(-50%, -50%) rotate(0deg); }
  to { transform: translate(-50%, -50%) rotate(360deg); }
}

/* ==================== 顶部标题 ==================== */

.modal-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 24px;
}

.header-line {
  flex: 1;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.5), transparent);
}

.modal-title {
  font-size: 24px;
  font-weight: 700;
  color: #00c8ff;
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}

.title-icon {
  font-size: 20px;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.7; transform: scale(1.1); }
}

/* ==================== 星灵展示区 ==================== */

.spirit-showcase {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}

.nav-arrow {
  width: 48px;
  height: 48px;
  background: rgba(0, 200, 255, 0.1);
  border: 2px solid rgba(0, 200, 255, 0.3);
  border-radius: 50%;
  color: #00c8ff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.nav-arrow:not(:disabled):hover {
  background: rgba(0, 200, 255, 0.2);
  border-color: #00c8ff;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.4);
  transform: scale(1.1);
}

.nav-arrow:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.arrow-icon {
  width: 24px;
  height: 24px;
}

.arrow-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(0, 200, 255, 0.3), transparent);
  animation: arrow-glow 3s ease-in-out infinite;
}

@keyframes arrow-glow {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: -100%; }
}

/* 全息投影容器 */

.hologram-container {
  position: relative;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hologram-frame {
  position: absolute;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.frame-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid #00c8ff;
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}

.frame-corner.top-left {
  top: 0;
  left: 0;
  border-right: none;
  border-bottom: none;
}

.frame-corner.top-right {
  top: 0;
  right: 0;
  border-left: none;
  border-bottom: none;
}

.frame-corner.bottom-left {
  bottom: 0;
  left: 0;
  border-right: none;
  border-top: none;
}

.frame-corner.bottom-right {
  bottom: 0;
  right: 0;
  border-left: none;
  border-top: none;
}

.spirit-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spirit-icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spirit-icon {
  filter: drop-shadow(0 0 20px currentColor);
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.icon-glow {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 200, 255, 0.3) 0%, transparent 70%);
  animation: glow-pulse 2s ease-in-out infinite;
}

@keyframes glow-pulse {
  0%, 100% { opacity: 0.5; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* 等级显示 */

.level-display {
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(0, 200, 255, 0.3);
  border-radius: 12px;
  padding: 12px 24px;
  min-width: 120px;
}

.level-label {
  font-size: 10px;
  color: #888;
  letter-spacing: 2px;
  margin-bottom: 4px;
}

.level-value {
  font-size: 32px;
  font-weight: 700;
  color: #00c8ff;
  font-family: 'Orbitron', monospace;
  text-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
  line-height: 1;
}

.level-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 200, 255, 0.2);
  border-radius: 2px;
  margin: 8px 0 4px;
  overflow: hidden;
}

.level-progress {
  height: 100%;
  background: linear-gradient(90deg, #00c8ff, #00ffff);
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
  transition: width 0.3s;
}

.exp-text {
  font-size: 11px;
  color: #888;
}

/* 扫描光效 */

.scan-line {
  position: absolute;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, #00c8ff, transparent);
  animation: scan 3s linear infinite;
  box-shadow: 0 0 10px rgba(0, 200, 255, 0.5);
}

@keyframes scan {
  0% { top: 0; opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { top: 100%; opacity: 0; }
}

/* ==================== 信息面板 ==================== */

.spirit-info-panel {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(0, 200, 255, 0.1);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-size: 13px;
  color: #888;
}

.info-value {
  font-size: 14px;
  color: #fff;
  font-weight: 600;
}

.stage-badge {
  padding: 4px 12px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(0, 200, 255, 0.2);
  border: 1px solid rgba(0, 200, 255, 0.3);
  color: #00c8ff;
}

.next-stage {
  color: #00ffff;
}

.condition-met {
  color: #44ff44;
  margin-left: 8px;
  font-size: 12px;
}

/* ==================== 进化材料 ==================== */

.evolution-materials {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(0, 200, 255, 0.2);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.materials-title {
  font-size: 14px;
  color: #00c8ff;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.materials-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.material-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  background: rgba(0, 200, 255, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(0, 200, 255, 0.1);
}

.material-icon {
  font-size: 24px;
}

.material-info {
  flex: 1;
}

.material-name {
  font-size: 13px;
  color: #fff;
  font-weight: 600;
}

.material-amount {
  font-size: 12px;
  color: #888;
}

.material-status {
  font-size: 12px;
  color: #44ff44;
  padding: 4px 8px;
  background: rgba(68, 255, 68, 0.1);
  border-radius: 4px;
}

/* ==================== 底部按钮 ==================== */

.modal-footer {
  display: flex;
  gap: 12px;
}

.btn {
  flex: 1;
  padding: 14px 24px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
  border: 2px solid rgba(255, 255, 255, 0.2);
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.2);
}

.btn-evolve {
  background: linear-gradient(135deg, #00c8ff 0%, #00ffff 100%);
  color: #000;
  border: 2px solid rgba(0, 200, 255, 0.5);
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.3);
}

.btn-evolve:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.5);
}

.btn-evolve:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(100%);
}

.btn-icon {
  font-size: 18px;
}

.btn-glow {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  animation: btn-glow 3s ease-in-out infinite;
}

@keyframes btn-glow {
  0% { left: -100%; }
  50% { left: 100%; }
  100% { left: -100%; }
}

/* ==================== 进化动画 ==================== */

.evolution-animation-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  z-index: 10;
}

.evolution-energy {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(0, 200, 255, 0.8) 0%, transparent 70%);
  animation: energy-expand 2s ease-out forwards;
}

@keyframes energy-expand {
  0% { transform: scale(0); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.evolution-text {
  margin-top: 24px;
  font-size: 20px;
  color: #00c8ff;
  letter-spacing: 2px;
  animation: text-pulse 1s ease-in-out infinite;
}

@keyframes text-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.evolution-progress {
  width: 200px;
  height: 4px;
  background: rgba(0, 200, 255, 0.2);
  border-radius: 2px;
  margin-top: 16px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #00c8ff, #00ffff);
  animation: progress-fill 2s ease-out forwards;
}

@keyframes progress-fill {
  0% { width: 0; }
  100% { width: 100%; }
}

/* ==================== 进化完成 ==================== */

.evolution-complete-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  z-index: 10;
}

.complete-content {
  text-align: center;
  padding: 32px;
}

.complete-icon {
  font-size: 64px;
  animation: bounce 0.5s ease-out;
}

@keyframes bounce {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.complete-title {
  font-size: 28px;
  color: #00c8ff;
  margin: 16px 0;
  text-shadow: 0 0 20px rgba(0, 200, 255, 0.5);
}

.complete-info {
  margin-bottom: 24px;
}

.spirit-name {
  font-size: 20px;
  color: #fff;
  font-weight: 700;
  margin-bottom: 8px;
}

.stage-change {
  font-size: 16px;
  color: #888;
}

.btn-confirm {
  background: linear-gradient(135deg, #00c8ff 0%, #00ffff 100%);
  color: #000;
  border: none;
  border-radius: 12px;
  padding: 14px 48px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 0 20px rgba(0, 200, 255, 0.3);
  transition: all 0.3s;
}

.btn-confirm:hover {
  transform: translateY(-2px);
  box-shadow: 0 0 30px rgba(0, 200, 255, 0.5);
}
</style>
