<template>
  <div class="tasks-view">
    <div class="header safe-area-top">
      <h1 class="title">每日任务</h1>
      <div class="reset-time">
        重置：{{ resetTime }}
      </div>
    </div>

    <!-- 任务进度 -->
    <v-card class="progress-card" elevation="2">
      <v-card-text>
        <div class="progress-info">
          <span>今日完成</span>
          <span>{{ completedCount }} / {{ tasks.length }}</span>
        </div>
        <v-progress-linear
          :model-value="completionRate"
          color="primary"
          height="8"
          rounded
        />
      </v-card-text>
    </v-card>

    <!-- 任务列表 -->
    <div class="tasks-list">
      <v-card
        v-for="task in tasks"
        :key="task.id"
        class="task-card"
        elevation="2"
        :class="{ completed: task.completed }"
      >
        <v-card-text>
          <div class="task-content">
            <v-checkbox
              :model-value="task.completed"
              :disabled="task.completed"
              @change="claimTask(task)"
              class="task-checkbox"
              hide-details
            />
            
            <div class="task-info">
              <div class="task-name">{{ task.name }}</div>
              <div class="task-desc">{{ task.description }}</div>
              <div class="task-progress">
                <v-progress-linear
                  :model-value="(task.progress / task.target) * 100"
                  color="primary"
                  height="4"
                  rounded
                  class="mb-1"
                />
                <span class="progress-text">{{ task.progress }} / {{ task.target }}</span>
              </div>
            </div>
            
            <div class="task-reward">
              <v-icon icon="mdi-gem" color="amber" size="20" />
              <span class="reward-value">+{{ task.reward }}</span>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const resetTime = ref('23:59:59')

const tasks = ref([
  // 专注类任务
  {
    id: 'daily_focus_1',
    name: '专注达人',
    description: '完成 1 次专注',
    target: 1,
    progress: 0,
    reward: 10,
    completed: false,
  },
  {
    id: 'daily_focus_4',
    name: '专注大师',
    description: '完成 4 次专注',
    target: 4,
    progress: 0,
    reward: 50,
    completed: false,
  },
  {
    id: 'daily_focus_8',
    name: '专注王者',
    description: '完成 8 次专注',
    target: 8,
    progress: 0,
    reward: 100,
    completed: false,
  },
  // 探索类任务
  {
    id: 'daily_explore',
    name: '探索者',
    description: '探索 10 个格子',
    target: 10,
    progress: 0,
    reward: 20,
    completed: false,
  },
  {
    id: 'daily_explore_20',
    name: '星际探险家',
    description: '探索 20 个格子',
    target: 20,
    progress: 0,
    reward: 40,
    completed: false,
  },
  // 战斗类任务
  {
    id: 'daily_battle',
    name: '战斗新手',
    description: '赢得 1 场对战',
    target: 1,
    progress: 0,
    reward: 30,
    completed: false,
  },
  {
    id: 'daily_battle_3',
    name: '战斗老手',
    description: '赢得 3 场对战',
    target: 3,
    progress: 0,
    reward: 80,
    completed: false,
  },
  // 收集类任务
  {
    id: 'daily_collect',
    name: '收藏家',
    description: '收集 1 个新星灵',
    target: 1,
    progress: 0,
    reward: 25,
    completed: false,
  },
  // 运动类任务
  {
    id: 'daily_steps',
    name: '运动达人',
    description: '行走 5000 步',
    target: 5000,
    progress: 0,
    reward: 20,
    completed: false,
  },
  {
    id: 'daily_steps_10k',
    name: '运动健将',
    description: '行走 10000 步',
    target: 10000,
    progress: 0,
    reward: 50,
    completed: false,
  },
  // 商店类任务
  {
    id: 'daily_shop',
    name: '购物达人',
    description: '在商店消费 1 次',
    target: 1,
    progress: 0,
    reward: 15,
    completed: false,
  },
])

const completedCount = computed(() => {
  return tasks.value.filter(t => t.completed).length
})

const completionRate = computed(() => {
  return (completedCount.value / tasks.value.length) * 100
})

const claimTask = (task: any) => {
  if (task.progress >= task.target && !task.completed) {
    task.completed = true
    authStore.addEssence(task.reward)
    alert(`任务完成！获得 +${task.reward} 时光精粹`)
    saveTasks()
  }
}

// 初始化任务
onMounted(() => {
  loadDailyTasks()
})

const loadDailyTasks = () => {
  const today = new Date().toDateString()
  const saved = localStorage.getItem(`timevoyager_tasks_${today}`)
  if (saved) {
    const data = JSON.parse(saved)
    tasks.value = data.tasks || tasks.value
  }
}

const saveTasks = () => {
  const today = new Date().toDateString()
  localStorage.setItem(`timevoyager_tasks_${today}`, JSON.stringify({
    tasks: tasks.value,
  }))
}
</script>

<style scoped>
.tasks-view {
  padding: var(--spacing-md);
  padding-bottom: calc(var(--spacing-md) + var(--nav-height));
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  margin: 0;
}

.reset-time {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
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

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.task-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.task-card.completed {
  opacity: 0.6;
  background: var(--bg-secondary);
}

.task-content {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
}

.task-checkbox {
  margin-top: 2px;
}

.task-info {
  flex: 1;
}

.task-name {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.task-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.task-progress {
  margin-top: var(--spacing-sm);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.task-reward {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  flex-shrink: 0;
}

.reward-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
}
</style>
