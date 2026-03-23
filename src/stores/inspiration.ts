/**
 * Pinia Store - 灵感记录管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface Inspiration {
  id: string
  title: string
  content: string
  tags: string[]
  createdAt: number
  updatedAt: number
}

export const useInspirationStore = defineStore('inspiration', () => {
  // 灵感列表
  const inspirations = ref<Inspiration[]>([])
  
  // 标签列表
  const tags = ref<string[]>([])
  
  // Getters
  const sortedInspirations = computed(() => {
    return [...inspirations.value].sort((a, b) => b.updatedAt - a.updatedAt)
  })
  
  const inspirationsByTag = computed(() => {
    const groups: Record<string, Inspiration[]> = {}
    inspirations.value.forEach(i => {
      i.tags.forEach(tag => {
        if (!groups[tag]) groups[tag] = []
        groups[tag].push(i)
      })
    })
    return groups
  })
  
  // Actions
  function loadInspirations() {
    const saved = localStorage.getItem('timevoyager_inspirations')
    if (saved) {
      const data = JSON.parse(saved)
      inspirations.value = data.inspirations || []
      tags.value = data.tags || []
    }
  }
  
  function saveInspirations() {
    const data = {
      inspirations: inspirations.value,
      tags: tags.value,
    }
    localStorage.setItem('timevoyager_inspirations', JSON.stringify(data))
  }
  
  function addInspiration(title: string, content: string, newTags: string[]) {
    const inspiration: Inspiration = {
      id: Date.now().toString(),
      title,
      content,
      tags: newTags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    
    inspirations.value.unshift(inspiration)
    
    // 更新标签列表
    newTags.forEach(tag => {
      if (!tags.value.includes(tag)) {
        tags.value.push(tag)
      }
    })
    
    saveInspirations()
    return inspiration
  }
  
  function updateInspiration(id: string, updates: Partial<Inspiration>) {
    const inspiration = inspirations.value.find(i => i.id === id)
    if (inspiration) {
      Object.assign(inspiration, updates)
      inspiration.updatedAt = Date.now()
      saveInspirations()
    }
  }
  
  function deleteInspiration(id: string) {
    inspirations.value = inspirations.value.filter(i => i.id !== id)
    saveInspirations()
  }
  
  function searchInspirations(query: string) {
    const q = query.toLowerCase()
    return inspirations.value.filter(i => 
      i.title.toLowerCase().includes(q) ||
      i.content.toLowerCase().includes(q) ||
      i.tags.some(t => t.toLowerCase().includes(q))
    )
  }
  
  // 初始化
  loadInspirations()
  
  return {
    // State
    inspirations,
    tags,
    
    // Getters
    sortedInspirations,
    inspirationsByTag,
    
    // Actions
    loadInspirations,
    saveInspirations,
    addInspiration,
    updateInspiration,
    deleteInspiration,
    searchInspirations,
  }
})
