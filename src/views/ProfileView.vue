<template>
  <div class="profile-view">
    <h1 class="title">个人中心</h1>
    
    <!-- 用户信息卡片 -->
    <v-card class="profile-card" elevation="2">
      <v-card-text>
        <div class="user-info">
          <div class="avatar">
            <v-icon icon="mdi-account" size="64" color="primary" />
          </div>
          <div class="user-details">
            <h2 class="username">{{ userStore.username }}</h2>
            <div class="level-badge">
              <span>Lv.{{ userStore.level }}</span>
              <span class="level-title">{{ userStore.levelTitle }}</span>
            </div>
          </div>
        </div>
        
        <!-- 经验条 -->
        <div class="exp-section">
          <div class="exp-info">
            <span>{{ userStore.exp }} / {{ userStore.maxExp }} EXP</span>
            <span>{{ userStore.expProgress.toFixed(0) }}%</span>
          </div>
          <v-progress-linear
            :model-value="userStore.expProgress"
            color="primary"
            height="8"
            rounded
          />
        </div>
      </v-card-text>
    </v-card>

    <!-- 货币统计 -->
    <div class="currency-row">
      <v-card class="currency-card" elevation="2">
        <v-card-text>
          <v-icon icon="mdi-gem" color="accent" size="32" />
          <div class="currency-value">{{ userStore.crystals }}</div>
          <div class="currency-label">星能晶体</div>
        </v-card-text>
      </v-card>
      
      <v-card class="currency-card" elevation="2">
        <v-card-text>
          <v-icon icon="mdi-coin" color="secondary" size="32" />
          <div class="currency-value">{{ userStore.coins }}</div>
          <div class="currency-label">金币</div>
        </v-card-text>
      </v-card>
    </div>

    <!-- 统计信息 -->
    <v-card class="stats-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-chart-bar" class="mr-2" />
        数据统计
      </v-card-title>
      <v-card-text>
        <div class="stats-list">
          <div class="stat-row">
            <span class="stat-label">总专注时长</span>
            <span class="stat-value">{{ userStore.stats.totalFocusTime }} 分钟</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-row">
            <span class="stat-label">专注次数</span>
            <span class="stat-value">{{ userStore.stats.totalSessions }}</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-row">
            <span class="stat-label">收集星灵</span>
            <span class="stat-value">{{ spiritStore.collectedCount }}</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 设置选项 -->
    <v-card class="settings-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-cog" class="mr-2" />
        设置
      </v-card-title>
      <v-card-text>
        <v-list lines="two" variant="tonal">
          <v-list-item>
            <template v-slot:prepend>
              <v-icon icon="mdi-bell" />
            </template>
            <v-list-item-title>通知提醒</v-list-item-title>
            <v-list-item-subtitle>每日专注提醒</v-list-item-subtitle>
            <template v-slot:append>
              <v-switch v-model="userStore.settings.notifications" hide-details />
            </template>
          </v-list-item>
          
          <v-list-item>
            <template v-slot:prepend>
              <v-icon icon="mdi-volume-high" />
            </template>
            <v-list-item-title>音效</v-list-item-title>
            <v-list-item-subtitle>播放提示音</v-list-item-subtitle>
            <template v-slot:append>
              <v-switch v-model="userStore.settings.sound" hide-details />
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '@/stores/user'
import { useSpiritStore } from '@/stores/spirits'

const userStore = useUserStore()
const spiritStore = useSpiritStore()

userStore.loadUserData()
spiritStore.loadSpirits()
</script>

<style scoped>
.profile-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin-bottom: var(--spacing-lg);
}

.profile-card {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow);
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--spacing-lg) 0;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--spacing-md);
}

.user-details {
  text-align: center;
}

.username {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin: 0 0 var(--spacing-xs);
}

.level-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs);
  padding: 4px 12px;
  background: var(--primary);
  color: white;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
}

.level-title {
  opacity: 0.9;
  font-weight: var(--font-weight-normal);
}

.exp-section {
  margin-top: var(--spacing-lg);
  padding: 0 var(--spacing-lg);
}

.exp-info {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-xs);
}

.currency-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
}

.currency-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  text-align: center;
  padding: var(--spacing-lg);
}

.currency-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  margin-top: var(--spacing-xs);
}

.currency-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.stats-card,
.settings-card {
  margin-bottom: var(--spacing-md);
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

.stats-list {
  margin-top: var(--spacing-sm);
  padding: 0 var(--spacing-md);
}

.stat-row {
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.stat-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
}

.stat-divider {
  height: 1px;
  background: var(--border);
  margin: var(--spacing-xs) 0;
}
</style>
