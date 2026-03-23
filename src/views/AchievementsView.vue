<template>
  <div class="achievements-view">
    <div class="achievements-container">
      <!-- 成就统计 -->
      <div class="stats-header">
        <div class="stats-title">成就进度</div>
        <div class="stats-progress">
          <span class="progress-value">{{ store.state.achievements.unlocked.length }}</span>
          <span class="progress-sep">/</span>
          <span class="progress-total">{{ achievements.length }}</span>
        </div>
      </div>

      <!-- 成就列表 -->
      <div class="achievements-grid">
        <div 
          v-for="achievement in achievements" 
          :key="achievement.id"
          class="achievement-card"
          :class="{ unlocked: store.state.achievements.unlocked.includes(achievement.id) }"
        >
          <div class="achievement-icon">
            <v-icon 
              size="40" 
              :color="store.state.achievements.unlocked.includes(achievement.id) ? 'warning' : 'grey'"
            >
              {{ achievement.icon }}
            </v-icon>
          </div>
          <div class="achievement-info">
            <div class="achievement-name">{{ achievement.name }}</div>
            <div class="achievement-desc">{{ achievement.description }}</div>
            <div class="achievement-condition" v-if="!store.state.achievements.unlocked.includes(achievement.id)">
              条件：{{ achievement.condition }}
            </div>
          </div>
        </div>
      </div>

      <!-- 成就提示 -->
      <div class="achievements-tips">
        <v-alert
          type="info"
          variant="tonal"
          color="warning"
          border="start"
          class="tip-alert"
        >
          <template v-slot:title>
            <div class="tip-title">🏆 成就系统</div>
          </template>
          <div>
            • 成就会自动解锁，无需手动领取<br>
            • 专注、探索、养成都能获得成就<br>
            • 收集全部成就证明你是时间管理大师！
          </div>
        </v-alert>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useStore } from '@/stores/timeStore'

const store = useStore()

const achievements = [
  {
    id: 'first_focus',
    name: '初次专注',
    description: '完成第一次专注',
    condition: '专注 1 次',
    icon: 'mdi-play-circle-outline'
  },
  {
    id: 'focus_100min',
    name: '百日筑基',
    description: '累计专注 100 分钟',
    condition: '专注 100 分钟',
    icon: 'mdi-timer-outline'
  },
  {
    id: 'focus_500min',
    name: '专注达人',
    description: '累计专注 500 分钟',
    condition: '专注 500 分钟',
    icon: 'mdi-timer-sand'
  },
  {
    id: 'focus_1000min',
    name: '时间大师',
    description: '累计专注 1000 分钟',
    condition: '专注 1000 分钟',
    icon: 'mdi-crown'
  },
  {
    id: 'essence_100',
    name: '第一桶金',
    description: '累计获得 100 个时光精粹',
    condition: '获得 100 精粹',
    icon: 'mdi-star-four-points-outline'
  },
  {
    id: 'essence_1000',
    name: '富甲一方',
    description: '累计获得 1000 个时光精粹',
    condition: '获得 1000 精粹',
    icon: 'mdi-star-four-points'
  },
  {
    id: 'spirit_lv10',
    name: '灵体初成',
    description: '时光灵体达到 10 级',
    condition: '灵体 Lv.10',
    icon: 'mdi-star-four-points-circle'
  },
  {
    id: 'spirit_lv30',
    name: '灵体成熟',
    description: '时光灵体达到 30 级',
    condition: '灵体 Lv.30',
    icon: 'mdi-star-four-points-box'
  },
  {
    id: 'explore_3zones',
    name: '星际旅行者',
    description: '解锁 3 个星域',
    condition: '解锁 3 星域',
    icon: 'mdi-rocket-launch'
  },
  {
    id: 'explore_all',
    name: '宇宙征服者',
    description: '解锁全部星域',
    condition: '解锁 6 星域',
    icon: 'mdi-earth-box'
  },
  {
    id: 'steps_10000',
    name: '日行万步',
    description: '累计步数达 10000 步',
    condition: '10000 步',
    icon: 'mdi-walk'
  },
  {
    id: 'steps_100000',
    name: '千里之行',
    description: '累计步数达 100000 步',
    condition: '100000 步',
    icon: 'mdi-shoe-print'
  }
]
</script>

<style scoped>
.achievements-view {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
  padding: 20px;
}

.achievements-container {
  max-width: 600px;
  margin: 0 auto;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding: 20px;
  background: rgba(30, 41, 59, 0.5);
  border-radius: 16px;
  border: 1px solid rgba(251, 191, 36, 0.3);
}

.stats-title {
  font-size: 20px;
  font-weight: 600;
  color: #e2e8f0;
}

.stats-progress {
  font-size: 24px;
  font-weight: 700;
  color: #fbbf24;
}

.progress-sep {
  color: #64748b;
  margin: 0 8px;
}

.achievements-grid {
  display: grid;
  gap: 12px;
  margin-bottom: 30px;
}

.achievement-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: rgba(30, 41, 59, 0.5);
  border: 2px solid rgba(148, 163, 184, 0.3);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.achievement-card.unlocked {
  border-color: rgba(251, 191, 36, 0.5);
  background: rgba(251, 191, 36, 0.05);
}

.achievement-icon {
  margin-right: 16px;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 4px;
}

.achievement-desc {
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 4px;
}

.achievement-condition {
  font-size: 12px;
  color: #64748b;
  font-style: italic;
}

.achievements-tips {
  margin-top: 20px;
}

.tip-alert {
  border-radius: 16px;
}

.tip-title {
  font-weight: 600;
  color: #e2e8f0;
}
</style>
