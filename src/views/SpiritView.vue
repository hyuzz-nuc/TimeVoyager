<template>
  <div class="spirit-view">
    <div class="spirit-container">
      <!-- 灵体展示 -->
      <div class="spirit-display">
        <div class="spirit-avatar" :class="spiritForm">
          <v-icon size="120" color="accent">mdi-star-four-points</v-icon>
        </div>
        <div class="spirit-name">时光灵体</div>
        <div class="spirit-form">{{ formLabel }}</div>
      </div>

      <!-- 等级信息 -->
      <div class="level-card">
        <v-card color="surface" variant="tonal" class="level-inner">
          <v-card-text>
            <div class="level-header">
              <span class="level-label">等级</span>
              <span class="level-value">{{ store.state.spirit.level }}</span>
            </div>
            <div class="exp-bar-container">
              <div class="exp-bar" :style="{ width: expPercent + '%' }"></div>
            </div>
            <div class="exp-text">{{ store.state.spirit.exp }} / {{ store.state.spirit.maxExp }} EXP</div>
          </v-card-text>
        </v-card>
      </div>

      <!-- 形态进化树 -->
      <div class="evolution-section">
        <div class="section-title">形态进化</div>
        <div class="evolution-timeline">
          <div 
            v-for="form in formEvolution" 
            :key="form.id"
            class="evolution-node"
            :class="{ unlocked: store.state.spirit.unlockedForms.includes(form.id), active: store.state.spirit.form === form.id }"
          >
            <v-icon :color="store.state.spirit.unlockedForms.includes(form.id) ? 'accent' : 'grey'">
              {{ form.icon }}
            </v-icon>
            <div class="node-label">{{ form.label }}</div>
            <div class="node-level">Lv.{{ form.minLevel }}</div>
          </div>
        </div>
      </div>

      <!-- 数据统计 -->
      <div class="stats-grid">
        <div class="stat-card">
          <v-icon color="primary" size="32">mdi-timer-outline</v-icon>
          <div class="stat-value">{{ store.state.focus.totalMinutes }}</div>
          <div class="stat-label">总专注分钟</div>
        </div>
        <div class="stat-card">
          <v-icon color="accent" size="32">mdi-star-four-points</v-icon>
          <div class="stat-value">{{ store.state.essence.total }}</div>
          <div class="stat-label">总获精粹</div>
        </div>
        <div class="stat-card">
          <v-icon color="success" size="32">mdi-trophy</v-icon>
          <div class="stat-value">{{ store.state.achievements.unlocked.length }}</div>
          <div class="stat-label">解锁成就</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from '@/stores/timeStore'

const store = useStore()

const formEvolution = [
  { id: 'initial', label: '初始形态', minLevel: 1, icon: 'mdi-star-four-points-outline' },
  { id: 'growing', label: '成长形态', minLevel: 10, icon: 'mdi-star-four-points' },
  { id: 'mature', label: '成熟形态', minLevel: 30, icon: 'mdi-star-four-points-circle' },
  { id: 'cosmic', label: '宇宙形态', minLevel: 50, icon: 'mdi-star-four-points-box' }
]

const formLabel = computed(() => {
  const form = formEvolution.find(f => f.id === store.state.spirit.form)
  return form ? form.label : '未知形态'
})

const expPercent = computed(() => {
  return (store.state.spirit.exp / store.state.spirit.maxExp) * 100
})

const spiritForm = computed(() => {
  return `form-${store.state.spirit.form}`
})
</script>

<style scoped>
.spirit-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  padding: 20px;
}

.spirit-container {
  max-width: 600px;
  margin: 0 auto;
}

.spirit-display {
  text-align: center;
  padding: 40px 0;
}

.spirit-avatar {
  width: 160px;
  height: 160px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(124, 115, 230, 0.3) 0%, transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.05); opacity: 0.8; }
}

.spirit-name {
  font-size: 28px;
  font-weight: 700;
  color: #e2e8f0;
  margin-bottom: 8px;
}

.spirit-form {
  font-size: 16px;
  color: #90caf9;
}

.level-card {
  margin: 30px 0;
}

.level-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.level-label {
  font-size: 16px;
  color: #94a3b8;
}

.level-value {
  font-size: 32px;
  font-weight: 700;
  color: #e2e8f0;
}

.exp-bar-container {
  height: 12px;
  background: rgba(148, 163, 184, 0.2);
  border-radius: 6px;
  overflow: hidden;
  margin-bottom: 8px;
}

.exp-bar {
  height: 100%;
  background: linear-gradient(90deg, #7c73e6 0%, #5c6bc0 100%);
  border-radius: 6px;
  transition: width 0.3s ease;
}

.exp-text {
  font-size: 14px;
  color: #64748b;
  text-align: center;
}

.evolution-section {
  margin: 40px 0;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 24px;
  text-align: center;
}

.evolution-timeline {
  display: flex;
  justify-content: space-between;
  position: relative;
  padding: 20px 0;
}

.evolution-timeline::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: rgba(148, 163, 184, 0.3);
  transform: translateY(-50%);
  z-index: 0;
}

.evolution-node {
  position: relative;
  z-index: 1;
  text-align: center;
  flex: 1;
}

.evolution-node .v-icon {
  background: #0f172a;
  border-radius: 50%;
  padding: 8px;
}

.node-label {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 8px;
}

.node-level {
  font-size: 10px;
  color: #64748b;
  margin-top: 4px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 40px;
}

.stat-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(124, 115, 230, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #e2e8f0;
  margin: 12px 0 4px;
}

.stat-label {
  font-size: 12px;
  color: #64748b;
}
</style>
