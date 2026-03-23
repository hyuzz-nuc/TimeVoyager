<template>
  <div class="bank-view">
    <div class="header safe-area-top">
      <h1 class="title">能量银行</h1>
      <v-chip color="accent" size="small" variant="tonal">
        <v-icon icon="mdi-gem" class="mr-1" size="small" />
        {{ userStore.crystals }}
      </v-chip>
    </div>

    <!-- 总览卡片 -->
    <v-card class="overview-card" elevation="2">
      <v-card-text>
        <div class="total-crystals">
          <v-icon icon="mdi-gem" color="accent" size="48" />
          <div class="crystal-count">{{ userStore.crystals }}</div>
          <div class="crystal-label">星能晶体</div>
        </div>
        
        <div class="total-stats">
          <div class="stat">
            <div class="stat-value">{{ bankStore.totalExchanged.crystals }}</div>
            <div class="stat-label">累计获得</div>
          </div>
          <div class="stat-divider" />
          <div class="stat">
            <div class="stat-value">{{ bankStore.totalExchanged.steps.toLocaleString() }}</div>
            <div class="stat-label">累计步数</div>
          </div>
          <div class="stat-divider" />
          <div class="stat">
            <div class="stat-value">{{ bankStore.totalExchanged.minutes }}</div>
            <div class="stat-label">专注分钟</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 步数兑换 -->
    <v-card class="exchange-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-walk" class="mr-2" />
        步数兑换
        <v-chip color="success" size="x-small" class="ml-2" v-if="bankStore.stepsSync.enabled">
          已同步
        </v-chip>
      </v-card-title>
      <v-card-text>
        <div class="steps-display">
          <div class="steps-count">{{ bankStore.todayData.steps.toLocaleString() }} 步</div>
          <div class="steps-available">
            可兑换：{{ bankStore.availableSteps.toLocaleString() }} 步
          </div>
        </div>
        
        <div class="exchange-info">
          <v-icon icon="mdi-arrow-right" color="grey" />
          <span class="exchange-rate">
            {{ bankStore.exchangeRates.stepsToCrystal }} 步 = 1 晶体
          </span>
          <v-icon icon="mdi-gem" color="accent" class="ml-1" size="18" />
        </div>
        
        <div class="crystals-to-get">
          可获得：<span class="crystal-amount">{{ bankStore.stepsCrystals }}</span> 星能晶体
        </div>
        
        <div class="exchange-buttons">
          <v-btn
            color="success"
            variant="tonal"
            :disabled="bankStore.stepsCrystals === 0"
            @click="exchangeSteps"
          >
            <v-icon icon="mdi-gem" class="mr-1" />
            兑换全部
          </v-btn>
          
          <v-btn
            color="primary"
            variant="outlined"
            @click="syncStepsDialog = true"
          >
            <v-icon icon="mdi-sync" class="mr-1" />
            同步步数
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 专注兑换 -->
    <v-card class="exchange-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-timer" class="mr-2" />
        专注兑换
      </v-card-title>
      <v-card-text>
        <div class="steps-display">
          <div class="steps-count">{{ bankStore.todayData.focusMinutes }} 分钟</div>
          <div class="steps-available">
            可兑换：{{ bankStore.availableMinutes }} 分钟
          </div>
        </div>
        
        <div class="exchange-info">
          <v-icon icon="mdi-arrow-right" color="grey" />
          <span class="exchange-rate">
            {{ bankStore.exchangeRates.focusMinutesToCrystal }} 分钟 = 1 晶体
          </span>
          <v-icon icon="mdi-gem" color="accent" class="ml-1" size="18" />
        </div>
        
        <div class="crystals-to-get">
          可获得：<span class="crystal-amount">{{ bankStore.minutesCrystals }}</span> 星能晶体
        </div>
        
        <div class="exchange-buttons">
          <v-btn
            color="success"
            variant="tonal"
            :disabled="bankStore.minutesCrystals === 0"
            @click="exchangeMinutes"
          >
            <v-icon icon="mdi-gem" class="mr-1" />
            兑换全部
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 兑换记录 -->
    <v-card class="history-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-history" class="mr-2" />
        兑换记录
      </v-card-title>
      <v-card-text>
        <div class="history-summary">
          <div class="history-item">
            <v-icon icon="mdi-gem" color="accent" size="20" />
            <span>累计获得 {{ bankStore.totalExchanged.crystals }} 晶体</span>
          </div>
          <div class="history-item">
            <v-icon icon="mdi-walk" color="success" size="20" />
            <span>累计兑换 {{ (bankStore.totalExchanged.steps / 1000).toFixed(1) }}k 步</span>
          </div>
          <div class="history-item">
            <v-icon icon="mdi-timer" color="primary" size="20" />
            <span>累计兑换 {{ bankStore.totalExchanged.minutes }} 分钟</span>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 步数同步对话框 -->
    <v-dialog v-model="syncStepsDialog" max-width="300">
      <v-card>
        <v-card-title>同步步数</v-card-title>
        <v-card-text>
          <div class="sync-options">
            <v-btn
              block
              color="success"
              variant="tonal"
              class="mb-2"
              @click="simulateSync('Apple Health')"
            >
              <v-icon icon="mdi-apple" class="mr-2" />
              Apple Health
            </v-btn>
            
            <v-btn
              block
              color="success"
              variant="tonal"
              class="mb-2"
              @click="simulateSync('Google Fit')"
            >
              <v-icon icon="mdi-google-fit" class="mr-2" />
              Google Fit
            </v-btn>
            
            <v-btn
              block
              color="primary"
              variant="outlined"
              @click="simulateManualInput"
            >
              <v-icon icon="mdi-pencil" class="mr-2" />
              手动输入
            </v-btn>
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" variant="text" @click="syncStepsDialog = false">取消</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/user'
import { useBankStore } from '@/stores/bank'

const userStore = useUserStore()
const bankStore = useBankStore()

const syncStepsDialog = ref(false)

// 兑换步数
const exchangeSteps = () => {
  const crystals = bankStore.exchangeSteps(userStore)
  if (crystals > 0) {
    // TODO: 显示兑换成功提示
    console.log(`兑换成功：+${crystals} 晶体`)
  }
}

// 兑换专注时长
const exchangeMinutes = () => {
  const crystals = bankStore.exchangeMinutes(userStore)
  if (crystals > 0) {
    console.log(`兑换成功：+${crystals} 晶体`)
  }
}

// 模拟同步
const simulateSync = (source: string) => {
  // 模拟从健康 API 获取步数
  const randomSteps = Math.floor(Math.random() * 10000) + 3000
  bankStore.syncSteps(randomSteps)
  bankStore.enableStepsSync(source)
  syncStepsDialog.value = false
  console.log(`从 ${source} 同步步数：${randomSteps}`)
}

// 手动输入
const simulateManualInput = () => {
  const steps = prompt('请输入今日步数:', '5000')
  if (steps) {
    bankStore.syncSteps(parseInt(steps))
    syncStepsDialog.value = false
  }
}
</script>

<style scoped>
.bank-view {
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

.overview-card,
.exchange-card,
.history-card {
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

.total-crystals {
  text-align: center;
  padding: var(--spacing-xl) 0;
}

.crystal-count {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
  margin-top: var(--spacing-sm);
}

.crystal-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.total-stats {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--border);
}

.stat {
  text-align: center;
  flex: 1;
}

.stat-value {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--primary);
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

.steps-display {
  text-align: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
}

.steps-count {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-primary);
}

.steps-available {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}

.exchange-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  padding: 0 var(--spacing-md);
}

.crystals-to-get {
  text-align: center;
  font-size: var(--font-size-base);
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.crystal-amount {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
}

.exchange-buttons {
  display: flex;
  gap: var(--spacing-md);
  padding: var(--spacing-md);
}

.exchange-buttons .v-btn {
  flex: 1;
  height: var(--btn-height-lg);
  border-radius: var(--radius) !important;
}

.history-summary {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.history-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
}

.sync-options {
  padding: var(--spacing-md);
}

.sync-options .v-btn {
  height: var(--btn-height-lg);
  border-radius: var(--radius) !important;
}
</style>
