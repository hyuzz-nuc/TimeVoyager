/**
 * Pinia Store - 星域地图管理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface MapTile {
  x: number
  y: number
  type: string
  unlocked: boolean
  explored: boolean
  hasReward: boolean
}

export const useMapStore = defineStore('map', () => {
  // 地图配置
  const mapSize = ref(10) // 10x10 网格
  const currentPos = ref({ x: 0, y: 0 }) // 当前位置
  
  // 地图图块
  const tiles = ref<MapTile[]>([])
  
  // 已探索数量
  const exploredCount = ref(0)
  
  // 地图类型权重
  const tileTypes = ref([
    { type: 'empty_space', weight: 30 },
    { type: 'nebula_purple', weight: 15 },
    { type: 'nebula_blue', weight: 15 },
    { type: 'nebula_pink', weight: 10 },
    { type: 'asteroid_small', weight: 10 },
    { type: 'asteroid_large', weight: 5 },
    { type: 'planet_rocky', weight: 5 },
    { type: 'planet_ice', weight: 3 },
    { type: 'planet_lava', weight: 2 },
    { type: 'comet_trail', weight: 3 },
    { type: 'base', weight: 1 },
    { type: 'shop', weight: 1 },
    { type: 'arena', weight: 1 },
  ])
  
  // Getters
  const totalTiles = computed(() => mapSize.value * mapSize.value)
  
  const explorationRate = computed(() => {
    return Math.round((exploredCount.value / totalTiles.value) * 100)
  })
  
  const grid = computed(() => {
    const result: MapTile[][] = []
    for (let y = 0; y < mapSize.value; y++) {
      const row: MapTile[] = []
      for (let x = 0; x < mapSize.value; x++) {
        const tile = tiles.value.find(t => t.x === x && t.y === y)
        if (tile) {
          row.push(tile)
        }
      }
      result.push(row)
    }
    return result
  })
  
  // Actions
  function generateMap() {
    tiles.value = []
    
    for (let y = 0; y < mapSize.value; y++) {
      for (let x = 0; x < mapSize.value; x++) {
        // 起始点固定为基础基地
        let type = 'base'
        if (x === 0 && y === 0) {
          type = 'base'
        } else {
          // 随机生成类型
          type = getRandomTileType()
        }
        
        tiles.value.push({
          x,
          y,
          type,
          unlocked: x === 0 && y === 0, // 只解锁起始点
          explored: x === 0 && y === 0,
          hasReward: Math.random() < 0.3, // 30% 概率有奖励
        })
      }
    }
    
    exploredCount.value = 1
    saveMap()
  }
  
  function getRandomTileType(): string {
    const totalWeight = tileTypes.value.reduce((sum, t) => sum + t.weight, 0)
    let random = Math.random() * totalWeight
    
    for (const tile of tileTypes.value) {
      random -= tile.weight
      if (random <= 0) {
        return tile.type
      }
    }
    
    return 'empty_space'
  }
  
  function move(toX: number, toY: number): boolean {
    const fromX = currentPos.value.x
    const fromY = currentPos.value.y
    
    // 检查是否相邻
    const dx = Math.abs(toX - fromX)
    const dy = Math.abs(toY - fromY)
    if (dx + dy !== 1) {
      return false // 不是相邻格子
    }
    
    // 检查目标格子是否已解锁
    const targetTile = tiles.value.find(t => t.x === toX && t.y === toY)
    if (!targetTile || !targetTile.unlocked) {
      return false
    }
    
    // 移动
    currentPos.value = { x: toX, y: toY }
    
    // 解锁周围的格子
    unlockAdjacent(toX, toY)
    
    return true
  }
  
  function unlockAdjacent(x: number, y: number) {
    const adjacent = [
      { x: x - 1, y },
      { x: x + 1, y },
      { x, y: y - 1 },
      { x, y: y + 1 },
    ]
    
    for (const pos of adjacent) {
      if (pos.x >= 0 && pos.x < mapSize.value && pos.y >= 0 && pos.y < mapSize.value) {
        const tile = tiles.value.find(t => t.x === pos.x && t.y === pos.y)
        if (tile && !tile.unlocked) {
          tile.unlocked = true
          exploredCount.value++
        }
      }
    }
    
    saveMap()
  }
  
  function exploreCurrentTile(): boolean {
    const currentTile = tiles.value.find(
      t => t.x === currentPos.value.x && t.y === currentPos.value.y
    )
    
    if (!currentTile || currentTile.explored) {
      return false
    }
    
    currentTile.explored = true
    
    // 如果有奖励，给予奖励
    if (currentTile.hasReward) {
      // TODO: 给予奖励（星能晶体/道具）
      currentTile.hasReward = false
    }
    
    saveMap()
    return true
  }
  
  function loadMap() {
    const saved = localStorage.getItem('timevoyager_map')
    if (saved) {
      const data = JSON.parse(saved)
      tiles.value = data.tiles || []
      currentPos.value = data.currentPos || { x: 0, y: 0 }
      exploredCount.value = data.exploredCount || 1
    } else {
      generateMap()
    }
  }
  
  function saveMap() {
    const data = {
      tiles: tiles.value,
      currentPos: currentPos.value,
      exploredCount: exploredCount.value,
    }
    localStorage.setItem('timevoyager_map', JSON.stringify(data))
  }
  
  // 初始化
  loadMap()
  
  return {
    // State
    mapSize,
    currentPos,
    tiles,
    exploredCount,
    tileTypes,
    
    // Getters
    totalTiles,
    explorationRate,
    grid,
    
    // Actions
    generateMap,
    move,
    exploreCurrentTile,
    loadMap,
    saveMap,
    unlockAdjacent,
  }
})
