// Vuetify 配置 - 蓝紫渐变流光风格
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

export default createVuetify({
  theme: {
    defaultTheme: 'timeVoyager',
    themes: {
      timeVoyager: {
        dark: true,
        colors: {
          // 主色调 - 蓝紫渐变
          primary: '#7c73e6',      // 时光紫
          secondary: '#5c6bc0',    // 星域蓝
          accent: '#90caf9',       // 流光蓝
          
          // 背景色 - 深邃星空
          background: '#0f172a',   // 深空蓝黑
          surface: '#1e293b',      // 星尘灰
          
          // 文字色
          onBackground: '#e2e8f0',
          onSurface: '#f1f5f9',
          
          // 功能色
          success: '#4ade80',      // 能量绿
          warning: '#fbbf24',      // 警示黄
          error: '#f87171',        // 错误红
        }
      }
    }
  },
  defaults: {
    VBtn: {
      style: 'text',
      rounded: 'xl'
    },
    VCard: {
      rounded: 'xl',
      elevation: 2
    }
  },
  components,
  directives
})
