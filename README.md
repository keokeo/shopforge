# 🛒 ShopForge

> 现代化电商独立站 — 支持实物商品销售、复杂 SKU 管理

## 技术栈

| 层次 | 技术 |
|---|---|
| C端店铺 | Next.js 14 + Tailwind CSS |
| B端管理后台 | Vite + React + Ant Design |
| 后端 API | FastAPI + Python 3.11+ |
| 数据库 | PostgreSQL 16 |
| 缓存 | Redis 7 |

## 项目结构

```
shopforge/
├── apps/
│   ├── storefront/    # C端店铺 (Next.js)
│   ├── admin/         # B端管理后台 (Vite + React)
│   └── backend/       # 后端 API (FastAPI)
├── packages/          # 共享包
├── docker-compose.yml # 本地基础服务
└── pnpm-workspace.yaml
```

## 快速开始

### 前置要求

- **Node.js** >= 18
- **pnpm** >= 8
- **Python** >= 3.11
- **Docker** & **Docker Compose**

### 1. 启动基础服务

```bash
# 启动 PostgreSQL 和 Redis
pnpm db:up

# (可选) 启动 pgAdmin 数据库管理界面
docker compose --profile tools up -d pgadmin
```

### 2. 启动后端

```bash
cd apps/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

访问 API 文档: http://localhost:8000/docs

### 3. 启动前端

```bash
# 安装依赖
pnpm install

# 启动 C端店铺
pnpm dev:storefront    # http://localhost:3000

# 启动管理后台
pnpm dev:admin         # http://localhost:5173
```

### 4. 一键启动所有服务

```bash
pnpm dev:all
```

## 开发命令

| 命令 | 说明 |
|---|---|
| `pnpm dev:storefront` | 启动 C端店铺 |
| `pnpm dev:admin` | 启动管理后台 |
| `pnpm dev:backend` | 启动后端 API |
| `pnpm dev:all` | 同时启动所有开发服务 |
| `pnpm db:up` | 启动数据库和 Redis |
| `pnpm db:down` | 停止基础服务 |

## License

Private
