<template>
  <div class="inspiration-view">
    <div class="header safe-area-top">
      <h1 class="title">灵感记录</h1>
      <v-btn icon color="primary" @click="showAddDialog = true">
        <v-icon icon="mdi-plus" />
      </v-btn>
    </div>

    <!-- 搜索框 -->
    <v-text-field
      v-model="searchQuery"
      placeholder="搜索灵感..."
      variant="outlined"
      density="compact"
      prepend-inner-icon="mdi-magnify"
      class="mb-2"
      clearable
      hide-details
    />

    <!-- 标签筛选 -->
    <div class="tags-filter" v-if="inspirationStore.tags.length > 0">
      <v-chip
        v-for="tag in inspirationStore.tags"
        :key="tag"
        :color="selectedTag === tag ? 'primary' : 'grey'"
        :variant="selectedTag === tag ? 'tonal' : 'outlined'"
        size="small"
        class="mr-1 mb-1"
        @click="toggleTag(tag)"
      >
        #{{ tag }}
      </v-chip>
    </div>

    <!-- 灵感列表 -->
    <div class="inspirations-list">
      <v-card
        v-for="inspiration in filteredInspirations"
        :key="inspiration.id"
        class="inspiration-card"
        elevation="2"
        @click="viewInspiration(inspiration)"
      >
        <v-card-text>
          <div class="inspiration-title">{{ inspiration.title }}</div>
          <div class="inspiration-preview">{{ inspiration.content }}</div>
          <div class="inspiration-meta">
            <div class="inspiration-tags">
              <v-chip
                v-for="tag in inspiration.tags.slice(0, 3)"
                :key="tag"
                color="primary"
                size="x-small"
                variant="tonal"
                class="mr-1"
              >
                #{{ tag }}
              </v-chip>
            </div>
            <div class="inspiration-date">
              {{ formatDate(inspiration.updatedAt) }}
            </div>
          </div>
        </v-card-text>
      </v-card>
      
      <!-- 空状态 -->
      <div v-if="filteredInspirations.length === 0" class="empty-state">
        <v-icon icon="mdi-lightbulb-outline" size="80" color="grey" />
        <div class="empty-text">还没有灵感记录</div>
        <div class="empty-subtext">点击 + 号记录你的想法</div>
      </div>
    </div>

    <!-- 添加灵感对话框 -->
    <v-dialog v-model="showAddDialog" max-width="500">
      <v-card>
        <v-card-title>记录灵感</v-card-title>
        <v-card-text>
          <v-text-field
            v-model="formData.title"
            label="标题 *"
            variant="outlined"
            density="compact"
            class="mb-2"
          />
          
          <v-textarea
            v-model="formData.content"
            label="灵感内容 *"
            variant="outlined"
            density="compact"
            rows="5"
            class="mb-2"
            placeholder="随时记录你的想法..."
          />
          
          <v-combobox
            v-model="formData.tags"
            label="标签"
            variant="outlined"
            density="compact"
            multiple
            chips
            placeholder="输入标签后按回车"
            hint="按回车添加标签"
          />
        </v-card-text>
        <v-card-actions>
          <v-btn color="grey" variant="text" @click="showAddDialog = false">取消</v-btn>
          <v-btn color="primary" variant="tonal" @click="saveInspiration">保存</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- 查看/编辑灵感对话框 -->
    <v-dialog v-model="showViewDialog" max-width="500">
      <v-card v-if="viewingInspiration">
        <v-card-title>{{ viewingInspiration.title }}</v-card-title>
        <v-card-text>
          <div class="view-content">{{ viewingInspiration.content }}</div>
          <div class="view-tags">
            <v-chip
              v-for="tag in viewingInspiration.tags"
              :key="tag"
              color="primary"
              size="small"
              variant="tonal"
              class="mr-1 mb-1"
            >
              #{{ tag }}
            </v-chip>
          </div>
          <div class="view-date">
            创建于 {{ formatDateTime(viewingInspiration.createdAt) }}
            <br>
            更新于 {{ formatDateTime(viewingInspiration.updatedAt) }}
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="error" variant="text" @click="deleteInspiration(viewingInspiration.id)">
            <v-icon icon="mdi-delete" class="mr-1" />
            删除
          </v-btn>
          <v-spacer />
          <v-btn color="grey" variant="text" @click="showViewDialog = false">关闭</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useInspirationStore } from '@/stores/inspiration'

const inspirationStore = useInspirationStore()

const searchQuery = ref('')
const selectedTag = ref('')
const showAddDialog = ref(false)
const showViewDialog = ref(false)
const viewingInspiration = ref(null)

const formData = ref({
  title: '',
  content: '',
  tags: [] as string[],
})

const filteredInspirations = computed(() => {
  let result = inspirationStore.sortedInspirations
  
  // 标签筛选
  if (selectedTag.value) {
    result = result.filter(i => i.tags.includes(selectedTag.value))
  }
  
  // 搜索
  if (searchQuery.value) {
    result = inspirationStore.searchInspirations(searchQuery.value)
  }
  
  return result
})

const toggleTag = (tag: string) => {
  selectedTag.value = selectedTag.value === tag ? '' : tag
}

const formatDate = (timestamp: number) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return '今天'
  if (days === 1) return '昨天'
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}

const formatDateTime = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const saveInspiration = () => {
  if (!formData.value.title.trim() || !formData.value.content.trim()) {
    alert('请填写标题和内容')
    return
  }
  
  inspirationStore.addInspiration(
    formData.value.title,
    formData.value.content,
    formData.value.tags
  )
  
  showAddDialog.value = false
  resetForm()
}

const viewInspiration = (inspiration: any) => {
  viewingInspiration.value = inspiration
  showViewDialog.value = true
}

const deleteInspiration = (id: string) => {
  if (confirm('确定要删除这条灵感吗？')) {
    inspirationStore.deleteInspiration(id)
    showViewDialog.value = false
  }
}

const resetForm = () => {
  formData.value = {
    title: '',
    content: '',
    tags: [],
  }
}
</script>

<style scoped>
.inspiration-view {
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

.tags-filter {
  margin-bottom: var(--spacing-lg);
  display: flex;
  flex-wrap: wrap;
}

.inspirations-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.inspiration-card {
  border-radius: var(--radius);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.inspiration-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.inspiration-card:active {
  transform: translateY(0);
}

.inspiration-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin-bottom: var(--spacing-xs);
}

.inspiration-preview {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-sm);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.inspiration-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.inspiration-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-xs);
}

.inspiration-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
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

.view-content {
  white-space: pre-wrap;
  font-size: var(--font-size-sm);
  line-height: 1.6;
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.view-tags {
  margin-bottom: var(--spacing-md);
  padding: 0 var(--spacing-md);
}

.view-date {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  padding: 0 var(--spacing-md);
}
</style>
