/**
 * 可点击卡片组件 - 带点击反馈效果
 */

<template>
  <div
    class="clickable-card"
    :class="{ 'clickable-disabled': disabled }"
    @click="handleClick"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <slot />
    
    <!-- 点击波纹效果 -->
    <div class="ripple" :class="{ 'ripple-active': showRipple }"></div>
    
    <!-- 缩放效果 -->
    <div class="scale-feedback" :class="{ 'scale-active': showScale }"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click'])

const showRipple = ref(false)
const showScale = ref(false)

const handleTouchStart = () => {
  if (!props.disabled) {
    showScale.value = true
    showRipple.value = true
  }
}

const handleTouchEnd = () => {
  showScale.value = false
  setTimeout(() => {
    showRipple.value = false
  }, 300)
}

const handleClick = (event) => {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.clickable-card {
  position: relative;
  overflow: hidden;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
}

.clickable-card:active {
  transform: scale(0.96);
}

.clickable-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

/* 波纹效果 */
.ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease, opacity 0.3s ease;
  opacity: 0;
  pointer-events: none;
}

.ripple-active {
  width: 200%;
  height: 200%;
  opacity: 1;
}

/* 缩放反馈层 */
.scale-feedback {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.05);
  opacity: 0;
  transition: opacity 0.15s ease;
  pointer-events: none;
}

.scale-active {
  opacity: 1;
}
</style>
