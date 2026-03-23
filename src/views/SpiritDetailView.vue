<template>
  <div class="spirits-detail-view">
    <!-- 顶部导航 -->
    <div class="header safe-area-top">
      <v-btn icon variant="text" @click="$router.back()">
        <v-icon icon="mdi-arrow-left" />
      </v-btn>
      <h1 class="title">{{ spiritName }}</h1>
      <div style="width: 40px" />
    </div>

    <!-- 星灵展示区 -->
    <div class="spirit-display">
      <div class="spirit-image-container">
        <v-icon
          :icon="spiritImage"
          :size="spiritSize"
          color="primary"
        />
      </div>
      
      <div class="spirit-info">
        <h2 class="spirit-name">{{ spiritName }}</h2>
        <div class="spirit-stage-badge">
          <v-chip color="primary" size="small" variant="tonal">
            {{ stageName }}
          </v-chip>
        </div>
        <div class="spirit-level">
          Lv.{{ spirit.level }}
        </div>
      </div>
    </div>

    <!-- 进化阶段展示 -->
    <v-card class="evolution-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-arrow-up-circle" class="mr-2" />
        进化路线
      </v-card-title>
      <v-card-text>
        <div class="evolution-stages">
          <div
            v-for="(stage, index) in evolutionStages"
            :key="stage.stage"
            class="evolution-stage"
            :class="{
              active: stage.stage === spirit.stage,
              unlocked: isStageUnlocked(stage.stage),
            }"
          >
            <div class="stage-icon">
              <v-icon
                :icon="getStageIcon(stage.stage)"
                :color="getStageColor(stage.stage)"
                size="40"
              />
            </div>
            <div class="stage-info">
              <div class="stage-name">{{ stage.name }}</div>
              <div class="stage-level">Lv.{{ stage.minLevel }}-{{ stage.maxLevel }}</div>
            </div>
            <div v-if="index < evolutionStages.length - 1" class="evolution-arrow">
              <v-icon icon="mdi-arrow-right" size="20" color="grey" />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 进化按钮 -->
    <v-card class="action-card" elevation="2">
      <v-card-text>
        <v-btn
          v-if="canEvolve"
          color="primary"
          size="x-large"
          block
          rounded="xl"
          @click="handleEvolve"
        >
          <v-icon icon="mdi-arrow-up-circle" class="mr-2" />
          进化到下一阶段
        </v-btn>
        <v-btn
          v-else
          color="secondary"
          size="x-large"
          block
          variant="outlined"
          disabled
        >
          还未满足进化条件
        </v-btn>
        
        <div class="evolve-requirements" v-if="!canEvolve">
          <div class="requirement">
            <v-icon icon="mdi-star" size="16" color="warning" />
            <span>等级达到 {{ nextStageLevel }} 级</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 属性信息 -->
    <v-card class="stats-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-chart-bar" class="mr-2" />
        星灵属性
      </v-card-title>
      <v-card-text>
        <div class="stats-list">
          <div class="stat-row">
            <span class="stat-label">元素</span>
            <span class="stat-value">{{ elementName }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-row">
            <span class="stat-label">获得时间</span>
            <span class="stat-value">{{ obtainedDate }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-row">
            <span class="stat-label">经验值</span>
            <span class="stat-value">{{ spirit.exp }} / {{ expNeeded }}</span>
          </div>
          <v-progress-linear
            :model-value="expProgress"
            color="primary"
            height="8"
            rounded
            class="mt-2"
          />
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSpiritStore, STAGE_NAMES, STAGE_LEVELS, type SpiritStage } from '@/stores/spirits'
import { useUserStore } from '@/stores/user'

const route = useRoute()
const router = useRouter()
const spiritStore = useSpiritStore()
const userStore = useUserStore()

// 从路由参数获取星灵 ID 和阶段
const spiritId = computed(() => route.params.id as string)
const stage = computed(() => route.params.stage as SpiritStage)

// 查找星灵
const spirit = computed(() => {
  return spiritStore.spirits.find(s => s.id === spiritId.value && s.stage === stage.value)
})

// 星灵名称
const spiritName = computed(() => {
  return spiritStore.getSpiritName(spiritId.value)
})

// 元素名称
const elementName = computed(() => {
  return spiritStore.getSpiritElement(spiritId.value)
})

// 阶段名称
const stageName = computed(() => {
  return STAGE_NAMES[stage.value]
})

// 星灵图片（使用图标占位）
const spiritImage = computed(() => {
  return 'mdi-star'
})

// 星灵尺寸
const spiritSize = computed(() => {
  const sizeMap: Record<SpiritStage, number> = {
    seed: 64,
    grow: 80,
    mature: 96,
    cosmic: 112,
  }
  return sizeMap[stage.value]
})

// 进化阶段数据
const evolutionStages = computed(() => {
  return [
    { stage: 'seed' as SpiritStage, name: '星灵之种', minLevel: 1, maxLevel: 20 },
    { stage: 'grow' as SpiritStage, name: '生长期', minLevel: 21, maxLevel: 50 },
    { stage: 'mature' as SpiritStage, name: '成熟期', minLevel: 51, maxLevel: 80 },
    { stage: 'cosmic' as SpiritStage, name: '星域形态', minLevel: 81, maxLevel: 100 },
  ]
})

// 检查阶段是否已解锁
const isStageUnlocked = (targetStage: SpiritStage) => {
  const stages: SpiritStage[] = ['seed', 'grow', 'mature', 'cosmic']
  const currentIndex = stages.indexOf(stage.value)
  const targetIndex = stages.indexOf(targetStage)
  return targetIndex <= currentIndex
}

// 获取阶段图标
const getStageIcon = (targetStage: SpiritStage) => {
  const iconMap: Record<SpiritStage, string> = {
    seed: 'mdi-seed',
    grow: 'mdi-sprout',
    mature: 'mdi-leaf',
    cosmic: 'mdi-star',
  }
  return iconMap[targetStage]
}

// 获取阶段颜色
const getStageColor = (targetStage: SpiritStage) => {
  if (targetStage === stage.value) return 'primary'
  if (isStageUnlocked(targetStage)) return 'success'
  return 'grey'
}

// 是否可以进化
const canEvolve = computed(() => {
  if (!spirit.value) return false
  return spiritStore.canEvolve(spirit.value)
})

// 下一阶段等级要求
const nextStageLevel = computed(() => {
  if (!spirit.value) return 0
  const currentStageLevels = STAGE_LEVELS[spirit.value.stage]
  return currentStageLevels[1] + 1
})

// 升级所需经验
const expNeeded = computed(() => {
  if (!spirit.value) return 100
  return spirit.value.level * 100
})

// 经验进度
const expProgress = computed(() => {
  if (!spirit.value) return 0
  return Math.min((spirit.value.exp / expNeeded.value) * 100, 100)
})

// 获得日期
const obtainedDate = computed(() => {
  if (!spirit.value) return '-'
  return new Date(spirit.value.obtainedAt).toLocaleDateString('zh-CN')
})

// 处理进化
const handleEvolve = () => {
  if (!spirit.value || !canEvolve.value) return
  
  // TODO: 实现进化逻辑
  // 1. 检查材料是否足够
  // 2. 播放进化动画
  // 3. 解锁下一阶段形态
  // 4. 更新数据
  
  console.log('Evolve!', spiritId.value, stage.value)
}
</script>

<style scoped>
.spirits-detail-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + 64px);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.title {
  font-size: 20px;
  font-weight: 700;
  margin: 0;
}

.spirit-display {
  text-align: center;
  margin-bottom: var(--spacing-lg);
}

.spirit-image-container {
  width: 160px;
  height: 160px;
  margin: 0 auto var(--spacing-md);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  border: 2px solid var(--primary);
}

.spirit-info {
  margin-top: var(--spacing-md);
}

.spirit-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0 0 var(--spacing-xs);
}

.spirit-level {
  font-size: 16px;
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.evolution-card,
.action-card,
.stats-card {
  margin-bottom: var(--spacing-md);
  border-radius: var(--border-radius-lg);
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  padding: var(--spacing-md) !important;
  padding-bottom: var(--spacing-sm) !important;
}

.evolution-stages {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
}

.evolution-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  opacity: 0.5;
}

.evolution-stage.active {
  opacity: 1;
  transform: scale(1.1);
}

.evolution-stage.unlocked {
  opacity: 0.8;
}

.stage-icon {
  margin-bottom: var(--spacing-xs);
}

.stage-name {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.stage-level {
  font-size: 10px;
  color: var(--text-secondary);
  margin-top: 2px;
}

.evolution-arrow {
  flex-shrink: 0;
}

.action-card {
  text-align: center;
}

.evolve-requirements {
  margin-top: var(--spacing-md);
  text-align: left;
}

.requirement {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: 14px;
  color: var(--text-secondary);
}

.stats-list {
  margin-top: var(--spacing-sm);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}

.stat-label {
  font-size: 14px;
  color: var(--text-secondary);
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
}

.stat-divider {
  height: 1px;
  background: var(--border);
  margin: var(--spacing-xs) 0;
}
</style>
