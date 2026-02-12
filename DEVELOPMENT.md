# OpenClaw Manager - 开发指南

本文档为 OpenClaw Manager 的开发者提供详细的开发说明。

## 目录

- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [开发规范](#开发规范)
- [前端开发](#前端开发)
- [后端开发](#后端开发)
- [测试指南](#测试指南)
- [发布流程](#发布流程)

---

## 开发环境设置

### 前置要求

- Node.js 20 LTS
- npm 10+ 或 pnpm 8+
- Git
- VS Code（推荐）

### 推荐的 VS Code 扩展

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code 设置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "frontend/node_modules/typescript/lib",
  "tailwindCSS.experimental.classRegex": [
    ["cn\\(([^)]*)\\)", "[\"'`]([^\"'`]*).*?[\"'`]"]
  ]
}
```

---

## 项目结构

### 前端目录结构

```
frontend/
├── app/                    # Next.js App Router
│   ├── gateway/            # Gateway 管理页面
│   ├── agents/             # Agents 管理页面
│   ├── channels/           # Channels 管理页面
│   ├── models/             # Models 管理页面
│   ├── logs/               # 日志查看页面
│   └── layout.tsx          # 根布局
├── components/             # React 组件
│   ├── ui/                # shadcn/ui 基础组件
│   ├── layout/            # 布局组件
│   ├── gateway/           # Gateway 相关组件
│   ├── agents/            # Agents 相关组件
│   └── common/            # 通用组件
├── lib/                   # 工具库
│   ├── api-client.ts      # API 客户端
│   ├── websocket-client.ts # WebSocket 客户端
│   └── utils.ts           # 工具函数
├── hooks/                 # 自定义 Hooks
│   ├── use-gateway.ts     # Gateway 状态 Hook
│   ├── use-agents.ts      # Agents 数据 Hook
│   └── use-logs.ts        # 日志流 Hook
└── types/                 # TypeScript 类型定义
```

### 后端目录结构

```
backend/
└── src/
    ├── index.ts           # 应用入口
    ├── app.ts             # Express 应用配置
    ├── config/            # 配置文件
    ├── routes/            # API 路由
    │   ├── gateway.ts
    │   ├── agents.ts
    │   ├── channels.ts
    │   └── models.ts
    ├── controllers/       # 控制器
    ├── services/          # 业务逻辑
    │   ├── openclaw.service.ts
    │   └── logs.service.ts
    ├── middleware/        # 中间件
    │   ├── error-handler.ts
    │   └── auth.ts
    └── websocket/         # WebSocket 处理
        └── logs.handler.ts
```

---

## 开发规范

### Git 提交规范

使用 Conventional Commits 格式：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

**示例：**

```bash
git commit -m "feat(gateway): add gateway restart button"
git commit -m "fix(api): handle timeout error in agent creation"
git commit -m "docs: update installation guide"
```

### 分支策略

- `main` - 主分支，稳定版本
- `develop` - 开发分支
- `feature/*` - 功能分支
- `fix/*` - 修复分支
- `hotfix/*` - 紧急修复分支

### 代码审查

1. 创建 Pull Request
2. 通过 CI 检查
3. 至少一人审查批准
4. 无冲突合并

---

## 前端开发

### 添加新页面

1. 在 `app/` 目录下创建页面文件

```typescript
// app/new-page/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'New Page - OpenClaw Manager',
};

export default function NewPage() {
  return (
    <div>
      <h1>New Page</h1>
    </div>
  );
}
```

2. 添加到导航菜单（在 `components/layout/sidebar.tsx`）

### 创建组件

使用 shadcn/ui 添加组件：

```bash
npx shadcn-ui@latest add button
```

创建自定义组件：

```typescript
// components/custom/my-component.tsx
'use client';

import { cn } from '@/lib/utils';

interface MyComponentProps {
  className?: string;
  children: React.ReactNode;
}

export function MyComponent({ className, children }: MyComponentProps) {
  return (
    <div className={cn('p-4', className)}>
      {children}
    </div>
  );
}
```

### 使用自定义 Hook

```typescript
// hooks/use-custom.ts
import { useState, useEffect } from 'react';

export function useCustom() {
  const [data, setData] = useState(null);

  useEffect(() => {
    // 逻辑代码
  }, []);

  return { data };
}
```

### API 调用

使用 API 客户端：

```typescript
import { apiClient } from '@/lib/api-client';

// 获取数据
const agents = await apiClient.get('/api/agents');

// 创建数据
const newAgent = await apiClient.post('/api/agents', {
  name: 'My Agent',
  type: 'chat'
});

// 删除数据
await apiClient.delete(`/api/agents/${id}`);
```

### WebSocket 连接

```typescript
import { useWebSocket } from '@/hooks/use-websocket';

const { connect, disconnect, sendMessage, lastMessage } = useWebSocket();

// 订阅日志
connect();

useEffect(() => {
  if (lastMessage?.type === 'log') {
    console.log(lastMessage.data);
  }
}, [lastMessage]);
```

### 状态管理

#### 使用 React Query（服务端状态）

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 查询
const { data, isLoading, error } = useQuery({
  queryKey: ['agents'],
  queryFn: () => apiClient.get('/api/agents')
});

// 变更
const queryClient = useQueryClient();

const mutation = useMutation({
  mutationFn: (data) => apiClient.post('/api/agents', data),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['agents'] });
  }
});
```

#### 使用 Zustand（客户端状态）

```typescript
// lib/store.ts
import { create } from 'zustand';

interface AppState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen }))
}));
```

---

## 后端开发

### 添加新的 API 端点

1. 在 `services/` 创建服务层

```typescript
// src/services/my-feature.service.ts
import { CommandExecutor } from '../utils/command-executor';

export class MyFeatureService {
  private executor = new CommandExecutor();

  async getData() {
    const result = await this.executor.execute('openclaw', ['my-command']);
    return this.parseOutput(result.stdout);
  }

  private parseOutput(output: string) {
    // 解析逻辑
  }
}
```

2. 在 `controllers/` 创建控制器

```typescript
// src/controllers/my-feature.controller.ts
import { Request, Response } from 'express';
import { MyFeatureService } from '../services/my-feature.service';

export class MyFeatureController {
  private service = new MyFeatureService();

  async getData(req: Request, res: Response) {
    try {
      const data = await this.service.getData();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: {
          code: 'COMMAND_FAILED',
          message: error.message
        }
      });
    }
  }
}
```

3. 在 `routes/` 创建路由

```typescript
// src/routes/my-feature.ts
import { Router } from 'express';
import { MyFeatureController } from '../controllers/my-feature.controller';

const router = Router();
const controller = new MyFeatureController();

router.get('/', controller.getData.bind(controller));

export default router;
```

4. 注册路由（`src/routes/index.ts`）

```typescript
import myFeatureRouter from './my-feature';

app.use('/api/my-feature', myFeatureRouter);
```

### WebSocket 处理器

```typescript
// src/websocket/my-handler.ts
import { WebSocket } from 'ws';

export function handleMyFeature(ws: WebSocket, message: any) {
  // 处理 WebSocket 消息

  // 发送响应
  ws.send(JSON.stringify({
    type: 'my_response',
    data: { /* ... */ }
  }));
}
```

### 错误处理

```typescript
// src/middleware/error-handler.ts
import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An error occurred'
        : err.message
    }
  });
}
```

### 环境变量

```typescript
// src/config/env.ts
export const config = {
  port: parseInt(process.env.PORT || '3001'),
  host: process.env.HOST || 'localhost',
  openclawPath: process.env.OPENCLAW_PATH || '/usr/local/bin/openclaw',
  logLevel: process.env.LOG_LEVEL || 'info'
};
```

---

## 测试指南

### 前端测试

```bash
cd frontend

# 运行测试
npm test

# 覆盖率报告
npm run test:coverage

# E2E 测试
npm run test:e2e
```

### 后端测试

```bash
cd backend

# 单元测试
npm test

# 集成测试
npm run test:integration

# 覆盖率
npm run test:coverage
```

### 测试示例

**前端组件测试：**

```typescript
// components/__tests__/MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('renders children', () => {
    render(<MyComponent>Hello</MyComponent>);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

**后端单元测试：**

```typescript
// tests/services/my-feature.service.test.ts
import { MyFeatureService } from '../../src/services/my-feature.service';

describe('MyFeatureService', () => {
  let service: MyFeatureService;

  beforeEach(() => {
    service = new MyFeatureService();
  });

  it('should get data', async () => {
    const data = await service.getData();
    expect(data).toBeDefined();
  });
});
```

---

## 发布流程

### 版本号规范

遵循语义化版本（Semantic Versioning）：

- `MAJOR.MINOR.PATCH`
- MAJOR: 不兼容的 API 变更
- MINOR: 向后兼容的新功能
- PATCH: 向后兼容的 bug 修复

### 发布步骤

1. 更新版本号

```bash
npm version patch  # 或 minor, major
```

2. 构建生产版本

```bash
cd frontend && npm run build
cd ../backend && npm run build
```

3. 创建 Git 标签

```bash
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0
```

4. 发布到 npm（如果需要）

```bash
npm publish
```

### Changelog

维护 `CHANGELOG.md`：

```markdown
## [1.0.0] - 2026-02-12

### Added
- Gateway management
- Agent CRUD operations
- Real-time logs

### Fixed
- WebSocket reconnection issue
```

---

## 性能优化

### 前端优化

- 使用 React.memo 避免不必要的重渲染
- 代码分割（动态导入）
- 图片优化（Next.js Image）
- 缓存策略（React Query）

### 后端优化

- 连接池管理
- 响应压缩
- 请求限流
- 缓存层

---

## 调试技巧

### 前端调试

1. 使用 React DevTools
2. console.log / debugger
3. Redux DevTools（如果使用）

### 后端调试

1. 使用 VS Code 调试器
2. 日志输出（Winston）
3. API 测试工具（Postman/Thunder Client）

### VS Code 调试配置

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "program": "${workspaceFolder}/backend/src/index.ts",
      "cwd": "${workspaceFolder}/backend",
      "runtimeArgs": ["-r", "ts-node/register"],
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

---

## 资源链接

- [Next.js 文档](https://nextjs.org/docs)
- [Express 文档](https://expressjs.com/)
- [shadcn/ui 组件](https://ui.shadcn.com/)
- [React Query 文档](https://tanstack.com/query/latest)
- [WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
