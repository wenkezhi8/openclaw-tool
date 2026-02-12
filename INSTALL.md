# OpenClaw Manager - 安装部署指南

本文档详细说明如何在不同环境中安装和部署 OpenClaw Manager。

## 目录

- [系统要求](#系统要求)
- [本地开发安装](#本地开发安装)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [环境配置](#环境配置)
- [故障排查](#故障排查)

---

## 系统要求

### 最低要求

| 组件 | 要求 |
|------|------|
| 操作系统 | Linux / macOS / Windows (WSL2) |
| Node.js | 20 LTS 或更高 |
| npm | 10.0 或更高 |
| 内存 | 2GB RAM |
| 磁盘空间 | 500MB 可用空间 |

### 可选依赖

- OpenClaw CLI（可通过 Manager 安装）
- Docker（用于容器化部署）
- Nginx（用于反向代理）

---

## 本地开发安装

### 1. 克隆项目

```bash
git clone https://github.com/yourusername/openclaw-manager.git
cd openclaw-manager
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd backend
npm install

# 安装前端依赖
cd ../frontend
npm install
```

### 3. 配置环境变量

创建后端环境配置文件：

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件：

```env
# 服务器配置
PORT=3001
HOST=localhost

# OpenClaw CLI 配置
OPENCLAW_PATH=/usr/local/bin/openclaw
OPENCLAW_CONFIG_DIR=$HOME/.openclaw

# CORS 配置
FRONTEND_URL=http://localhost:3000

# 日志级别
LOG_LEVEL=info

# API 密钥（可选）
API_KEY=your-api-key-here
```

### 4. 启动开发服务

**终端 1 - 启动后端：**

```bash
cd backend
npm run dev
```

后端将运行在 `http://localhost:3001`

**终端 2 - 启动前端：**

```bash
cd frontend
npm run dev
```

前端将运行在 `http://localhost:3000`

### 5. 访问应用

打开浏览器访问：http://localhost:3000

---

## 生产环境部署

### 使用 PM2 部署（推荐）

PM2 是一个先进的进程管理器，适合生产环境。

#### 安装 PM2

```bash
npm install -g pm2
```

#### 构建应用

```bash
# 构建前端
cd frontend
npm run build

# 构建后端
cd ../backend
npm run build
```

#### 创建 PM2 配置文件

创建 `ecosystem.config.js`：

```javascript
module.exports = {
  apps: [
    {
      name: 'openclaw-backend',
      script: './backend/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    },
    {
      name: 'openclaw-frontend',
      script: 'npx',
      args: 'next start -p 3000',
      cwd: './frontend',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss'
    }
  ]
};
```

#### 启动应用

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 常用 PM2 命令

```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启应用
pm2 restart all

# 停止应用
pm2 stop all

# 删除应用
pm2 delete all
```

---

## Docker 部署

### 使用 Docker Compose（推荐）

创建 `docker-compose.yml`：

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: openclaw-backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - PORT=3001
      - OPENCLAW_PATH=/usr/local/bin/openclaw
    volumes:
      - /usr/local/bin/openclaw:/usr/local/bin/openclaw:ro
      - ~/.openclaw:/root/.openclaw
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: openclaw-frontend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=http://localhost:3001
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    container_name: openclaw-nginx
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

### 启动容器

```bash
docker-compose up -d
```

### 查看日志

```bash
docker-compose logs -f
```

### 停止容器

```bash
docker-compose down
```

---

## 环境配置

### 后端环境变量

| 变量 | 描述 | 默认值 |
|------|------|--------|
| `PORT` | 后端服务端口 | `3001` |
| `HOST` | 服务器地址 | `localhost` |
| `NODE_ENV` | 环境 | `development` |
| `OPENCLAW_PATH` | OpenClaw CLI 路径 | `/usr/local/bin/openclaw` |
| `OPENCLAW_CONFIG_DIR` | 配置目录 | `$HOME/.openclaw` |
| `FRONTEND_URL` | 前端 URL（CORS） | `http://localhost:3000` |
| `LOG_LEVEL` | 日志级别 | `info` |
| `API_KEY` | API 密钥（可选） | - |

### 前端环境变量

创建 `frontend/.env.local`：

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
```

---

## Nginx 反向代理配置

生产环境建议使用 Nginx 作为反向代理。

```nginx
server {
    listen 80;
    server_name openclaw.example.com;

    # 前端
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### 启用 HTTPS（Let's Encrypt）

```bash
# 安装 certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d openclaw.example.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 故障排查

### 问题 1：后端无法启动

**症状**：`Error: Cannot find module`

**解决方案**：
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### 问题 2：前端构建失败

**症状**：`Build failed with errors`

**解决方案**：
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### 问题 3：WebSocket 连接失败

**症状**：实时日志不显示

**解决方案**：
1. 检查后端是否运行在正确端口
2. 检查防火墙设置
3. 确认 `NEXT_PUBLIC_WS_URL` 环境变量正确

### 问题 4：OpenClaw CLI 命令失败

**症状**：`openclaw: command not found`

**解决方案**：
```bash
# 检查 OpenClaw 是否安装
which openclaw

# 如果未安装，使用 Manager 安装
# 或手动安装
npm install -g @openclaw/cli
```

### 问题 5：权限错误

**症状**：`EACCES: permission denied`

**解决方案**：
```bash
# 修复目录权限
sudo chown -R $USER:$USER ~/.openclaw
```

---

## 更新升级

### 更新应用

```bash
# 拉取最新代码
git pull origin main

# 更新依赖
cd backend && npm install
cd ../frontend && npm install

# 重新构建
npm run build

# 重启服务（PM2）
pm2 restart all
```

### 更新 Docker 部署

```bash
# 拉取最新镜像
docker-compose pull

# 重新构建
docker-compose build

# 重启容器
docker-compose up -d
```

---

## 监控和日志

### 查看应用日志

```bash
# PM2 日志
pm2 logs

# Docker 日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 系统日志
tail -f /var/log/openclaw/backend.log
```

### 性能监控

使用 PM2 Plus 或集成 Prometheus 进行监控：

```bash
pm2 link <public-key> <secret-key>
```

---

## 安全建议

1. **使用 HTTPS** - 生产环境必须启用 HTTPS
2. **设置防火墙** - 限制端口访问
3. **定期更新** - 及时更新依赖包
4. **配置 API 密钥** - 启用 API 认证
5. **限制访问** - 使用反向代理限制访问
6. **备份配置** - 定期备份 OpenClaw 配置

---

## 支持

如遇到问题，请访问：

- GitHub Issues: https://github.com/yourusername/openclaw-manager/issues
- 文档: https://docs.openclaw.com
- 社区: https://discord.gg/openclaw
