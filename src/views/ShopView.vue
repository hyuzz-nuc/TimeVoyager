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
            <v-icon :icon="item.icon" size="40" :color="item.color" />
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
  { value: 'spirit', label: '星灵' },
  { value: 'item', label: '道具' },
  { value: 'skin', label: '皮肤' },
]

const shopItems = [
  // 星灵类
  {
    id: 'spirit_random',
    name: '随机星灵',
    description: '随机获得一只星灵',
    price: 200,
    category: 'spirit',
    icon: 'mdi-star',
    color: 'primary',
  },
  {
    id: 'spirit_fire',
    name: '火之星灵',
    description: '火焰属性的星灵',
    price: 300,
    category: 'spirit',
    icon: 'mdi-fire',
    color: 'red',
  },
  {
    id: 'spirit_water',
    name: '水之星灵',
    description: '水属性的星灵',
    price: 300,
    category: 'spirit',
    icon: 'mdi-water',
    color: 'blue',
  },
  {
    id: 'spirit_wood',
    name: '木之星灵',
    description: '木属性的星灵',
    price: 300,
    category: 'spirit',
    icon: 'mdi-leaf',
    color: 'green',
  },
  // 道具类
  {
    id: 'item_focus_potion',
    name: '专注药水',
    description: '下次专注奖励 +50%',
    price: 50,
    category: 'item',
    icon: 'mdi-flask',
    color: 'blue',
  },
  {
    id: 'item_evolution_stone',
    name: '进化石',
    description: '星灵经验 +1000',
    price: 100,
    category: 'item',
    icon: 'mdi-gem',
    color: 'purple',
  },
  {
    id: 'item_protection',
    name: '保护罩',
    description: '对战失败不损失',
    price: 30,
    category: 'item',
    icon: 'mdi-shield',
    color: 'green',
  },
  {
    id: 'item_speed_boost',
    name: '加速道具',
    description: '专注时间缩短 25%',
    price: 40,
    category: 'item',
    icon: 'mdi-speedometer',
    color: 'orange',
  },
  {
    id: 'item_luck_charm',
    name: '幸运符',
    description: '探索奖励 +25%',
    price: 60,
    category: 'item',
    icon: 'mdi-clover',
    color: 'green',
  },
  // 皮肤类
  {
    id: 'skin_blue_theme',
    name: '蓝色主题',
    description: '界面蓝色主题',
    price: 150,
    category: 'skin',
    icon: 'mdi-palette',
    color: 'blue',
  },
  {
    id: 'skin_purple_theme',
    name: '紫色主题',
    description: '界面紫色主题',
    price: 150,
    category: 'skin',
    icon: 'mdi-palette',
    color: 'purple',
  },
  {
    id: 'skin_dark_theme',
    name: '暗黑主题',
    description: '界面暗黑主题',
    price: 200,
    category: 'skin',
    icon: 'mdi-moon-waning-crescent',
    color: 'grey',
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
