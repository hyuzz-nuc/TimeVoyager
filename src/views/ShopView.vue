<template>
  <div class="shop-view">
    <div class="header safe-area-top">
      <h1 class="title">星能商店</h1>
      <div class="crystal-display">
        <img src="/src/assets/pixel/currency/crystal_amber.png" alt="晶体" class="crystal-icon" />
        <span class="crystal-count">{{ authStore.crystals }}</span>
      </div>
    </div>

    <!-- 商品分类 -->
    <div class="category-tabs">
      <v-chip
        v-for="cat in categories"
        :key="cat.value"
        :color="currentCategory === cat.value ? 'primary' : 'grey'"
        :variant="currentCategory === cat.value ? 'tonal' : 'outlined'"
        size="small"
        class="category-chip"
        @click="currentCategory = cat.value"
      >
        {{ cat.label }}
      </v-chip>
    </div>

    <!-- 商品列表 -->
    <div class="shop-grid">
      <v-card
        v-for="item in filteredItems"
        :key="item.id"
        class="shop-item"
        elevation="2"
      >
        <v-card-text>
          <div class="item-icon">
            <img :src="item.imagePath" :alt="item.name" class="item-image" />
          </div>
          <div class="item-name">{{ item.name }}</div>
          <div class="item-desc">{{ item.description }}</div>
          <div class="item-price">
            <img src="/src/assets/pixel/currency/crystal_amber.png" alt="晶体" class="price-icon" />
            <span class="price-value">{{ item.price }}</span>
          </div>
          <v-btn
            color="primary"
            size="small"
            block
            :disabled="authStore.crystals < item.price"
            @click="buyItem(item)"
          >
            购买
          </v-btn>
        </v-card-text>
      </v-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const currentCategory = ref('all')

const categories = [
  { value: 'all', label: '全部' },
  { value: 'material', label: '材料' },
  { value: 'item', label: '道具' },
]

const shopItems = [
  // 材料类
  {
    id: 'material_evolution_stone',
    name: '进化石',
    description: '进化星灵必备',
    price: 50,
    category: 'material',
    imagePath: '/src/assets/pixel/items/evolution_stone.png',
  },
  {
    id: 'material_crystal',
    name: '星能晶体',
    description: '通用货币',
    price: 10,
    category: 'material',
    imagePath: '/src/assets/pixel/items/crystal.png',
  },
  // 治疗类
  {
    id: 'potion_small',
    name: '小型治疗药水',
    description: '回复 30% HP',
    price: 50,
    category: 'item',
    imagePath: '/src/assets/pixel/items/potion_small.png',
  },
  {
    id: 'potion_medium',
    name: '中型治疗药水',
    description: '回复 50% HP',
    price: 100,
    category: 'item',
    imagePath: '/src/assets/pixel/items/potion_medium.png',
  },
  {
    id: 'potion_large',
    name: '大型治疗药水',
    description: '回复 80% HP',
    price: 200,
    category: 'item',
    imagePath: '/src/assets/pixel/items/potion_large.png',
  },
  // 状态解除类
  {
    id: 'antidote',
    name: '解毒剂',
    description: '解除中毒状态',
    price: 30,
    category: 'item',
    imagePath: '/src/assets/pixel/items/antidote.png',
  },
  {
    id: 'awaken',
    name: '清醒剂',
    description: '解除麻痹/眩晕',
    price: 40,
    category: 'item',
    imagePath: '/src/assets/pixel/items/awaken.png',
  },
  // 增益类
  {
    id: 'attack_boost',
    name: '攻击强化剂',
    description: '攻击 +30%，3 回合',
    price: 120,
    category: 'item',
    imagePath: '/src/assets/pixel/items/attack_boost.png',
  },
  {
    id: 'defense_boost',
    name: '防御强化剂',
    description: '防御 +30%，3 回合',
    price: 120,
    category: 'item',
    imagePath: '/src/assets/pixel/items/defense_boost.png',
  },
  {
    id: 'speed_boost',
    name: '速度强化剂',
    description: '速度 +30%，3 回合',
    price: 120,
    category: 'item',
    imagePath: '/src/assets/pixel/items/speed_boost.png',
  },
  // 特殊类
  {
    id: 'revive',
    name: '复活药',
    description: '复活 +50% HP',
    price: 1000,
    category: 'item',
    imagePath: '/src/assets/pixel/items/revive.png',
  },
  {
    id: 'smoke_bomb',
    name: '烟雾弹',
    description: '100% 逃跑',
    price: 50,
    category: 'item',
    imagePath: '/src/assets/pixel/items/smoke_bomb.png',
  },
]

const filteredItems = computed(() => {
  if (currentCategory.value === 'all') {
    return shopItems
  }
  return shopItems.filter(item => item.category === currentCategory.value)
})

const buyItem = (item: any) => {
  if (authStore.spendCrystals(item.price)) {
    alert(`购买成功：${item.name}`)
    // TODO: 发放物品
  } else {
    alert('晶体不足！')
  }
}
</script>

<style scoped>
.shop-view {
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

.crystal-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  background: var(--bg-card);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.crystal-icon {
  width: 24px;
  height: 24px;
  image-rendering: pixelated;
}

.crystal-count {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
}

.category-tabs {
  display: flex;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-lg);
  overflow-x: auto;
}

.category-chip {
  white-space: nowrap;
  height: 36px;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-md);
}

.shop-item {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.item-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-sm);
  background: var(--bg-secondary);
  border-radius: var(--radius);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}

.item-name {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  text-align: center;
  margin-bottom: var(--spacing-xs);
}

.item-desc {
  font-size: 10px;
  color: var(--text-secondary);
  text-align: center;
  margin-bottom: var(--spacing-sm);
}

.item-price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  margin-bottom: var(--spacing-sm);
}

.price-icon {
  width: 16px;
  height: 16px;
  image-rendering: pixelated;
}

.price-value {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-bold);
  color: var(--accent);
}
</style>
