/**
 * Pinia Store - 待办清单管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Todo {
  id: string
  title: string
  description?: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
  category: string
  createdAt: number
  completedAt?: number
  reward: number // 完成奖励的星能晶体
}

export const useTodoStore = defineStore('todo', () => {
  // 待办列表
  const todos = ref<Todo[]>([])
  
  // 分类列表
  const categories = ref([
    { id: 'work', name: '工作', color: 'primary' },
    { id: 'study', name: '学习', color: 'success' },
    { id: 'personal', name: '个人', color: 'secondary' },
    { id: 'health', name: '健康', color: 'error' },
    { id: 'other', name: '其他', color: 'grey' },
  ])
  
  // 今日统计
  const todayStats = ref({
    total: 0,
    completed: 0,
    pending: 0,
    crystals: 0,
  })
  
  // Getters
  const pendingTodos = computed(() => {
    return todos.value.filter(t => !t.completed)
  })
  
  const completedTodos = computed(() => {
    return todos.value.filter(t => t.completed)
  })
  
  const todosByCategory = computed(() => {
    const groups: Record<string, Todo[]> = {}
    todos.value.forEach(t => {
      if (!groups[t.category]) groups[t.category] = []
      groups[t.category].push(t)
    })
    return groups
  })
  
  const completionRate = computed(() => {
    if (todos.value.length === 0) return 0
    return Math.round((completedTodos.value.length / todos.value.length) * 100)
  })
  
  // Actions
  function loadTodos() {
    const saved = localStorage.getItem('timevoyager_todos')
    if (saved) {
      todos.value = JSON.parse(saved)
      calculateTodayStats()
    }
  }
  
  function saveTodos() {
    localStorage.setItem('timevoyager_todos', JSON.stringify(todos.value))
    calculateTodayStats()
  }
  
  function calculateTodayStats() {
    const today = new Date().toDateString()
    const todayCompleted = completedTodos.value.filter(t => {
      if (!t.completedAt) return false
      return new Date(t.completedAt).toDateString() === today
    })
    
    todayStats.value = {
      total: todos.value.length,
      completed: todayCompleted.length,
      pending: pendingTodos.value.length,
      crystals: todayCompleted.reduce((sum, t) => sum + t.reward, 0),
    }
  }
  
  function addTodo(todo: Omit<Todo, 'id' | 'createdAt' | 'completed' | 'completedAt'>) {
    const newTodo: Todo = {
      ...todo,
      id: Date.now().toString(),
      createdAt: Date.now(),
      completed: false,
    }
    todos.value.push(newTodo)
    saveTodos()
    return newTodo
  }
  
  function updateTodo(id: string, updates: Partial<Todo>) {
    const todo = todos.value.find(t => t.id === id)
    if (todo) {
      Object.assign(todo, updates)
      saveTodos()
    }
  }
  
  function deleteTodo(id: string) {
    todos.value = todos.value.filter(t => t.id !== id)
    saveTodos()
  }
  
  function completeTodo(id: string, userStore: any): number {
    const todo = todos.value.find(t => t.id === id)
    if (todo && !todo.completed) {
      todo.completed = true
      todo.completedAt = Date.now()
      saveTodos()
      
      // 发放奖励
      if (userStore && userStore.addCrystals) {
        userStore.addCrystals(todo.reward)
      }
      
      return todo.reward
    }
    return 0
  }
  
  function uncompleteTodo(id: string) {
    const todo = todos.value.find(t => t.id === id)
    if (todo && todo.completed) {
      todo.completed = false
      todo.completedAt = undefined
      saveTodos()
    }
  }
  
  function clearCompleted() {
    todos.value = todos.value.filter(t => !t.completed)
    saveTodos()
  }
  
  // 初始化
  loadTodos()
  
  return {
    // State
    todos,
    categories,
    todayStats,
    
    // Getters
    pendingTodos,
    completedTodos,
    todosByCategory,
    completionRate,
    
    // Actions
    loadTodos,
    saveTodos,
    addTodo,
    updateTodo,
    deleteTodo,
    completeTodo,
    uncompleteTodo,
    clearCompleted,
  }
})
