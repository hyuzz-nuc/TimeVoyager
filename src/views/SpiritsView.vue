<template>
  <div class="spirits-view">
    <h1 class="title">星灵图鉴</h1>
    <p class="subtitle">收集 19 种元素星灵，见证进化</p>
    
    <!-- 收集进度 -->
    <v-card class="progress-card" elevation="2">
      <v-card-text>
        <div class="progress-info">
          <span>收集进度</span>
          <span>{{ spiritStore.unlockedCount }} / {{ spiritStore.totalCount }}</span>
        </div>
        <v-progress-linear
          :model-value="spiritStore.completionRate"
          color="primary"
          height="8"
          rounded
        />
      </v-card-text>
    </v-card>

    <!-- 星灵列表 -->
    <div class="spirits-grid">
      <div
        v-for="spirit in spiritStore.spiritTypes"
        :key="spirit.id"
        class="spirit-card"
        :class="{ 
          unlocked: spiritStore.hasSpirit(spirit.id),
          locked: !spiritStore.hasSpirit(spirit.id)
        }"
        @click="navigateToSpirit(spirit.id)"
      >
        <div class="spirit-icon">
          <!-- 已解锁星灵 -->
          <img
            v-if="spiritStore.hasSpirit(spirit.id)"
            :src="getSpiritImage(spirit.id, 'seed')"
            :alt="spirit.name"
            class="spirit-pixel-img"
          />
          <!-- 未解锁星灵 - 黑色剪影 -->
          <div v-else class="spirit-silhouette">
            <v-icon icon="mdi-star-outline" color="grey-darken-2" size="40" />
            <div class="lock-icon">
              <v-icon icon="mdi-lock" size="16" color="grey" />
            </div>
          </div>
        </div>
        <div class="spirit-name">{{ spirit.name }}</div>
        <div class="spirit-element">{{ spirit.element }}</div>
        
        <!-- 已解锁显示阶段 -->
        <div class="spirit-stages" v-if="spiritStore.hasSpirit(spirit.id)">
          <v-chip
            v-for="stage in ['seed', 'grow', 'mature', 'cosmic']"
            :key="stage"
            :color="spiritStore.hasSpirit(spirit.id, stage) ? 'primary' : 'grey'"
            size="x-small"
            variant="tonal"
            class="stage-chip"
          >
            {{ stageLabel(stage) }}
          </v-chip>
        </div>
        
        <!-- 未解锁显示解锁条件 -->
        <div class="unlock-condition" v-else>
          <span class="condition-text">???</span>
        </div>
      </div>
    </div>
    
    <!-- 新手引导 - 初始星灵领取 -->
    <v-dialog v-model="showInitialSpiritDialog" max-width="400" persistent>
      <v-card>
        <v-card-title class="text-center">
          <v-icon icon="mdi-gift" color="accent" size="48" class="mb-2" />
          <div class="text-h5">欢迎来到 TimeVoyager!</div>
        </v-card-title>
        <v-card-text class="text-center">
          <p class="mb-4">作为新手礼物，请选择你的第一只星灵：</p>
          <div class="initial-spirits">
            <v-card
              v-for="spiritId in initialSpiritOptions"
              :key="spiritId"
              class="initial-spirit-card"
              :class="{ selected: selectedInitialSpirit === spiritId }"
              @click="selectedInitialSpirit = spiritId"
            >
              <img
                :src="getSpiritImage(spiritId, 'seed')"
                :alt="spiritStore.getSpiritName(spiritId)"
                class="spirit-pixel-img"
              />
              <div class="spirit-name">{{ spiritStore.getSpiritName(spiritId) }}</div>
            </v-card>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn
            color="primary"
            size="large"
            :disabled="!selectedInitialSpirit"
            @click="claimInitialSpirit"
          >
            领取星灵
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useSpiritStore } from '@/stores/spirits'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const spiritStore = useSpiritStore()
const authStore = useAuthStore()

spiritStore.loadSpirits()

// 初始星灵选择
const showInitialSpiritDialog = ref(false)
const selectedInitialSpirit = ref('')
const initialSpiritOptions = ['fire', 'water', 'wood'] // 火/水/木三选一

// 阶段标签
const stageLabel = (stage: string) => {
  const labels: Record<string, string> = {
    seed: '种',
    grow: '生',
    mature: '成',
    cosmic: '域',
  }
  return labels[stage] || stage
}

// 获取星灵图片路径
const getSpiritImage = (spiritId: string, stage: string = 'seed') => {
  return `/src/assets/pixel/spirits/spirit_${spiritId}_${stage}.png`
}

// 领取初始星灵
const claimInitialSpirit = () => {
  if (selectedInitialSpirit.value) {
    spiritStore.addSpirit(selectedInitialSpirit.value, 'seed')
    authStore.claimInitialSpirit()
    showInitialSpiritDialog.value = false
  }
}

// 导航到星灵详情
const navigateToSpirit = (spiritId: string) => {
  if (!spiritStore.hasSpirit(spiritId)) {
    // 未解锁，显示提示
    alert('这只星灵还未解锁，继续探索吧！')
    return
  }
  
  // 默认跳转到已解锁的最高阶段
  const stages: string[] = ['cosmic', 'mature', 'grow', 'seed']
  let unlockedStage = 'seed'
  
  for (const stage of stages) {
    if (spiritStore.hasSpirit(spiritId, stage as any)) {
      unlockedStage = stage
      break
    }
  }
  
  router.push(`/spirits/${spiritId}/${unlockedStage}`)
}

// 检查是否需要显示初始星灵选择
onMounted(() => {
  if (!authStore.hasClaimedInitialSpirit()) {
    showInitialSpiritDialog.value = true
  }
})
</script>

<style scoped>
.spirits-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-xs);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.progress-card {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) !important;
  padding-bottom: var(--spacing-sm) !important;
}

.spirits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-md);
}

.spirit-card {
  text-align: center;
  padding: var(--spacing-md);
  background: var(--bg-card);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.spirit-card.unlocked {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.spirit-card.locked {
  border-color: var(--border);
  background: var(--bg-secondary);
  opacity: 0.7;
}

.spirit-card.unlocked:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

.spirit-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  image-rendering: pixelated;
  position: relative;
}

.spirit-pixel-img {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.spirit-silhouette {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.lock-icon {
  position: absolute;
  bottom: -4px;
  right: -4px;
  background: var(--bg-card);
  border-radius: 50%;
  padding: 2px;
}

.spirit-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  margin-bottom: 2px;
}

.spirit-element {
  font-size: 10px;
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.spirit-stages {
  display: flex;
  gap: 2px;
  justify-content: center;
}

.stage-chip {
  font-size: 9px;
  min-width: 20px;
  padding: 0 4px;
}

.unlock-condition {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.condition-text {
  font-size: 20px;
  font-weight: var(--font-weight-bold);
}

/* 初始星灵选择对话框 */
.initial-spirits {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
  margin: var(--spacing-lg) 0;
}

.initial-spirit-card {
  width: 100px;
  padding: var(--spacing-md);
  cursor: pointer;
  border: 2px solid var(--border);
  transition: all var(--transition-fast);
}

.initial-spirit-card.selected {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.1);
}

.initial-spirit-card .spirit-name {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-xs);
}

.initial-spirit-card .spirit-pixel-img {
  width: 48px;
  height: 48px;
  margin: 0 auto;
}
</style>
