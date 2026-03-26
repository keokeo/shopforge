# 独立站项目初始化计划 (shopforge)

## 项目概览

搭建一套支持实物商品销售、复杂 SKU 管理的现代化电商独立站。项目采用 Monorepo 结构，包含三个独立的 App。

**位置**: `/Users/keokeo/Dev/AI/shopforge/`

## 技术栈

| 层次 | 技术 | 说明 |
|---|---|---|
| C端店铺 | `Next.js 14` + `Tailwind CSS` | SSR渲染，利于SEO，提升页面加载速度 |
| B端管理后台 | `Vite` + `React` + `Ant Design` | SPA应用，快速管理商品/订单 |
| 后端 API | `FastAPI` + `Python 3.11+` | 高性能异步API，与已有项目技术栈一致 |
| 数据库 | `PostgreSQL 16` | 存储商品、SKU、订单、用户核心数据 |
| 缓存 | `Redis 7` | 购物车、Session、热门商品缓存 |
| 对象存储 | `本地 / Cloudflare R2` | 商品图片存储（初期使用本地目录） |
| 容器化 | `Docker Compose` | 本地一键启动所有基础服务 |

---

## Proposed Changes

### 根目录 & Monorepo 配置

#### [NEW] `pnpm-workspace.yaml`
声明 `apps/*` 和 `packages/*` 为工作区包，启用 pnpm Monorepo 模式。

#### [NEW] `package.json` (根)
包含项目名称、开发脚本（`dev:all`、`dev:storefront`、`dev:admin`）等元信息。

#### [NEW] `.gitignore`
通用 Node.js + Python 忽略规则。

#### [NEW] `docker-compose.yml`
包含：
- `postgres`: PostgreSQL 16，端口 5432
- `redis`: Redis 7 Alpine，端口 6379
- `pgadmin` (可选): 数据库可视化管理

#### [NEW] `README.md`
项目介绍、启动指南、技术栈说明。

---

### 后端 API (`apps/backend/`)

FastAPI 项目，提供 RESTful API 接口。

```
apps/backend/
├── main.py                 # 应用入口，注册路由
├── requirements.txt        # Python依赖
├── .env.example            # 环境变量模板
├── Dockerfile              # 容器化配置
├── alembic/                # 数据库迁移文件
│   └── alembic.ini
├── core/
│   ├── config.py           # 配置管理（读取.env）
│   ├── database.py         # SQLAlchemy 数据库连接
│   ├── security.py         # JWT 鉴权工具
│   └── dependencies.py     # FastAPI 依赖注入
├── models/                 # SQLAlchemy ORM 模型
│   ├── user.py             # 用户模型
│   ├── product.py          # 商品模型
│   ├── sku.py              # SKU 变体模型（含属性、库存、价格）
│   ├── category.py         # 商品分类
│   ├── cart.py             # 购物车
│   └── order.py            # 订单 & 订单明细
├── schemas/                # Pydantic 请求/响应数据结构
│   ├── product.py
│   ├── sku.py
│   ├── order.py
│   └── user.py
├── crud/                   # 数据库操作封装
│   ├── product.py
│   ├── sku.py
│   └── order.py
└── api/
    └── v1/
        ├── router.py        # 总路由注册
        ├── auth.py          # 注册/登录/Token刷新
        ├── products.py      # 商品列表/详情 CRUD
        ├── skus.py          # SKU 管理
        ├── categories.py    # 分类管理
        ├── cart.py          # 购物车操作
        └── orders.py        # 订单创建/查询
```

**SKU 系统设计要点**:
- `sku` 表存储每个变体（如颜色:红色 + 尺码:XL）
- `product_attributes` 表存储属性名（颜色、尺码、材质）
- `attribute_values` 表存储属性值（红色、XL）
- `sku_attribute_values` 关联表建立 SKU ↔ 属性值映射

---

### C端店铺 (`apps/storefront/`)

Next.js 14 App Router 项目。

```
apps/storefront/
├── package.json
├── next.config.js
├── tailwind.config.js
├── src/
│   ├── app/
│   │   ├── layout.tsx        # 全局布局（Header + Footer）
│   │   ├── page.tsx          # 首页（Banner + 热门商品）
│   │   ├── products/
│   │   │   ├── page.tsx      # 商品列表页（筛选、分页）
│   │   │   └── [id]/page.tsx # 商品详情页（SKU 选择器、加入购物车）
│   │   ├── cart/page.tsx     # 购物车页面
│   │   ├── checkout/page.tsx # 结算页面
│   │   └── orders/page.tsx   # 我的订单
│   ├── components/
│   │   ├── layout/           # Header, Footer, MobileMenu
│   │   ├── product/          # ProductCard, SKUSelector, ImageGallery
│   │   └── cart/             # CartItem, CartSummary
│   ├── lib/
│   │   ├── api.ts            # Axios/Fetch API客户端封装
│   │   └── utils.ts          # 格式化价格等工具函数
│   └── store/
│       └── cart.ts           # Zustand 购物车状态管理
```

---

### B端管理后台 (`apps/admin/`)

Vite + React + Ant Design 项目。

```
apps/admin/
├── package.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx               # 路由配置
│   ├── layouts/
│   │   └── AdminLayout.tsx   # 侧边栏 + 顶部导航
│   ├── pages/
│   │   ├── Dashboard.tsx     # 数据看板（GMV、订单数统计）
│   │   ├── Products.tsx      # 商品列表管理
│   │   ├── ProductForm.tsx   # 商品新增/编辑（含SKU批量设置）
│   │   ├── Categories.tsx    # 分类管理
│   │   ├── Orders.tsx        # 订单管理
│   │   └── Customers.tsx     # 用户管理
│   └── services/
│       └── api.ts            # API 接口封装
```

---

## Verification Plan

### 自动化验证
初始化阶段以目录结构验证为主：

```bash
# 1. 确认完整目录结构
find /Users/keokeo/Dev/AI/shopforge -type f | sort

# 2. 验证后端依赖可正常安装
cd /Users/keokeo/Dev/AI/shopforge/apps/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# 3. 验证后端应用能正常启动
uvicorn main:app --reload --port 8000
# 访问 http://localhost:8000/docs 确认 Swagger UI 正常显示

# 4. 验证前端依赖可正常安装
cd /Users/keokeo/Dev/AI/shopforge/apps/storefront
pnpm install && pnpm dev
# 访问 http://localhost:3000 确认页面正常显示

# 5. 验证后台管理依赖可正常安装
cd /Users/keokeo/Dev/AI/shopforge/apps/admin
pnpm install && pnpm dev
# 访问 http://localhost:5173 确认页面正常显示

# 6. 验证 Docker Compose 配置
cd /Users/keokeo/Dev/AI/shopforge
docker compose up -d postgres redis
# 确认容器正常运行: docker compose ps
```

---

## Phase 2: 后续开发计划 (按优先级排序)

### 1. 完善用户会话与鉴权系统 (Auth & Session) - 最高优先级
电商平台必须有完善的用户隔离。作为基础需要补齐 Next.js Storefront 的登录状态持久化、个人中心路由保护；以及 Admin 后台的安全退出及 JWT 无感刷新闭环。否则后续个人数据都是缺乏屏障的。

### 2. 图片上传与静态资源管理 (Media Management) - 高优先级
没有真实图片无法展现实物商品。建立后端图片上传存储服务（可初选本地服务代理作为过渡，后期随时转接 OSS/S3），并在 Admin 增加完整的拖拉拽图片上传与实时预览组件供发布商品用。

### 3. 对接真实第三方支付 (Payment Integration) - 中高优先级
实现真正的闭环流转：在现有结算流程内挂载 Stripe / PayPal（外贸独立站首选），或者微信/支付宝等支付网关；后端增加 Webhook 接收支付回调的支持，保证一旦客户真实付款完毕，订单状态能准确且安全的自动变更。

### 4. 预备生产环境部署方案 (Deployment Readiness) - 中优先级
为各个模块分别提供生产级别的轻量级 `Dockerfile`、配合 `Nginx` 等服务做统一出口分发、并且精简去开发依赖生成 `docker-compose.prod.yml`，为随时上线到自己的服务器做准备。
