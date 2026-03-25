<template>
  <div class="map-view">
    <div class="header safe-area-top">
      <h1 class="title">星域地图</h1>
      <v-chip color="primary" size="small" variant="tonal">
        探索度：{{ mapStore.explorationRate }}%
      </v-chip>
    </div>

    <!-- 地图网格 -->
    <v-card class="map-card" elevation="2">
      <v-card-text>
        <div class="map-grid" :style="gridStyle">
          <div
            v-for="row in mapStore.grid"
            :key="row[0]?.y"
            class="map-row"
          >
            <div
              v-for="tile in row"
              :key="`${tile.x}-${tile.y}`"
              class="map-tile"
              :class="{
                'tile-current': tile.x === mapStore.currentPos.x && tile.y === mapStore.currentPos.y,
                'tile-unlocked': tile.unlocked,
                'tile-explored': tile.explored,
                'tile-has-reward': tile.hasReward && tile.unlocked,
                'tile-adjacent': isAdjacent(tile),
              }"
              @click="handleTileClick(tile)"
            >
              <!-- 像素素材 -->
              <img 
                :src="getTileImage(tile.type)" 
                :alt="getTileName(tile.type)"
                class="tile-image"
              />
              
              <!-- 奖励提示 -->
              <div v-if="tile.hasReward && tile.unlocked" class="reward-indicator">
                <img src="/src/assets/pixel/icons/crystal_small.png" alt="奖励" class="reward-icon" />
              </div>
              
              <!-- 未解锁遮罩 -->
              <div v-if="!tile.unlocked" class="tile-lock">
                <img src="/src/assets/pixel/icons/lock.png" alt="锁定" class="lock-icon" />
              </div>
              
              <!-- 玩家位置标记 -->
              <div v-if="tile.x === mapStore.currentPos.x && tile.y === mapStore.currentPos.y" class="player-marker">
                <img src="/src/assets/pixel/icons/player_marker.png" alt="玩家" class="marker-icon" />
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>

    <!-- 操作按钮 -->
    <v-card class="actions-card" elevation="2">
      <v-card-text>
        <div class="current-tile-info">
          <div class="tile-name">
            <v-icon :icon="getTileIcon(currentTile?.type || 'base')" class="mr-2" />
            {{ getTileName(currentTile?.type || 'base') }}
          </div>
          <div class="tile-coords">
            坐标：({{ mapStore.currentPos.x }}, {{ mapStore.currentPos.y }})
          </div>
        </div>
        
        <div class="action-buttons">
          <v-btn
            color="primary"
            variant="tonal"
            :disabled="!currentTile || currentTile.explored"
            @click="exploreTile"
          >
            <v-icon icon="mdi-magnify" class="mr-2" />
            探索
          </v-btn>
          
          <v-btn
            color="secondary"
            variant="outlined"
            @click="resetMap"
          >
            <v-icon icon="mdi-refresh" class="mr-2" />
            重置
          </v-btn>
        </div>
      </v-card-text>
    </v-card>

    <!-- 探索奖励弹窗 -->
    <v-dialog v-model="showRewardDialog" max-width="300" persistent>
      <v-card>
        <v-card-title class="text-center">
          <v-icon icon="mdi-gift" color="accent" size="48" class="mb-2" />
          <div class="text-h6">探索奖励!</div>
        </v-card-title>
        <v-card-text class="text-center">
          <p>发现星能晶体</p>
          <div class="reward-amount">
            <img src="/src/assets/pixel/currency/crystal_amber.png" alt="晶体" class="reward-icon" />
            <span>+{{ rewardAmount }}</span>
          </div>
        </v-card-text>
        <v-card-actions class="justify-center">
          <v-btn color="primary" @click="showRewardDialog = false">太棒了!</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 图例 -->
    <v-card class="legend-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-map-legend" class="mr-2" />
        图例
      </v-card-title>
      <v-card-text>
        <div class="legend-grid">
          <div class="legend-item">
            <v-icon icon="mdi-home" color="primary" size="20" />
            <span>基地</span>
          </div>
          <div class="legend-item">
            <v-icon icon="mdi-store" color="secondary" size="20" />
            <span>商店</span>
          </div>
          <div class="legend-item">
            <v-icon icon="mdi-sword" color="error" size="20" />
            <span>竞技场</span>
          </div>
          <div class="legend-item">
            <v-icon icon="mdi-planet" color="success" size="20" />
            <span>行星</span>
          </div>
          <div class="legend-item">
            <v-icon icon="mdi-weather-cloudy" color="info" size="20" />
            <span>星云</span>
          </div>
          <div class="legend-item">
            <v-icon icon="mdi-lock" color="grey" size="20" />
            <span>未解锁</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
    <!-- 图例 -->
    <v-card class="legend-card" elevation="2">
      <v-card-title class="card-title">
        <v-icon icon="mdi-map-legend" class="mr-2" />
        图例
      </v-card-title>
      <v-card-text>
        <div class="legend-grid">
          <div class="legend-item">
            <img src="/src/assets/pixel/tiles/tile_base.png" alt="基地" class="legend-icon" />
            <span>基地</span>
          </div>
          <div class="legend-item">
            <img src="/src/assets/pixel/tiles/tile_shop.png" alt="商店" class="legend-icon" />
            <span>商店</span>
          </div>
          <div class="legend-item">
            <img src="/src/assets/pixel/tiles/tile_arena.png" alt="竞技场" class="legend-icon" />
            <span>竞技场</span>
          </div>
          <div class="legend-item">
            <img src="/src/assets/pixel/tiles/tile_nebula_purple.png" alt="星云" class="legend-icon" />
            <span>星云</span>
          </div>
          <div class="legend-item">
            <img src="/src/assets/pixel/tiles/tile_asteroid_small.png" alt="小行星" class="legend-icon" />
            <span>小行星</span>
          </div>
          <div class="legend-item">
            <img src="/src/assets/pixel/tiles/tile_planet_rocky.png" alt="行星" class="legend-icon" />
            <span>行星</span>
          </div>
          <div class="legend-item">
            <v-icon icon="mdi-lock" color="grey" size="20" />
            <span>未解锁</span>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMapStore, type MapTile } from '@/stores/map'
import { useAuthStore } from '@/stores/auth'

const mapStore = useMapStore()
const authStore = useAuthStore()

// 当前格子
const currentTile = computed(() => {
  return mapStore.tiles.find(
    t => t.x === mapStore.currentPos.x && t.y === mapStore.currentPos.y
  )
})

// 网格样式
const gridStyle = computed(() => {
  const tileSize = 40 // 每个格子 40px
  const size = tileSize * mapStore.mapSize
  return {
    width: `${size}px`,
    height: `${size}px`,
  }
})

// 探索奖励弹窗
const showRewardDialog = ref(false)
const rewardAmount = ref(0)

// 获取格子图片
const getTileImage = (type: string) => {
  const imageMap: Record<string, string> = {
    'base': '/src/assets/pixel/tiles/tile_base.png',
    'shop': '/src/assets/pixel/tiles/tile_shop.png',
    'arena': '/src/assets/pixel/tiles/tile_arena.png',
    'empty_space': '/src/assets/pixel/tiles/tile_empty_space.png',
    'nebula_purple': '/src/assets/pixel/tiles/tile_nebula_purple.png',
    'nebula_blue': '/src/assets/pixel/tiles/tile_nebula_blue.png',
    'nebula_pink': '/src/assets/pixel/tiles/tile_nebula_pink.png',
    'asteroid_small': '/src/assets/pixel/tiles/tile_asteroid_small.png',
    'asteroid_large': '/src/assets/pixel/tiles/tile_asteroid_large.png',
    'planet_rocky': '/src/assets/pixel/tiles/tile_planet_rocky.png',
    'planet_ice': '/src/assets/pixel/tiles/tile_planet_ice.png',
    'planet_lava': '/src/assets/pixel/tiles/tile_planet_lava.png',
    'planet_green': '/src/assets/pixel/tiles/tile_planet_green.png',
    'comet': '/src/assets/pixel/tiles/tile_comet.png',
    'comet_trail': '/src/assets/pixel/tiles/tile_comet_trail.png',
    'blackhole': '/src/assets/pixel/tiles/tile_blackhole.png',
    'station': '/src/assets/pixel/tiles/tile_station.png',
    'stargate': '/src/assets/pixel/tiles/tile_stargate.png',
    'observation': '/src/assets/pixel/tiles/tile_observation.png',
    'temple': '/src/assets/pixel/tiles/tile_temple.png',
    'bank': '/src/assets/pixel/tiles/tile_bank.png',
  }
  return imageMap[type] || '/src/assets/pixel/tiles/tile_empty_space.png'
}

// 获取格子图标（备用）
const getTileIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'base': 'mdi-home',
    'shop': 'mdi-store',
    'arena': 'mdi-sword',
    'empty_space': 'mdi-circle-outline',
    'nebula_purple': 'mdi-weather-cloudy',
    'nebula_blue': 'mdi-weather-cloudy',
    'nebula_pink': 'mdi-weather-cloudy',
    'asteroid_small': 'mdi-circle-small',
    'asteroid_large': 'mdi-circle',
    'planet_rocky': 'mdi-planet',
    'planet_ice': 'mdi-snowflake',
    'planet_lava': 'mdi-fire',
    'comet_trail': 'mdi-weather-windy',
  }
  return iconMap[type] || 'mdi-circle-outline'
}

// 获取格子名称
const getTileName = (type: string) => {
  const nameMap: Record<string, string> = {
    'base': '玩家基地',
    'shop': '星能商店',
    'arena': '对战竞技场',
    'empty_space': '空旷星空',
    'nebula_purple': '紫色星云',
    'nebula_blue': '蓝色星云',
    'nebula_pink': '粉色星云',
    'asteroid_small': '小行星',
    'asteroid_large': '大行星',
    'planet_rocky': '岩石行星',
    'planet_ice': '冰原行星',
    'planet_lava': '熔岩行星',
    'comet_trail': '彗星轨迹',
  }
  return nameMap[type] || '未知区域'
}

// 获取格子颜色
const getTileColor = (tile: MapTile) => {
  if (!tile.unlocked) return 'grey'
  if (tile.x === mapStore.currentPos.x && tile.y === mapStore.currentPos.y) return 'primary'
  
  const colorMap: Record<string, string> = {
    'base': 'primary',
    'shop': 'secondary',
    'arena': 'error',
    'planet_rocky': 'success',
    'planet_ice': 'info',
    'planet_lava': 'warning',
  }
  return colorMap[tile.type] || 'grey'
}

// 检查是否相邻
const isAdjacent = (tile: MapTile) => {
  const dx = Math.abs(tile.x - mapStore.currentPos.x)
  const dy = Math.abs(tile.y - mapStore.currentPos.y)
  return dx + dy === 1
}

// 检查是否可以移动
const canMoveTo = (tile: MapTile) => {
  return isAdjacent(tile) && tile.unlocked
}

// 处理格子点击
const handleTileClick = (tile: MapTile) => {
  if (!tile.unlocked) {
    // 未解锁，检查是否相邻
    if (isAdjacent(tile)) {
      // 相邻，可以探索解锁
      exploreAndUnlock(tile)
    } else {
      alert('只能探索相邻的格子哦！')
    }
    return
  }
  
  // 已解锁，尝试移动
  const success = mapStore.move(tile.x, tile.y)
  if (success) {
    // 移动成功后自动探索
    setTimeout(() => {
      exploreTile()
    }, 300)
  }
}

// 探索并解锁格子
const exploreAndUnlock = (tile: MapTile) => {
  tile.unlocked = true
  mapStore.exploredCount++
  mapStore.saveMap()
  
  // 延迟后探索
  setTimeout(() => {
    exploreTile(tile)
  }, 300)
}

// 探索格子
const exploreTile = (tile?: MapTile) => {
  const current = tile || currentTile.value
  if (!current) return
  
  const success = mapStore.exploreCurrentTile()
  if (success && current.hasReward) {
    // 显示奖励
    rewardAmount.value = Math.floor(Math.random() * 10) + 5
    authStore.addCrystals(rewardAmount.value)
    showRewardDialog.value = true
    current.hasReward = false
    mapStore.saveMap()
  }
}

// 重置地图
const resetMap = () => {
  if (confirm('确定要重置地图吗？进度将丢失！')) {
    mapStore.generateMap()
  }
}

// 初始化
onMounted(() => {
  if (mapStore.tiles.length === 0) {
    mapStore.generateMap()
  }
})
</script>

<style scoped>
.map-view {
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

.map-card,
.actions-card,
.legend-card {
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

.map-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 2px;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.map-row {
  display: contents;
}

.map-tile {
  aspect-ratio: 1;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all var(--transition-fast);
  cursor: pointer;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.tile-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.map-tile.tile-unlocked {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.05);
}

.map-tile.tile-current {
  border-color: var(--primary);
  background: rgba(99, 102, 241, 0.15);
  transform: scale(1.15);
  box-shadow: var(--shadow-md);
  z-index: 10;
}

.map-tile.tile-adjacent {
  border-color: var(--accent);
  animation: pulse 2s infinite;
}

.map-tile.tile-explored {
  opacity: 0.7;
}

.map-tile.tile-has-reward {
  border-color: var(--accent);
}

.tile-lock {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
}

.lock-icon {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
}

.reward-indicator {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 1;
  animation: bounce 1s infinite;
}

.reward-icon {
  width: 12px;
  height: 12px;
  image-rendering: pixelated;
}

.player-marker {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 24px;
  height: 24px;
  z-index: 2;
  pointer-events: none;
}

.marker-icon {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 4px var(--primary));
  animation: marker-pulse 1.5s infinite;
}

@keyframes marker-pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

@keyframes pulse {
  0%, 100% {
    box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.4);
  }
  50% {
    box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
  }
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-2px);
  }
}

.current-tile-info {
  text-align: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
}

.tile-name {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.tile-coords {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
  padding: var(--spacing-md);
}

.action-buttons .v-btn {
  flex: 1;
  height: var(--btn-height-lg);
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-sm);
  padding: var(--spacing-md);
}

.legend-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
}

.reward-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
  margin: var(--spacing-lg) 0;
}

.reward-icon {
  width: 32px;
  height: 32px;
  image-rendering: pixelated;
}
</style>
