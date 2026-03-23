/**
 * Vuetify 3 配置 - 移动端优化
 * TimeVoyager 白色主题 + 圆角卡片风格
 */

// Styles
import 'vuetify/styles'

// Vue
import { createVuetify } from 'vuetify'

// Components
import * as components from 'vuetify/components'

// Directives - 完全移除所有指令避免兼容性问题
const directives = {}

// Icons
import { aliases, mdi } from 'vuetify/iconsets/mdi'

// 主题配置
const lightTheme = {
  dark: false,
  colors: {
    // 背景
    background: '#FFFFFF',
    surface: '#FFFFFF',
    'surface-secondary': '#F5F5F5',
    'surface-elevated': '#FAFAFA',
    
    // 主色 - 靛蓝（星域主题）
    primary: '#6366F1',
    'primary-darken-1': '#4F46E5',
    'primary-lighten-1': '#818CF8',
    
    // 辅助色 - 琥珀（星能晶体）
    secondary: '#F59E0B',
    'secondary-darken-1': '#D97706',
    'secondary-lighten-1': '#FBBF24',
    
    // 功能色
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // 文字
    'on-background': '#1F2937',
    'on-surface': '#1F2937',
    'on-surface-variant': '#6B7280',
    
    // 边框
    border: '#E5E7EB',
  }
}

// 全局配置
const defaults = {
  VBtn: {
    style: 'flat',
    density: 'comfortable',
    rounded: 'lg',
    ripple: false,  // 禁用 ripple 效果（兼容性问题）
  },
  VCard: {
    rounded: 'lg',
    elevation: 2,
  },
  VTextField: {
    variant: 'outlined',
    density: 'comfortable',
    rounded: 'lg',
  },
  VAppBar: {
    elevation: 2,
  },
}

export default createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'lightTheme',
    themes: {
      lightTheme,
    },
  },
  defaults,
  display: {
    // 移动端断点
    thresholds: {
      xs: false,
      sm: false,
      md: false,
      lg: false,
      xl: false,
      xxl: false,
    },
    scrollbarWidth: 12,
  },
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
})
