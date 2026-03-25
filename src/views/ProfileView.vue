<template>
  <div class="profile-view">
    <div class="header safe-area-top">
      <h1 class="title">个人中心</h1>
    </div>

    <!-- 用户信息卡片 -->
    <v-card class="profile-card" elevation="2">
      <v-card-text>
        <div class="user-info">
          <div class="avatar">
            <v-icon icon="mdi-account-circle" size="80" color="primary" />
          </div>
          <div class="user-details">
            <div class="nickname">{{ authStore.nickname }}</div>
            <div class="level">Lv.{{ authStore.level }} - {{ levelStore.currentTitle }}</div>
            <div class="exp-progress">
              <v-progress-linear
                :model-value="levelStore.expPercent"
                color="primary"
                height="6"
                rounded
              />
              <div class="exp-text">{{ levelStore.exp }} / {{ levelStore.expNeeded }} 经验</div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 货币统计 -->
    <v-card class="currency-card" elevation="2">
      <v-card-text>
        <div class="currency-grid">
          <div class="currency-item">
            <v-icon icon="mdi-gem" color="amber" size="32" />
            <div class="currency-amount">{{ authStore.essence }}</div>
            <div class="currency-label">时光精粹</div>
          </div>
          <div class="currency-divider" />
          <div class="currency-item">
            <v-icon icon="mdi-gem" size="32" style="filter: hue-rotate(45deg);" />
            <div class="currency-amount">{{ authStore.crystals }}</div>
            <div class="currency-label">星能晶体</div>
          </div>
          <div class="currency-divider" />
          <div class="currency-item">
            <v-icon icon="mdi-coin" color="yellow" size="32" />
            <div class="currency-amount">{{ authStore.coins }}</div>
            <div class="currency-label">金币</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 体力状态 -->
    <v-card class="energy-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-bolt" class="mr-2" />
        体力状态
      </v-card-title>
      <v-card-text>
        <div class="energy-info">
          <div class="energy-value">{{ energyStore.currentEnergy }} / {{ energyStore.MAX_ENERGY }}</div>
          <v-progress-linear
            :model-value="energyStore.energyPercent"
            color="accent"
            height="8"
            rounded
          />
          <div class="energy-recover">
            <v-icon icon="mdi-clock-outline" size="16" />
            <span>{{ energyStore.timeToFull }}恢复满</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 功能菜单 -->
    <v-card class="menu-card" elevation="2">
      <v-card-text>
        <div class="menu-list">
          <div class="menu-item" @click="$router.push('/settings')">
            <v-icon icon="mdi-cog" color="primary" size="24" />
            <span class="menu-label">设置</span>
            <v-icon icon="mdi-chevron-right" color="grey" />
          </div>
          <div class="menu-item" @click="$router.push('/about')">
            <v-icon icon="mdi-information" color="info" size="24" />
            <span class="menu-label">关于</span>
            <v-icon icon="mdi-chevron-right" color="grey" />
          </div>
          <div class="menu-item" @click="clearData">
            <v-icon icon="mdi-delete" color="error" size="24" />
            <span class="menu-label">清除数据</span>
            <v-icon icon="mdi-chevron-right" color="grey" />
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useEnergyStore } from '@/stores/energy'
import { useLevelStore } from '@/stores/level'

const authStore = useAuthStore()
const energyStore = useEnergyStore()
const levelStore = useLevelStore()

// 初始化等级系统
onMounted(() => {
  levelStore.initLevel(authStore.level, authStore.exp)
})

const clearData = () => {
  if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
    localStorage.clear()
    location.reload()
  }
}
</script>

<style scoped>
.profile-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
}

.header {
  margin-bottom: var(--spacing-lg);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.profile-card,
.currency-card,
.energy-card,
.menu-card {
  margin-bottom: var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.user-info {
  display: flex;
  gap: var(--spacing-lg);
  align-items: center;
}

.avatar {
  flex-shrink: 0;
}

.user-details {
  flex: 1;
}

.nickname {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.level {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.exp-progress {
  margin-top: var(--spacing-sm);
}

.exp-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.currency-grid {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.currency-item {
  text-align: center;
  flex: 1;
}

.currency-amount {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-top: var(--spacing-xs);
}

.currency-label {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.currency-divider {
  width: 1px;
  height: 50px;
  background: var(--border);
}

.card-title {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  padding: var(--spacing-md) !important;
  padding-bottom: var(--spacing-sm) !important;
}

.energy-info {
  padding: var(--spacing-sm) 0;
}

.energy-value {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
  margin-bottom: var(--spacing-sm);
}

.energy-recover {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-sm);
}

.menu-list {
  display: flex;
  flex-direction: column;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid var(--border);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--bg-secondary);
  padding-left: var(--spacing-sm);
  padding-right: var(--spacing-sm);
  margin: 0 calc(-1 * var(--spacing-sm));
  border-radius: var(--radius-sm);
}

.menu-label {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}
</style>
