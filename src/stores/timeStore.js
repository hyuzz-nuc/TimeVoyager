import { reactive, readonly } from 'vue'

// 时光精粹存储 - LocalStorage
const STORAGE_KEY = 'timevoyager_state'

const loadState = () => {
  const saved = localStorage.getItem(STORAGE_KEY)
  return saved ? JSON.parse(saved) : null
}

const saveState = (state) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// 初始状态
const initialState = {
  // 专注数据
  focus: {
    totalMinutes: 0,        // 累计专注分钟
    sessions: 0,            // 专注次数
    todayMinutes: 0,        // 今日专注分钟
    lastFocusDate: null     // 上次专注日期
  },
  
  // 时光精粹（货币）
  essence: {
    total: 0,               // 累计获得
    spent: 0,               // 已消耗
    current: 0              // 当前可用
  },
  
  // 时光灵体
  spirit: {
    level: 1,               // 等级
    exp: 0,                 // 当前经验
    maxExp: 100,            // 升级所需经验
    form: 'initial',        // 形态：initial, growing, mature, cosmic
    unlockedForms: ['initial']
  },
  
  // 探索进度
  explore: {
    unlockedZones: 1,       // 解锁星域数量
    currentZone: 1,         // 当前所在星域
    totalSteps: 0           // 总步数（运动）
  },
  
  // 成就
  achievements: {
    unlocked: []            // 已解锁成就 ID 列表
  }
}

// 合并保存的状态
const savedState = loadState()
const state = savedState 
  ? { ...initialState, ...savedState, focus: { ...initialState.focus, ...savedState.focus }, essence: { ...initialState.essence, ...savedState.essence }, spirit: { ...initialState.spirit, ...savedState.spirit }, explore: { ...initialState.explore, ...savedState.explore }, achievements: { ...initialState.achievements, ...savedState.achievements } }
  : { ...initialState }

// 每日重置检查
const checkDailyReset = () => {
  const today = new Date().toDateString()
  if (state.focus.lastFocusDate !== today) {
    state.focus.todayMinutes = 0
    state.focus.lastFocusDate = today
    saveState(state)
  }
}

checkDailyReset()

// Actions
const addFocusTime = (minutes) => {
  state.focus.totalMinutes += minutes
  state.focus.todayMinutes += minutes
  state.focus.sessions += 1
  
  // 获得时光精粹（每分钟 1 个）
  state.essence.total += minutes
  state.essence.current += minutes
  
  // 灵体获得经验（每分钟 10 点）
  addExp(minutes * 10)
  
  saveState(state)
}

const spendEssence = (amount) => {
  if (state.essence.current >= amount) {
    state.essence.current -= amount
    state.essence.spent += amount
    saveState(state)
    return true
  }
  return false
}

const addExp = (exp) => {
  state.spirit.exp += exp
  while (state.spirit.exp >= state.spirit.maxExp) {
    state.spirit.exp -= state.spirit.maxExp
    state.spirit.level += 1
    state.spirit.maxExp = Math.floor(state.spirit.maxExp * 1.5)
    
    // 形态进化
    if (state.spirit.level >= 50 && !state.spirit.unlockedForms.includes('cosmic')) {
      state.spirit.form = 'cosmic'
      state.spirit.unlockedForms.push('cosmic')
    } else if (state.spirit.level >= 30 && !state.spirit.unlockedForms.includes('mature')) {
      state.spirit.form = 'mature'
      state.spirit.unlockedForms.push('mature')
    } else if (state.spirit.level >= 10 && !state.spirit.unlockedForms.includes('growing')) {
      state.spirit.form = 'growing'
      state.spirit.unlockedForms.push('growing')
    }
  }
  saveState(state)
}

const addSteps = (steps) => {
  state.explore.totalSteps += steps
  // 每 1000 步获得 1 个精粹
  const essence = Math.floor(steps / 1000)
  if (essence > 0) {
    state.essence.total += essence
    state.essence.current += essence
  }
  saveState(state)
  return essence
}

const unlockAchievement = (id) => {
  if (!state.achievements.unlocked.includes(id)) {
    state.achievements.unlocked.push(id)
    saveState(state)
    return true
  }
  return false
}

export const useStore = () => {
  return {
    state: readonly(state),
    addFocusTime,
    spendEssence,
    addSteps,
    unlockAchievement,
    saveState
  }
}
