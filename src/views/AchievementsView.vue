<template>
  <div class="achievements-view">
    <div class="header safe-area-top">
      <h1 class="title">成就系统</h1>
      <v-chip color="primary" size="small" variant="tonal">
        {{ achievementStore.unlockedCount }}/{{ achievementStore.totalCount }}
      </v-chip>
    </div>

    <!-- 总进度 -->
    <v-card class="progress-card" elevation="2">
      <v-card-text>
        <div class="progress-info">
          <span>总完成度</span>
          <span>{{ achievementStore.completionRate }}%</span>
        </div>
        <v-progress-linear
          :model-value="achievementStore.completionRate"
          color="primary"
          height="8"
          rounded
        />
      </v-card-text>
    </v-card>

    <!-- 分类标签 -->
    <div class="category-tabs">
      <v-chip
        v-for="cat in categories"
        :key="cat.value"
        :color="currentCategory === cat.value ? 'primary' : 'grey'"
        :variant="currentCategory === cat.value ? 'tonal' : 'outlined'"
        size="small"
        class="category-chip"
        @click="currentCategory = cat.value"
      >
        <v-icon :icon="cat.icon" class="mr-1" size="small" />
        {{ cat.label }}
      </v-chip>
    </div>

    <!-- 成就列表 -->
    <div class="achievements-list">
      <v-card
        v-for="achievement in filteredAchievements"
        :key="achievement.id"
        class="achievement-card"
        elevation="2"
        :class="{ unlocked: achievement.unlocked }"
      >
        <v-card-text>
          <div class="achievement-content">
            <div class="achievement-icon">
              <v-icon
                :icon="achievement.icon"
                :color="achievement.unlocked ? 'primary' : 'grey'"
                size="40"
              />
            </div>
            
            <div class="achievement-info">
              <div class="achievement-name">
                {{ achievement.name }}
                <v-icon
                  v-if="achievement.unlocked"
                  icon="mdi-check-circle"
                  color="success"
                  size="16"
                  class="ml-1"
                />
              </div>
              <div class="achievement-desc">{{ achievement.description }}</div>
              
              <!-- 进度条 -->
              <div class="achievement-progress" v-if="!achievement.unlocked">
                <v-progress-linear
                  :model-value="(achievement.progress / achievement.target) * 100"
                  color="primary"
                  height="4"
                  rounded
                  class="mb-1"
                />
                <div class="progress-text">
                  {{ achievement.progress }} / {{ achievement.target }}
                </div>
              </div>
              
              <!-- 奖励 -->
              <div class="achievement-reward">
                <v-icon icon="mdi-gem" color="accent" size="14" />
                <span>+{{ achievement.reward.crystals }} 星能晶体</span>
                <span v-if="achievement.reward.spiritId" class="spirit-reward">
                  + {{ getSpiritRewardName(achievement.reward.spiritId) }}
                </span>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAchievementStore } from '@/stores/achievements'
import { useSpiritStore } from '@/stores/spirits'

const achievementStore = useAchievementStore()
const spiritStore = useSpiritStore()

const currentCategory = ref('all')

const categories = [
  { value: 'all', label: '全部', icon: 'mdi-view-grid' },
  { value: 'focus', label: '专注', icon: 'mdi-timer' },
  { value: 'collection', label: '收集', icon: 'mdi-star' },
  { value: 'battle', label: '对战', icon: 'mdi-sword' },
  { value: 'exploration', label: '探索', icon: 'mdi-map' },
]

const filteredAchievements = computed(() => {
  if (currentCategory.value === 'all') {
    return achievementStore.achievements
  }
  return achievementStore.achievementsByCategory[currentCategory.value] || []
})

const getSpiritRewardName = (spiritId: string) => {
  return spiritStore.getSpiritName(spiritId)
}
</script>

<style scoped>
.achievements-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.progress-card {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.category-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
  padding-bottom: var(--spacing-xs);
}

.category-chip {
  white-space: nowrap;
  font-weight: var(--font-weight-medium);
  height: 36px;
}

.achievements-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.achievement-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.achievement-card.unlocked {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.achievement-content {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.achievement-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border-radius: var(--radius);
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
  display: flex;
  align-items: center;
}

.achievement-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.achievement-progress {
  margin-bottom: var(--spacing-sm);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  text-align: right;
}

.achievement-reward {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--accent);
  font-weight: var(--font-weight-medium);
}

.spirit-reward {
  margin-left: var(--spacing-sm);
  color: var(--primary);
}
</style>
