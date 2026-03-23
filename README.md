# TimeVoyager — 时光旅行者

> **专注即探索，时间换世界** 🚀

一款专注计时 + 放置类游戏应用，通过将专注时间转化为"时光精粹"，培养你的"时光灵体"，探索神秘的"时光星域"。

---

## ✨ 特性

- 🍅 **专注计时** - 番茄工作法，培养专注习惯
- 💎 **时光精粹** - 专注获得货币，用于解锁内容
- 🌟 **时光灵体** - 养成你的数字宠物，见证进化
- 🗺️ **星域探索** - 6 个神秘星域等待解锁
- 🏆 **成就系统** - 12 个成就挑战你的极限
- 📱 **多平台** - Web、Windows、macOS、Linux 全支持
- 📲 **PWA** - 离线可用，可安装到主屏幕

---

## 🚀 快速开始

### 在线体验（Web 版）

访问：https://hyuzz-nuc.github.io/time-voyager/ （待部署）

### 本地开发

```bash
# 克隆项目
git clone <repository-url>
cd TimeVoyager

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:5173
```

### 桌面应用

```bash
# 构建并打包
npm run electron:build

# 安装包在 release/ 目录
```

---

## 📖 功能说明

### 专注计时

选择专注时长（15/25/45/60 分钟），开始专注后获得时光精粹。

- 1 分钟专注 = 1 个时光精粹
- 1 分钟专注 = 10 点灵体经验

### 时光灵体

通过专注和运动培养你的灵体，见证 4 个进化阶段：

| 等级 | 形态 | 说明 |
|------|------|------|
| Lv.1 | 初始形态 | 小小的光点 |
| Lv.10 | 成长形态 | 开始发光 |
| Lv.30 | 成熟形态 | 形态稳定 |
| Lv.50 | 宇宙形态 | 与宇宙共鸣 |

### 星域探索

解锁 6 个神秘星域，每解锁一个新星域需要达到一定条件。

- 星域 1：初始星域（已解锁）
- 星域 2-6：等待探索...

### 成就系统

12 个成就挑战，记录你的成长轨迹：

- 专注新手：累计专注 100 分钟
- 专注达人：累计专注 1000 分钟
- 专注大师：累计专注 10000 分钟
- 收集者：累计获得 1000 个精粹
- 行者：累计行走 10000 步
- ...更多成就等待解锁

---

## 🛠️ 技术栈

- **前端框架：** Vue 3 + Vite
- **UI 框架：** Vuetify 4
- **状态管理：** 自定义 Store（LocalStorage 持久化）
- **路由：** Vue Router 4
- **PWA：** vite-plugin-pwa
- **桌面应用：** Electron + electron-builder

---

## 📁 项目结构

```
TimeVoyager/
├── docs/              # 项目文档
├── src/               # 源代码
│   ├── stores/        # 状态管理
│   ├── router/        # 路由配置
│   ├── views/         # 页面视图
│   ├── plugins/       # 插件配置
│   └── assets/        # 静态资源
├── electron/          # Electron 主进程
├── public/            # 公共静态资源
├── dist/              # 构建输出
└── release/           # Electron 打包输出
```

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [项目启动文档](./docs/01-项目启动文档.md) | 项目介绍、核心玩法 |
| [架构设计规范](./docs/02-架构设计规范.md) | 技术架构、目录结构 |
| [功能需求文档](./docs/03-功能需求文档.md) | 功能详细说明 |
| [页面结构说明](./docs/04-页面结构说明.md) | 页面布局、组件说明 |
| [组件使用清单](./docs/05-组件使用清单.md) | 组件列表、使用示例 |
| [环境配置记录](./docs/06-环境配置记录.md) | 开发环境配置 |
| [构建部署指南](./docs/07-构建部署指南.md) | 构建、部署流程 |
| [开发进展记录](./docs/08-开发进展记录.md) | 开发日志、进度追踪 |
| [性能优化指南](./docs/09-性能优化指南.md) | 性能优化建议 |
| [程序员操作指南](./docs/10-程序员操作指南.md) | 开发者快速上手 |

---

## 🎯 开发命令

```bash
# 开发
npm run dev              # 启动 Vite 开发服务器
npm run electron:dev     # Electron 开发模式

# 构建
npm run build            # 构建 Web 版本
npm run preview          # 预览构建结果
npm run electron:build   # 打包 Electron 应用

# 部署
npm run deploy           # 部署到 GitHub Pages
```

---

## 📦 安装

### Windows

下载 `TimeVoyager Setup 1.0.0.exe`，双击运行安装程序。

### macOS

下载 `TimeVoyager-1.0.0.dmg`，拖拽到 Applications 文件夹。

### Linux

下载 `TimeVoyager-1.0.0.AppImage`，赋予执行权限后运行。

```bash
chmod +x TimeVoyager-1.0.0.AppImage
./TimeVoyager-1.0.0.AppImage
```

---

## 🌐 PWA 安装

### 桌面浏览器（Chrome/Edge）

1. 访问应用
2. 点击地址栏右侧的"安装"按钮
3. 确认安装

### 移动浏览器（iOS Safari）

1. 访问应用
2. 点击分享按钮
3. 选择"添加到主屏幕"

### 移动浏览器（Android Chrome）

1. 访问应用
2. 点击菜单（三个点）
3. 选择"安装应用"或"添加到主屏幕"

---

## 🤝 贡献

欢迎贡献代码、报告 Bug 或提出建议！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📝 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)

---

## 📄 许可证

MIT License

---

## 👨‍💻 开发者

- **项目发起：** 老大
- **主要开发：** 阿稳 🛠️

---

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/)
- [Vite](https://vitejs.dev/)
- [Vuetify](https://vuetifyjs.com/)
- [Electron](https://www.electronjs.org/)

---

**专注即探索，时间换世界** 🚀

_最后更新：2026-03-23_
