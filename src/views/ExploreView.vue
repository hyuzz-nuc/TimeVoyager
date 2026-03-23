<template>
  <div class="explore-view">
    <div class="explore-container">
      <!-- 星域地图 -->
      <div class="zone-map">
        <div class="map-title">时光星域</div>
        <div class="zone-grid">
          <div 
            v-for="zone in zones" 
            :key="zone.id"
            class="zone-node"
            :class="{ 
              unlocked: zone.id <= store.state.explore.unlockedZones,
              current: zone.id === store.state.explore.currentZone,
              locked: zone.id > store.state.unlockedZones
            }"
          >
            <v-icon 
              size="48" 
              :color="zone.id <= store.state.explore.unlockedZones ? 'accent' : 'grey'"
            >
              {{ zone.icon }}
            </v-icon>
            <div class="zone-name">{{ zone.name }}</div>
            <div class="zone-cost" v-if="zone.cost > 0">
              {{ zone.cost }} 精粹
            </div>
            <v-btn
              v-if="zone.id > store.state.explore.unlockedZones && canUnlock(zone)"
              color="primary"
              size="small"
              rounded="xl"
              @click="unlockZone(zone)"
              class="unlock-btn"
            >
              解锁
            </v-btn>
            <v-btn
              v-if="zone.id === store.state.explore.currentZone"
              color="success"
              size="small"
              rounded="xl"
              class="current-badge"
            >
              探索中
            </v-btn>
          </div>
        </div>
      </div>

      <!-- 步数统计 -->
      <div class="steps-card">
        <v-card color="surface" variant="tonal" class="steps-inner">
          <v-card-text>
            <div class="steps-header">
              <v-icon color="success" start>mdi-walk</v-icon>
              <span class="steps-title">运动步数</span>
            </div>
            <div class="steps-value">{{ store.state.explore.totalSteps.toLocaleString() }}</div>
            <div class="steps-info">每 1000 步 = 1 时光精粹</div>
            <v-btn
              color="success"
              variant="tonal"
              rounded="xl"
              @click="addManualSteps"
              class="add-steps-btn"
            >
              <v-icon start>mdi-plus</v-icon>
              添加步数
            </v-btn>
          </v-card-text>
        </v-card>
      </div>

      <!-- 探索提示 -->
      <div class="explore-tips">
        <v-alert
          type="info"
          variant="tonal"
          color="accent"
          border="start"
          class="tip-alert"
        >
          <template v-slot:title>
            <div class="tip-title">💡 探索小贴士</div>
          </template>
          <div>
            • 解锁新星域需要消耗时光精粹<br>
            • 运动步数可兑换精粹<br>
            • 每个星域都有独特成就等待解锁
          </div>
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useStore } from '@/stores/timeStore'

const store = useStore()

const zones = [
  { id: 1, name: '初始星域', icon: 'mdi-earth', cost: 0 },
  { id: 2, name: '流光星域', icon: 'mdi-planet', cost: 100 },
  { id: 3, name: '时空裂隙', icon: 'mdi-weather-lightning', cost: 300 },
  { id: 4, name: '量子海洋', icon: 'mdi-water', cost: 500 },
  { id: 5, name: '暗物质带', icon: 'mdi-weather-night', cost: 1000 },
  { id: 6, name: '宇宙之心', icon: 'mdi-heart', cost: 2000 }
]

const canUnlock = (zone) => {
  return store.state.essence.current >= zone.cost
}

const unlockZone = (zone) => {
  if (store.spendEssence(zone.cost)) {
    store.state.explore.unlockedZones = zone.id
    store.state.explore.currentZone = zone.id
    store.saveState(store.state)
    alert(`✨ 解锁 ${zone.name}！开始新的探索吧！`)
  } else {
    alert('⚠️ 时光精粹不足，继续专注积累吧！')
  }
}

const addManualSteps = () => {
  const steps = prompt('输入步数：', '1000')
  if (steps && !isNaN(steps)) {
    const earned = store.addSteps(parseInt(steps))
    alert(`✅ 添加 ${steps} 步，获得 ${earned} 个时光精粹！`)
  }
}
</script>

<style scoped>
.explore-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  padding: 20px;
}

.explore-container {
  max-width: 600px;
  margin: 0 auto;
}

.zone-map {
  margin-bottom: 30px;
}

.map-title {
  font-size: 24px;
  font-weight: 700;
  color: #e2e8f0;
  text-align: center;
  margin-bottom: 24px;
}

.zone-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.zone-node {
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(148, 163, 184, 0.3);
  border-radius: 16px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
}

.zone-node.unlocked {
  border-color: rgba(124, 115, 230, 0.5);
  background: rgba(124, 115, 230, 0.1);
}

.zone-node.current {
  border-color: #4ade80;
  box-shadow: 0 0 20px rgba(74, 222, 128, 0.3);
}

.zone-node.locked {
  opacity: 0.5;
  filter: grayscale(0.5);
}

.zone-name {
  font-size: 14px;
  color: #e2e8f0;
  margin: 8px 0 4px;
  font-weight: 600;
}

.zone-cost {
  font-size: 12px;
  color: #fbbf24;
  margin-bottom: 12px;
}

.unlock-btn, .current-badge {
  font-size: 12px;
  padding: 0 16px;
}

.steps-card {
  margin: 30px 0;
}

.steps-inner {
  border: 1px solid rgba(74, 222, 128, 0.3);
}

.steps-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.steps-title {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
}

.steps-value {
  font-size: 48px;
  font-weight: 700;
  color: #4ade80;
  margin-bottom: 8px;
}

.steps-info {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 16px;
}

.add-steps-btn {
  width: 100%;
}

.explore-tips {
  margin-top: 30px;
}

.tip-alert {
  border-radius: 16px;
}

.tip-title {
  font-weight: 600;
  color: #e2e8f0;
}
</style>
