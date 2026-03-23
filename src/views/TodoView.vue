<template>
  <div class="todo-view">
    <div class="header safe-area-top">
      <h1 class="title">待办清单</h1>
      <v-chip color="primary" size="small" variant="tonal">
        {{ todoStore.pendingTodos.length }} 待办
      </v-chip>
    </div>

    <!-- 今日统计 -->
    <v-card class="stats-card" elevation="2">
      <v-card-text>
        <div class="stats-row">
          <div class="stat-item">
            <div class="stat-value">{{ todoStore.todayStats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">{{ todoStore.todayStats.pending }}</div>
            <div class="stat-label">待完成</div>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <div class="stat-value">{{ todoStore.todayStats.crystals }}</div>
            <div class="stat-label">获得晶体</div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 添加待办按钮 -->
    <v-btn
      color="primary"
      size="large"
      block
      rounded="xl"
      class="add-btn"
      @click="showAddDialog = true"
    >
      <v-icon icon="mdi-plus" class="mr-2" />
      添加待办
    </v-btn>

    <!-- 待办列表 -->
    <div class="todos-list">
      <v-card
        v-for="todo in todoStore.pendingTodos"
        :key="todo.id"
        class="todo-card"
        elevation="2"
        :class="`priority-${todo.priority}`"
      >
        <v-card-text>
          <div class="todo-content">
            <v-checkbox
              :model-value="todo.completed"
              @change="completeTodo(todo.id)"
              class="todo-checkbox"
              hide-details
            />
            
            <div class="todo-info">
              <div class="todo-title">{{ todo.title }}</div>
              <div class="todo-desc" v-if="todo.description">{{ todo.description }}</div>
              <div class="todo-meta">
                <v-chip :color="getCategoryColor(todo.category)" size="x-small" variant="tonal">
                  {{ getCategoryName(todo.category) }}
                </v-chip>
                <v-chip color="accent" size="x-small" variant="tonal" class="ml-1">
                  <v-icon icon="mdi-gem" size="12" class="mr-1" />
                  +{{ todo.reward }}
                </v-chip>
              </div>
            </div>
            
            <div class="todo-actions">
              <v-btn icon size="small" variant="text" @click="editTodo(todo)">
                <v-icon icon="mdi-pencil" size="20" />
              </v-btn>
              <v-btn icon size="small" variant="text" color="error" @click="deleteTodo(todo.id)">
                <v-icon icon="mdi-delete" size="20" />
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
      
      <!-- 空状态 -->
      <div v-if="todoStore.pendingTodos.length === 0" class="empty-state">
        <v-icon icon="mdi-check-circle" size="80" color="grey" />
        <div class="empty-text">太棒了！所有待办都已完成！</div>
        <div class="empty-subtext">添加新待办继续获得奖励吧</div>
      </div>
    </div>

    <!-- 添加/编辑对话框 -->
    <v-dialog v-model="showAddDialog" max-width="400">
      <v-card>
        <v-card-title>{{ editingTodo ? '编辑待办' : '添加待办' }}</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="formData.title"
            label="标题 *"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          
          <v-textarea
            v-model="formData.description"
            label="描述"
            variant="outlined"
            density="compact"
            rows="2"
            class="mb-2"
          />
          
          <v-select
            v-model="formData.category"
            :items="todoStore.categories.map(c => ({ value: c.id, title: c.name }))"
            label="分类"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          
          <v-select
            v-model="formData.priority"
            :items="priorityOptions"
            label="优先级"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          
          <v-text-field
            v-model.number="formData.reward"
            label="奖励晶体"
            type="number"
            variant="outlined"
            density="compact"
            suffix="💎"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" variant="text" @click="cancelEdit">取消</v-btn>
          <v-btn color="primary" variant="tonal" @click="saveTodo">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useTodoStore, type Todo } from '@/stores/todo'
import { useUserStore } from '@/stores/user'

const todoStore = useTodoStore()
const userStore = useUserStore()

const showAddDialog = ref(false)
const editingTodo = ref<Todo | null>(null)

const priorityOptions = [
  { value: 'low', title: '低' },
  { value: 'medium', title: '中' },
  { value: 'high', title: '高' },
]

const formData = ref({
  title: '',
  description: '',
  category: 'other',
  priority: 'medium' as 'low' | 'medium' | 'high',
  reward: 1,
})

const getCategoryName = (categoryId: string) => {
  const cat = todoStore.categories.find(c => c.id === categoryId)
  return cat ? cat.name : categoryId
}

const getCategoryColor = (categoryId: string) => {
  const cat = todoStore.categories.find(c => c.id === categoryId)
  return cat ? cat.color : 'grey'
}

const completeTodo = (id: string) => {
  const reward = todoStore.completeTodo(id, userStore)
  if (reward > 0) {
    // TODO: 显示完成提示
    console.log(`待办完成！获得 +${reward} 晶体`)
  }
}

const editTodo = (todo: Todo) => {
  editingTodo.value = todo
  formData.value = {
    title: todo.title,
    description: todo.description || '',
    category: todo.category,
    priority: todo.priority,
    reward: todo.reward,
  }
  showAddDialog.value = true
}

const deleteTodo = (id: string) => {
  if (confirm('确定要删除这个待办吗？')) {
    todoStore.deleteTodo(id)
  }
}

const saveTodo = () => {
  if (!formData.value.title.trim()) {
    alert('请输入标题')
    return
  }
  
  if (editingTodo.value) {
    todoStore.updateTodo(editingTodo.value.id, formData.value)
  } else {
    todoStore.addTodo(formData.value)
  }
  
  showAddDialog.value = false
  resetForm()
}

const cancelEdit = () => {
  showAddDialog.value = false
  resetForm()
}

const resetForm = () => {
  editingTodo.value = null
  formData.value = {
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    reward: 1,
  }
}
</script>

<style scoped>
.todo-view {
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

.stats-card {
  margin-bottom: var(--spacing-lg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: var(--spacing-md);
}

.stat-item {
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

.add-btn {
  margin-bottom: var(--spacing-lg);
  height: var(--btn-height-lg);
  border-radius: var(--radius-full) !important;
}

.todos-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.todo-card {
  border-radius: var(--radius);
  border-left: 4px solid var(--border);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.todo-card.priority-high {
  border-left-color: var(--danger);
}

.todo-card.priority-medium {
  border-left-color: var(--warning);
}

.todo-card.priority-low {
  border-left-color: var(--success);
}

.todo-content {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  padding: var(--spacing-md);
}

.todo-checkbox {
  margin-top: 2px;
}

.todo-info {
  flex: 1;
}

.todo-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.todo-desc {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
}

.todo-meta {
  display: flex;
  gap: var(--spacing-xs);
  flex-wrap: wrap;
}

.todo-actions {
  display: flex;
  gap: var(--spacing-xs);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-md);
}

.empty-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  margin-top: var(--spacing-lg);
}

.empty-subtext {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-top: var(--spacing-xs);
}
</style>
