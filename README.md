# OpenClaw Manager

一个现代化的 Web 管理面板，用于管理 OpenClaw AI Gateway 和 Agent 平台。

![OpenClaw Manager](https://img.shields.io/badge/OpenClaw-Manager-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Node.js](https://img.shields.io/badge/Node.js-20-green)

## 简介

OpenClaw Manager 提供了一个直观的 Web 界面来管理 OpenClaw 的所有核心功能：

- **Gateway 管理** - 启动/停止/重启 Gateway，实时监控状态
- **Agent 管理** - 创建、编辑、删除和管理 AI Agents
- **Channel 管理** - 配置 WhatsApp、Telegram、Discord、Slack 等消息渠道
- **Model 管理** - 配置 API Keys 和 Model Providers
- **实时日志** - WebSocket 实时日志流，支持搜索和过滤
- **安装管理** - 一键安装、卸载和更新 OpenClaw

## 技术栈

### 前端
- **Next.js 15** - React 框架（App Router）
- **shadcn/ui** - 高质量 UI 组件库
- **TailwindCSS** - 实用优先的 CSS 框架
- **React Query** - 数据获取和状态管理
- **Zustand** - 轻量级状态管理

### 后端
- **Node.js 20 LTS** - 运行时环境
- **Express.js** - Web 框架
- **WebSocket (ws)** - 实时通信
- **TypeScript** - 类型安全

## 快速开始

### 前置要求

- Node.js 20+ LTS
- npm 或 pnpm
- OpenClaw CLI（可选，可通过 Manager 安装）

### 安装

```bash
# 克隆项目
git clone https://github.com/yourusername/openclaw-manager.git
cd openclaw-manager

# 安装依赖
npm install
```

### 开发模式

```bash
# 启动后端 (终端 1)
cd backend
npm run dev

# 启动前端 (终端 2)
cd frontend
npm run dev
```

访问 http://localhost:3000

### 生产部署

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd ../backend
npm run build

# 启动服务
npm start
```

## 项目结构

```
openclaw-manager/
├── frontend/          # Next.js 前端应用
│   ├── app/          # App Router 页面
│   ├── components/   # React 组件
│   ├── lib/          # 工具库
│   └── hooks/        # 自定义 Hooks
├── backend/          # Express 后端服务
│   └── src/
│       ├── routes/   # API 路由
│       ├── services/ # 业务逻辑
│       └── websocket/ # WebSocket 服务
└── docs/             # 项目文档
```

## 功能预览

### Gateway 管理
- 实时状态监控（CPU、内存、运行时间）
- 一键启动/停止/重启
- 实时指标展示

### Agent 管理
- 创建和管理 AI Agents
- 配置 Agent 参数
- 监控 Agent 状态

### 渠道配置
- 支持多个消息平台
- 可视化配置界面
- 连接状态检测

### 日志查看
- 实时日志流
- 日志级别过滤
- 搜索和导出

## 文档

- [安装部署指南](INSTALL.md)
- [开发指南](DEVELOPMENT.md)
- [API 文档](docs/api.md)
- [架构设计](docs/architecture.md)

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

- GitHub Issues: https://github.com/yourusername/openclaw-manager/issues
