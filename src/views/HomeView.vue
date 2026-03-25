<template>
  <div class="home-view">
    <!-- 顶部问候 -->
    <div class="header safe-area-top">
      <div class="user-greeting">
        <h1 class="title">早安，{{ authStore.nickname }}</h1>
        <p class="subtitle">专注即探索，时间换世界</p>
      </div>
      <div class="essence-display" title="时光精粹">
        <v-icon icon="mdi-gem" color="amber" size="24" />
        <span class="essence-count">{{ authStore.essence }}</span>
      </div>
    </div>

    <!-- 快捷功能入口 -->
    <v-card class="quick-actions-card" elevation="2">
      <v-card-text>
        <div class="quick-actions-grid">
          <div class="quick-action-item" @click="$router.push('/bank')">
            <div class="action-icon bg-blue">
              <v-icon icon="mdi-bank" size="32" color="white" />
            </div>
            <div class="action-name">能量银行</div>
          </div>
          <div class="quick-action-item" @click="$router.push('/shop')">
            <div class="action-icon bg-purple">
              <v-icon icon="mdi-store" size="32" color="white" />
            </div>
            <div class="action-name">商店</div>
          </div>
          <div class="quick-action-item" @click="$router.push('/tasks')">
            <div class="action-icon bg-green">
              <v-icon icon="mdi-clipboard-check" size="32" color="white" />
            </div>
            <div class="action-name">每日任务</div>
          </div>
          <div class="quick-action-item" @click="$router.push('/achievements')">
            <div class="action-icon bg-orange">
              <v-icon icon="mdi-trophy" size="32" color="white" />
            </div>
            <div class="action-name">成就</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 快捷统计卡片 -->
    <v-card class="stats-card pixel-card" elevation="2">
      <v-card-text>
        <div class="stats-grid">
          <div class="stat-item">
            <v-icon icon="mdi-gem" color="amber" size="32" />
            <div class="stat-value">{{ authStore.essence }}</div>
            <div class="stat-label">时光精粹</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <v-icon icon="mdi-trophy" color="accent" size="32" />
            <div class="stat-value">{{ authStore.level }}</div>
            <div class="stat-label">等级</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <v-icon icon="mdi-star" color="primary" size="32" />
            <div class="stat-value">{{ spiritStore.collectedCount }}</div>
            <div class="stat-label">星灵</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 今日目标 -->
    <v-card class="goal-card pixel-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-target" class="mr-2" />
        今日目标
      </v-card-title>
      <v-card-text>
        <div class="goal-item">
          <div class="goal-info">
            <span class="goal-text">专注 4 次</span>
            <span class="goal-progress">2/4</span>
          </div>
          <v-progress-linear
            :model-value="50"
            color="primary"
            height="8"
            rounded
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- 快捷操作 -->
    <div class="quick-actions">
      <v-btn
        class="action-btn"
        color="primary"
        size="x-large"
        rounded="xl"
        @click="$router.push('/timer')"
      >
        <v-icon icon="mdi-play" class="mr-2" />
        开始专注
      </v-btn>
    </div>

    <!-- 星灵展示 -->
    <v-card class="spirits-card pixel-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-star" class="mr-2" />
        我的星灵
      </v-card-title>
      <v-card-text>
        <div v-if="spiritStore.isLoading" class="spirits-loading">
          <LoadingState text="加载星灵中..." />
        </div>
        <EmptyState
          v-else-if="spiritStore.collectedCount === 0"
          icon="mdi-star-outline"
          title="还没有星灵"
          description="完成新手引导或探索星域地图，获得你的第一只星灵吧！"
          action-text="去探索"
          action-color="primary"
          @action="$router.push('/map')"
        />
        <div v-else class="spirits-preview">
          <div
            v-for="i in Math.min(3, spiritStore.collectedCount)"
            :key="i"
            class="spirit-placeholder"
          >
            <v-icon icon="mdi-star" size="40" color="primary" />
          </div>
          <div v-if="spiritStore.collectedCount > 3" class="spirit-more">
            <span>+{{ spiritStore.collectedCount - 3 }}</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { useSpiritStore } from '@/stores/spirits'
import { useAuthStore } from '@/stores/auth'
import EmptyState from '@/components/EmptyState.vue'
import LoadingState from '@/components/LoadingState.vue'

const userStore = useUserStore()
const spiritStore = useSpiritStore()
const authStore = useAuthStore()

const username = computed(() => authStore.nickname)

// 初始化加载数据
authStore.initUser()
userStore.loadUserData()
spiritStore.loadSpirits()
</script>

<style scoped>
.home-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.user-greeting {
  flex: 1;
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin: 0 0 var(--spacing-xs);
}

.subtitle {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0;
}

.essence-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--bg-card);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.essence-count {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
}

/* 快捷功能入口 */
.quick-actions-card {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-sm);
}

.quick-action-item {
  text-align: center;
  cursor: pointer;
  padding: var(--spacing-sm);
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);
  position: relative;
  overflow: hidden;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
}

.quick-action-item:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
}

.quick-action-item:active {
  transform: scale(0.95);
  background: var(--bg-tertiary);
}

/* 点击波纹效果 */
.quick-action-item::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
  pointer-events: none;
}

.quick-action-item:active::after {
  width: 150%;
  height: 150%;
  opacity: 1;
}

.action-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--spacing-xs);
}

.action-icon.bg-blue {
  background: linear-gradient(135deg, #3B82F6, #2563EB);
}

.action-icon.bg-purple {
  background: linear-gradient(135deg, #8B5CF6, #7C3AED);
}

.action-icon.bg-green {
  background: linear-gradient(135deg, #10B981, #059669);
}

.action-icon.bg-orange {
  background: linear-gradient(135deg, #F59E0B, #D97706);
}

.action-name {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.pixel-card {
  border: 1px solid var(--border) !important;
  box-shadow: var(--shadow);
  margin-bottom: var(--spacing-md);
}

.stats-card,
.goal-card,
.spirits-card {
  border-radius: var(--radius);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) !important;
  padding-bottom: var(--spacing-sm) !important;
}

.stats-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-item {
  text-align: center;
  flex: 1;
}

.stat-icon {
  image-rendering: pixelated;
  margin-bottom: var(--spacing-xs);
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
  margin-top: var(--spacing-xs);
}

.stat-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border);
}

.goal-item {
  margin-top: var(--spacing-sm);
}

.goal-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
}

.goal-text {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.goal-progress {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.quick-actions {
  margin: var(--spacing-lg) 0;
  text-align: center;
}

.action-btn {
  min-width: 200px;
  font-weight: var(--font-weight-semibold);
}

.spirits-loading {
  padding: var(--spacing-lg) 0;
}

.spirits-preview {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
}

.spirit-placeholder {
  width: 60px;
  height: 60px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.spirit-placeholder.empty {
  background: var(--bg-tertiary);
}

.empty-text {
  font-size: var(--font-size-xs);
  color: var(--text-light);
}

.spirit-more {
  flex: 1;
  height: 60px;
  border-radius: var(--radius);
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-secondary);
}
</style>
