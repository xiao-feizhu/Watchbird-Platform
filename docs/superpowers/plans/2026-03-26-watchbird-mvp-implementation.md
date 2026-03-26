# 观鸟平台 MVP 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建观鸟资源整合平台 MVP，支持用户注册登录、鸟导入驻认证、服务发布、订单支付、双向评价等核心功能。

**Architecture:** Next.js 14 App Router 全栈应用，Prisma ORM + PostgreSQL 数据库，微信支付集成，响应式设计支持移动端和桌面端。

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Redis, WeChat Pay, JWT Auth

---

## 文件结构规划

```
watchbird/
├── prisma/
│   ├── schema.prisma          # 数据库模型定义
│   ├── migrations/            # 数据库迁移文件
│   └── seed.ts                # 初始数据
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # 认证相关路由组
│   │   │   ├── login/         # 登录页
│   │   │   ├── register/      # 注册页
│   │   │   └── wechat/        # 微信登录回调
│   │   ├── (main)/            # 主站路由组
│   │   │   ├── page.tsx       # 首页
│   │   │   ├── guides/        # 鸟导列表
│   │   │   ├── services/      # 服务列表
│   │   │   └── spots/         # 鸟点列表
│   │   ├── (dashboard)/       # 用户中心路由组
│   │   │   ├── profile/       # 个人资料
│   │   │   ├── orders/        # 我的订单
│   │   │   ├── reviews/       # 我的评价
│   │   │   └── guide/         # 鸟导中心（仅鸟导可见）
│   │   │       ├── profile/   # 鸟导资料
│   │   │       ├── services/  # 服务管理
│   │   │       ├── orders/    # 订单管理
│   │   │       └── earnings/  # 收入管理
│   │   ├── api/               # API 路由
│   │   │   ├── auth/          # 认证 API
│   │   │   ├── users/         # 用户 API
│   │   │   ├── guides/        # 鸟导 API
│   │   │   ├── services/      # 服务 API
│   │   │   ├── orders/        # 订单 API
│   │   │   ├── payments/      # 支付 API
│   │   │   ├── reviews/       # 评价 API
│   │   │   └── admin/         # 管理后台 API
│   │   └── admin/             # 运营后台页面
│   │       ├── login/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── guides/
│   │       ├── orders/
│   │       └── reviews/
│   ├── components/            # React 组件
│   │   ├── ui/                # 基础 UI 组件
│   │   ├── forms/             # 表单组件
│   │   ├── cards/             # 卡片组件
│   │   ├── layout/            # 布局组件
│   │   └── modals/            # 弹窗组件
│   ├── lib/                   # 工具库
│   │   ├── prisma.ts          # Prisma 客户端
│   │   ├── auth.ts            # 认证工具
│   │   ├── wechat.ts          # 微信相关
│   │   ├── payment.ts         # 支付工具
│   │   └── utils.ts           # 通用工具
│   ├── hooks/                 # React Hooks
│   ├── types/                 # TypeScript 类型
│   └── styles/                # 全局样式
├── public/                    # 静态资源
├── tests/                     # 测试文件
├── .env                       # 环境变量
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Phase 1: 项目初始化与环境搭建

### Task 1: 初始化 Next.js 项目

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.js`
- Create: `.env.example`

- [ ] **Step 1: 创建 Next.js 14 项目**

```bash
cd /Users/xxx/claude-workspace/watchbird
npx create-next-app@14 . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

Expected: 项目创建成功，包含 src/app, src/components 等目录

- [ ] **Step 2: 安装核心依赖**

```bash
npm install prisma @prisma/client zod bcryptjs jsonwebtoken next-auth axios
npm install -D @types/bcryptjs @types/jsonwebtoken
```

Expected: 依赖安装完成，package.json 更新

- [ ] **Step 3: 初始化 Prisma**

```bash
npx prisma init
```

Expected: 生成 prisma/schema.prisma 和 .env 文件

- [ ] **Step 4: 配置环境变量模板**

```bash
cat > .env.example << 'EOF'
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/watchbird"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# WeChat
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_APP_SECRET="your-wechat-app-secret"
WECHAT_MCH_ID="your-merchant-id"
WECHAT_API_KEY="your-api-key"

# Redis (optional)
REDIS_URL="redis://localhost:6379"

# COS
COS_SECRET_ID="your-cos-secret-id"
COS_SECRET_KEY="your-cos-secret-key"
COS_BUCKET="your-bucket-name"
COS_REGION="ap-guangzhou"
EOF
```

- [ ] **Step 5: 配置 Tailwind 和全局样式**

```bash
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
        },
      },
    },
  },
  plugins: [],
}
EOF
```

- [ ] **Step 6: 提交初始化代码**

```bash
git add .
git commit -m "chore: initialize Next.js 14 project with TypeScript and Tailwind"
```

---

## Phase 2: 数据库模型与迁移

### Task 2: 定义 Prisma Schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: 编写完整数据模型**

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 用户角色枚举
enum UserRole {
  WATCHER    // 观鸟爱好者
  GUIDE      // 鸟导
  ADMIN      // 管理员
}

// 鸟导等级枚举
enum GuideLevel {
  BASIC      // 基础
  ADVANCED   // 高级
  GOLD       // 金牌
  PREMIUM    // 顶级
}

// 鸟导状态枚举
enum GuideStatus {
  PENDING    // 审核中
  APPROVED   // 已通过
  REJECTED   // 已拒绝
  SUSPENDED  // 已暂停
}

// 服务产品类型枚举
enum ServiceType {
  STANDARD   // 标准套餐
  CUSTOM     // 定制服务
}

// 服务状态枚举
enum ServiceStatus {
  DRAFT      // 草稿
  ACTIVE     // 上架
  PAUSED     // 暂停
}

// 订单状态枚举
enum OrderStatus {
  PENDING_PAYMENT   // 待付款
  PENDING_CONFIRM   // 待确认
  CONFIRMED         // 待服务
  IN_SERVICE        // 服务中
  PENDING_REVIEW    // 待评价
  COMPLETED         // 已完成
  CANCELLED         // 已取消
  REFUNDED          // 已退款
}

// 评价审核状态枚举
enum ReviewAuditStatus {
  PENDING   // 待审核
  PASSED    // 已通过
  REJECTED  // 已拒绝
}

// 用户表
model User {
  id            String    @id @default(uuid())
  phone         String    @unique
  nickname      String?
  avatar        String?
  role          UserRole  @default(WATCHER)
  password      String?   // 加密存储
  wechatOpenId  String?   @unique @map("wechat_open_id")
  wechatUnionId String?   @map("wechat_union_id")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  // 关联
  guideProfile  GuideProfile?
  orders        Order[]
  reviewsGiven  Review[]  @relation("ReviewsGiven")
  reviewsReceived Review[] @relation("ReviewsReceived")

  @@map("users")
}

// 鸟导档案表
model GuideProfile {
  id              String      @id @default(uuid())
  userId          String      @unique @map("user_id")
  type            String      @default("individual") // individual/agency
  level           GuideLevel  @default(BASIC)
  status          GuideStatus @default(PENDING)
  realName        String      @map("real_name")
  idCard          String?     @map("id_card") // 加密存储
  bio             String?
  regions         String[]
  languages       String[]    @default(["中文"])
  commissionRate  Decimal     @default(0.15) @map("commission_rate") // 默认15%

  // 联系信息
  contactPhone    String      @map("contact_phone")
  contactWechat   String?     @map("contact_wechat")
  contactEmail    String?     @map("contact_email")

  // 资质证明（图片URL数组）
  certificates    String[]

  // 统计字段
  totalOrders     Int         @default(0) @map("total_orders")
  completedOrders Int         @default(0) @map("completed_orders")
  rating          Decimal     @default(5.0) @db.Decimal(2, 1)
  reviewCount     Int         @default(0) @map("review_count")

  createdAt       DateTime    @default(now()) @map("created_at")
  updatedAt       DateTime    @updatedAt @map("updated_at")

  // 关联
  user            User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  services        ServiceProduct[]
  orders          Order[]

  @@map("guide_profiles")
}

// 服务产品表
model ServiceProduct {
  id            String        @id @default(uuid())
  guideId       String        @map("guide_id")
  type          ServiceType   @default(STANDARD)
  title         String
  description   String
  region        String
  duration      Int           // 时长(小时)
  maxPeople     Int           @map("max_people")
  price         Decimal       @db.Decimal(10, 2)
  priceType     String        @default("per_person") @map("price_type") // per_person/total

  // 服务内容
  includes      String[]
  excludes      String[]
  birdSpecies   String[]      @map("bird_species")
  bestSeason    String[]      @map("best_season")

  // 图片
  images        String[]

  status        ServiceStatus @default(DRAFT)

  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")

  // 关联
  guide         GuideProfile  @relation(fields: [guideId], references: [id], onDelete: Cascade)
  orders        Order[]

  @@map("service_products")
}

// 订单表
model Order {
  id            String      @id @default(uuid())
  orderNo       String      @unique @map("order_no") // 订单号，如 WB202403260001

  // 关联
  userId        String      @map("user_id")
  guideId       String      @map("guide_id")
  productId     String      @map("product_id")

  // 订单信息
  type          ServiceType
  serviceDate   DateTime    @map("service_date")
  peopleCount   Int         @map("people_count")
  totalPrice    Decimal     @db.Decimal(10, 2) @map("total_price")
  status        OrderStatus @default(PENDING_PAYMENT)

  // 备注
  userRemark    String?     @map("user_remark")
  guideRemark   String?     @map("guide_remark")

  // 时间戳
  paidAt        DateTime?   @map("paid_at")
  confirmedAt   DateTime?   @map("confirmed_at")
  completedAt   DateTime?   @map("completed_at")
  cancelledAt   DateTime?   @map("cancelled_at")
  createdAt     DateTime    @default(now()) @map("created_at")
  updatedAt     DateTime    @updatedAt @map("updated_at")

  // 关联
  user          User        @relation(fields: [userId], references: [id])
  guide         GuideProfile @relation(fields: [guideId], references: [id])
  product       ServiceProduct @relation(fields: [productId], references: [id])
  payment       Payment?
  reviews       Review[]

  @@map("orders")
}

// 支付记录表
model Payment {
  id            String    @id @default(uuid())
  orderId       String    @unique @map("order_id")

  // 微信支付信息
  wechatOrderId String?   @map("wechat_order_id")
  prepayId      String?   @map("prepay_id")

  // 金额
  amount        Decimal   @db.Decimal(10, 2)
  status        String    // pending/success/failed/refunded

  // 时间戳
  paidAt        DateTime? @map("paid_at")
  createdAt     DateTime  @default(now()) @map("created_at")

  // 关联
  order         Order     @relation(fields: [orderId], references: [id], onDelete: Cascade)

  @@map("payments")
}

// 评价表
model Review {
  id            String            @id @default(uuid())
  orderId       String            @map("order_id")
  reviewerId    String            @map("reviewer_id")
  revieweeId    String            @map("reviewee_id")

  // 评价内容
  rating        Int               // 1-5
  content       String
  tags          String[]
  images        String[]
  reply         String?
  repliedAt     DateTime?         @map("replied_at")

  // 审核
  auditStatus   ReviewAuditStatus @default(PENDING) @map("audit_status")
  auditRemark   String?           @map("audit_remark")

  createdAt     DateTime          @default(now()) @map("created_at")
  updatedAt     DateTime          @updatedAt @map("updated_at")

  // 关联
  order         Order             @relation(fields: [orderId], references: [id], onDelete: Cascade)
  reviewer      User              @relation("ReviewsGiven", fields: [reviewerId], references: [id])
  reviewee      User              @relation("ReviewsReceived", fields: [revieweeId], references: [id])

  @@map("reviews")
}
```

- [ ] **Step 2: 创建数据库迁移**

```bash
npx prisma migrate dev --name init
```

Expected: 迁移文件生成在 prisma/migrations/，数据库表创建成功

- [ ] **Step 3: 生成 Prisma Client**

```bash
npx prisma generate
```

Expected: Prisma Client 生成成功

- [ ] **Step 4: 创建 Prisma 客户端实例**

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 5: 创建种子数据**

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建管理员账号
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      phone: '13800000000',
      nickname: '管理员',
      role: 'ADMIN',
      password: adminPassword,
    },
  })

  console.log('Created admin:', admin.id)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

- [ ] **Step 6: 运行种子数据**

```bash
npx prisma db seed
```

Expected: 管理员账号创建成功

- [ ] **Step 7: 提交数据库相关代码**

```bash
git add .
git commit -m "feat: add Prisma schema with User, GuideProfile, ServiceProduct, Order, Payment, Review models"
```

---

## Phase 3: 认证系统（手机号 + 微信）

### Task 3: 实现手机号注册登录

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/app/api/auth/register/route.ts`
- Create: `src/app/api/auth/login/route.ts`
- Create: `src/app/api/auth/verify-code/route.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`

- [ ] **Step 1: 实现 JWT 认证工具**

```typescript
// src/lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const JWT_SECRET = process.env.NEXTAUTH_SECRET!

export interface TokenPayload {
  userId: string
  phone: string
  role: string
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(password, hashed)
}

// 生成6位验证码
export function generateVerifyCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
```

- [ ] **Step 2: 实现短信验证码 API**

```typescript
// src/app/api/auth/verify-code/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { generateVerifyCode } from '@/lib/auth'

// 临时存储（实际应用使用 Redis）
const codeStore = new Map<string, { code: string; expireAt: number }>()

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PHONE', message: '手机号格式错误' } },
        { status: 400 }
      )
    }

    const code = generateVerifyCode()
    // 5分钟过期
    codeStore.set(phone, { code, expireAt: Date.now() + 5 * 60 * 1000 })

    // TODO: 调用短信服务商发送验证码
    console.log(`Verify code for ${phone}: ${code}`)

    return NextResponse.json({
      success: true,
      data: { message: '验证码已发送' },
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: 实现注册 API**

```typescript
// src/app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { phone, password, nickname, verifyCode } = await request.json()

    // 验证参数
    if (!phone || !password || !nickname) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '缺少必要字段' } },
        { status: 400 }
      )
    }

    // 检查手机号是否已注册
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    })

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: { code: 'PHONE_EXISTS', message: '手机号已注册' } },
        { status: 409 }
      )
    }

    // 创建用户
    const hashedPassword = await hashPassword(password)
    const user = await prisma.user.create({
      data: {
        phone,
        password: hashedPassword,
        nickname,
      },
    })

    // 生成 Token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          role: user.role,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: 实现登录 API**

```typescript
// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyPassword, generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json()

    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_FIELDS', message: '缺少手机号或密码' } },
        { status: 400 }
      )
    }

    // 查找用户
    const user = await prisma.user.findUnique({
      where: { phone },
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '手机号或密码错误' } },
        { status: 401 }
      )
    }

    // 验证密码
    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: '手机号或密码错误' } },
        { status: 401 }
      )
    }

    // 生成 Token
    const token = generateToken({
      userId: user.id,
      phone: user.phone,
      role: user.role,
    })

    return NextResponse.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
        },
        token,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 5: 创建登录页面组件**

```tsx
// src/app/(auth)/login/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      })

      const data = await res.json()

      if (data.success) {
        // 保存 token
        localStorage.setItem('token', data.data.token)
        router.push('/')
      } else {
        setError(data.error.message)
      }
    } catch (err) {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold text-center">登录</h2>
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="请输入手机号"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="请输入密码"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div className="text-center">
          <a href="/register" className="text-primary-600 hover:text-primary-500">
            还没有账号？立即注册
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: 运行测试验证登录功能**

```bash
# 启动开发服务器
npm run dev

# 测试注册
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456","nickname":"测试用户"}'

# 测试登录
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"13800138000","password":"123456"}'
```

Expected: 注册和登录 API 返回成功响应，包含 token

- [ ] **Step 7: 提交认证系统代码**

```bash
git add .
git commit -m "feat: implement phone number registration and login with JWT"
```

---

## Phase 4: 鸟导入驻与认证

### Task 4: 实现鸟导入驻申请

**Files:**
- Create: `src/app/api/guides/apply/route.ts`
- Create: `src/app/api/guides/profile/route.ts`
- Create: `src/app/(dashboard)/guide/apply/page.tsx`
- Create: `src/app/(dashboard)/guide/profile/page.tsx`

- [ ] **Step 1: 实现鸟导入驻申请 API**

```typescript
// src/app/api/guides/apply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // 验证登录
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    // 检查是否已是鸟导
    const existingProfile = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (existingProfile) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_GUIDE', message: '您已提交过入驻申请' } },
        { status: 409 }
      )
    }

    const {
      realName,
      idCard,
      bio,
      regions,
      languages,
      contactPhone,
      contactWechat,
      certificates,
    } = await request.json()

    // 创建鸟导档案
    const guideProfile = await prisma.guideProfile.create({
      data: {
        userId: payload.userId,
        realName,
        idCard, // 注意：实际应用需要加密
        bio,
        regions: regions || [],
        languages: languages || ['中文'],
        contactPhone,
        contactWechat,
        certificates: certificates || [],
        level: 'BASIC',
        status: 'PENDING',
        commissionRate: 0.15, // 基础等级 15%
      },
    })

    // 更新用户角色
    await prisma.user.update({
      where: { id: payload.userId },
      data: { role: 'GUIDE' },
    })

    return NextResponse.json({
      success: true,
      data: {
        message: '入驻申请已提交，等待审核',
        profile: guideProfile,
      },
    })
  } catch (error) {
    console.error('Guide apply error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 实现鸟导资料查询/更新 API**

```typescript
// src/app/api/guides/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - 获取鸟导资料
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const profile = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
      include: {
        user: {
          select: {
            nickname: true,
            avatar: true,
            phone: true,
          },
        },
        services: {
          where: { status: 'ACTIVE' },
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '鸟导档案不存在' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('Get guide profile error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PATCH - 更新鸟导资料
export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const updateData = await request.json()

    // 不允许更新的字段
    delete updateData.id
    delete updateData.userId
    delete updateData.level
    delete updateData.status
    delete updateData.commissionRate

    const profile = await prisma.guideProfile.update({
      where: { userId: payload.userId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: profile,
    })
  } catch (error) {
    console.error('Update guide profile error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: 创建鸟导入驻申请表单页面**

```tsx
// src/app/(dashboard)/guide/apply/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function GuideApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    realName: '',
    idCard: '',
    bio: '',
    regions: '',
    languages: '中文',
    contactPhone: '',
    contactWechat: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const res = await fetch('/api/guides/apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          regions: formData.regions.split(',').map(r => r.trim()),
          languages: formData.languages.split(',').map(l => l.trim()),
        }),
      })

      const data = await res.json()

      if (data.success) {
        alert('入驻申请已提交，等待审核')
        router.push('/guide/profile')
      } else {
        alert(data.error.message)
      }
    } catch (err) {
      alert('提交失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">鸟导入驻申请</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">真实姓名</label>
          <input
            type="text"
            value={formData.realName}
            onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">身份证号</label>
          <input
            type="text"
            value={formData.idCard}
            onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">个人介绍</label>
          <textarea
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">擅长区域（用逗号分隔）</label>
          <input
            type="text"
            value={formData.regions}
            onChange={(e) => setFormData({ ...formData, regions: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="如：北京, 云南, 青海"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">服务语言</label>
          <input
            type="text"
            value={formData.languages}
            onChange={(e) => setFormData({ ...formData, languages: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">联系电话</label>
          <input
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">微信号</label>
          <input
            type="text"
            value={formData.contactWechat}
            onChange={(e) => setFormData({ ...formData, contactWechat: e.target.value })}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
        >
          {loading ? '提交中...' : '提交申请'}
        </button>
      </form>
    </div>
  )
}
```

- [ ] **Step 4: 提交鸟导入驻功能代码**

```bash
git add .
git commit -m "feat: implement guide onboarding application and profile management"
```

---

## Phase 5: 服务发布与管理

### Task 5: 实现服务产品管理

**Files:**
- Create: `src/app/api/services/route.ts`
- Create: `src/app/api/services/[id]/route.ts`
- Create: `src/app/(dashboard)/guide/services/page.tsx`
- Create: `src/app/(dashboard)/guide/services/new/page.tsx`

- [ ] **Step 1: 实现服务列表和创建 API**

```typescript
// src/app/api/services/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - 获取服务列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const guideId = searchParams.get('guideId')
    const region = searchParams.get('region')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { status: 'ACTIVE' }
    if (guideId) where.guideId = guideId
    if (region) where.region = { contains: region }

    const [services, total] = await Promise.all([
      prisma.serviceProduct.findMany({
        where,
        include: {
          guide: {
            include: {
              user: {
                select: {
                  nickname: true,
                  avatar: true,
                },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.serviceProduct.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: services,
      meta: { page, limit, total },
    })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建服务
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    // 获取鸟导档案
    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (!guide || guide.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_APPROVED', message: '鸟导未通过审核' } },
        { status: 403 }
      )
    }

    const serviceData = await request.json()

    const service = await prisma.serviceProduct.create({
      data: {
        ...serviceData,
        guideId: guide.id,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 实现服务详情、更新、删除 API**

```typescript
// src/app/api/services/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - 获取服务详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const service = await prisma.serviceProduct.findUnique({
      where: { id: params.id },
      include: {
        guide: {
          include: {
            user: {
              select: {
                nickname: true,
                avatar: true,
              },
            },
          },
        },
      },
    })

    if (!service) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '服务不存在' } },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: service,
    })
  } catch (error) {
    console.error('Get service error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PATCH - 更新服务
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    // 验证所有权
    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    const service = await prisma.serviceProduct.findUnique({
      where: { id: params.id },
    })

    if (!service || service.guideId !== guide?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权操作' } },
        { status: 403 }
      )
    }

    const updateData = await request.json()
    delete updateData.id
    delete updateData.guideId

    const updated = await prisma.serviceProduct.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update service error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// DELETE - 删除服务
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    const service = await prisma.serviceProduct.findUnique({
      where: { id: params.id },
    })

    if (!service || service.guideId !== guide?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权操作' } },
        { status: 403 }
      )
    }

    // 软删除：改为暂停状态
    await prisma.serviceProduct.update({
      where: { id: params.id },
      data: { status: 'PAUSED' },
    })

    return NextResponse.json({
      success: true,
      data: { message: '服务已下架' },
    })
  } catch (error) {
    console.error('Delete service error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: 提交服务功能代码**

```bash
git add .
git commit -m "feat: implement service product CRUD APIs"
```

---

## Phase 6: 订单与支付系统

### Task 6: 实现订单创建与微信支付

**Files:**
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/api/orders/[id]/route.ts`
- Create: `src/app/api/payments/wechat/route.ts`
- Create: `src/app/api/payments/callback/route.ts`
- Create: `src/lib/payment.ts`

- [ ] **Step 1: 实现微信支付工具**

```typescript
// src/lib/payment.ts
import crypto from 'crypto'

// 微信支付配置
const WECHAT_MCH_ID = process.env.WECHAT_MCH_ID!
const WECHAT_API_KEY = process.env.WECHAT_API_KEY!
const WECHAT_APP_ID = process.env.WECHAT_APP_ID!

// 生成订单号
export function generateOrderNo(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(100000 + Math.random() * 900000)
  return `WB${date}${random}`
}

// 微信支付签名
export function generateWechatSign(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .filter(key => params[key] !== undefined && params[key] !== '')
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&')

  const stringSignTemp = sorted + '&key=' + WECHAT_API_KEY
  return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase()
}

// 生成微信支付参数
export function generatePaymentParams(params: {
  body: string
  outTradeNo: string
  totalFee: number
  spbillCreateIp: string
  openid: string
  notifyUrl: string
}) {
  const baseParams = {
    appid: WECHAT_APP_ID,
    mch_id: WECHAT_MCH_ID,
    nonce_str: crypto.randomBytes(16).toString('hex'),
    body: params.body,
    out_trade_no: params.outTradeNo,
    total_fee: params.totalFee.toString(),
    spbill_create_ip: params.spbillCreateIp,
    notify_url: params.notifyUrl,
    trade_type: 'JSAPI',
    openid: params.openid,
  }

  const sign = generateWechatSign(baseParams)

  return { ...baseParams, sign }
}

// 统一下单请求（简化版，实际需要调用微信API）
export async function unifiedOrder(params: ReturnType<typeof generatePaymentParams>) {
  // TODO: 实现真实的微信统一下单 API 调用
  // 返回 prepay_id 等参数
  return {
    prepayId: `mock_${Date.now()}`,
    ...params,
  }
}
```

- [ ] **Step 2: 实现订单创建 API**

```typescript
// src/app/api/orders/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'
import { generateOrderNo } from '@/lib/payment'

// GET - 获取订单列表
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'user' | 'guide'
    const status = searchParams.get('status')

    const where: any = {}
    if (type === 'user') {
      where.userId = payload.userId
    } else if (type === 'guide') {
      const guide = await prisma.guideProfile.findUnique({
        where: { userId: payload.userId },
      })
      where.guideId = guide?.id
    }
    if (status) where.status = status

    const orders = await prisma.order.findMany({
      where,
      include: {
        product: true,
        guide: {
          include: {
            user: {
              select: { nickname: true, avatar: true },
            },
          },
        },
        user: {
          select: { nickname: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: orders,
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建订单
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const { productId, serviceDate, peopleCount, remark } = await request.json()

    // 获取服务信息
    const product = await prisma.serviceProduct.findUnique({
      where: { id: productId },
      include: { guide: true },
    })

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'PRODUCT_NOT_FOUND', message: '服务不存在或已下架' } },
        { status: 404 }
      )
    }

    // 计算总价
    const price = product.priceType === 'per_person'
      ? product.price * peopleCount
      : product.price

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNo: generateOrderNo(),
        userId: payload.userId,
        guideId: product.guideId,
        productId: product.id,
        type: product.type,
        serviceDate: new Date(serviceDate),
        peopleCount,
        totalPrice: price,
        status: 'PENDING_PAYMENT',
        userRemark: remark,
      },
      include: {
        product: true,
        guide: {
          include: {
            user: {
              select: { nickname: true },
            },
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: 实现订单详情和状态更新 API**

```typescript
// src/app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - 获取订单详情
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: {
        product: true,
        guide: {
          include: {
            user: {
              select: { nickname: true, avatar: true, phone: true },
            },
          },
        },
        user: {
          select: { nickname: true, avatar: true, phone: true },
        },
        payment: true,
        reviews: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '订单不存在' } },
        { status: 404 }
      )
    }

    // 验证权限
    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    if (order.userId !== payload.userId && order.guideId !== guide?.id && payload.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权查看' } },
        { status: 403 }
      )
    }

    return NextResponse.json({
      success: true,
      data: order,
    })
  } catch (error) {
    console.error('Get order error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PATCH - 更新订单状态
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const { action } = await request.json()

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '订单不存在' } },
        { status: 404 }
      )
    }

    const guide = await prisma.guideProfile.findUnique({
      where: { userId: payload.userId },
    })

    let updateData: any = {}

    switch (action) {
      case 'confirm': // 鸟导确认订单
        if (order.guideId !== guide?.id) {
          return NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: '无权操作' } },
            { status: 403 }
          )
        }
        if (order.status !== 'PENDING_CONFIRM') {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_STATUS', message: '订单状态不正确' } },
            { status: 400 }
          )
        }
        updateData = { status: 'CONFIRMED', confirmedAt: new Date() }
        break

      case 'start': // 开始服务
        if (order.guideId !== guide?.id) {
          return NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: '无权操作' } },
            { status: 403 }
          )
        }
        if (order.status !== 'CONFIRMED') {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_STATUS', message: '订单状态不正确' } },
            { status: 400 }
          )
        }
        updateData = { status: 'IN_SERVICE' }
        break

      case 'complete': // 完成服务
        if (order.guideId !== guide?.id) {
          return NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: '无权操作' } },
            { status: 403 }
          )
        }
        if (order.status !== 'IN_SERVICE') {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_STATUS', message: '订单状态不正确' } },
            { status: 400 }
          )
        }
        updateData = { status: 'PENDING_REVIEW', completedAt: new Date() }
        break

      case 'cancel': // 取消订单
        if (order.userId !== payload.userId && order.guideId !== guide?.id) {
          return NextResponse.json(
            { success: false, error: { code: 'FORBIDDEN', message: '无权操作' } },
            { status: 403 }
          )
        }
        if (!['PENDING_PAYMENT', 'PENDING_CONFIRM'].includes(order.status)) {
          return NextResponse.json(
            { success: false, error: { code: 'INVALID_STATUS', message: '订单状态不可取消' } },
            { status: 400 }
          )
        }
        updateData = { status: 'CANCELLED', cancelledAt: new Date() }
        break

      default:
        return NextResponse.json(
          { success: false, error: { code: 'INVALID_ACTION', message: '无效的操作' } },
          { status: 400 }
        )
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: 提交订单系统代码**

```bash
git add .
git commit -m "feat: implement order management with state machine"
```

---

## Phase 7: 评价系统

### Task 7: 实现双向评价

**Files:**
- Create: `src/app/api/reviews/route.ts`
- Create: `src/app/api/reviews/[id]/reply/route.ts`
- Create: `src/app/api/admin/reviews/route.ts`

- [ ] **Step 1: 实现评价创建 API**

```typescript
// src/app/api/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// GET - 获取评价列表
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const guideId = searchParams.get('guideId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = { auditStatus: 'PASSED' }
    if (userId) where.reviewerId = userId
    if (guideId) {
      const guide = await prisma.guideProfile.findUnique({
        where: { id: guideId },
      })
      if (guide) where.revieweeId = guide.userId
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          reviewer: {
            select: { nickname: true, avatar: true },
          },
          order: {
            select: {
              product: {
                select: { title: true },
              },
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: { page, limit, total },
    })
  } catch (error) {
    console.error('Get reviews error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// POST - 创建评价
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const { orderId, rating, content, tags } = await request.json()

    // 获取订单信息
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        guide: {
          include: { user: true },
        },
        reviews: true,
      },
    })

    if (!order) {
      return NextResponse.json(
        { success: false, error: { code: 'ORDER_NOT_FOUND', message: '订单不存在' } },
        { status: 404 }
      )
    }

    // 验证评价权限
    const isUser = order.userId === payload.userId
    const isGuide = order.guide.userId === payload.userId

    if (!isUser && !isGuide) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权评价' } },
        { status: 403 }
      )
    }

    // 验证订单状态
    if (order.status !== 'PENDING_REVIEW' && order.status !== 'COMPLETED') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '订单状态不可评价' } },
        { status: 400 }
      )
    }

    // 检查是否已评价
    const existingReview = order.reviews.find(r =>
      r.reviewerId === payload.userId
    )
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: { code: 'ALREADY_REVIEWED', message: '您已评价过此订单' } },
        { status: 409 }
      )
    }

    // 确定评价对象
    const revieweeId = isUser ? order.guide.userId : order.userId

    // 评分 ≤ 3 需要审核
    const auditStatus = rating <= 3 ? 'PENDING' : 'PASSED'

    const review = await prisma.review.create({
      data: {
        orderId,
        reviewerId: payload.userId,
        revieweeId,
        rating,
        content,
        tags: tags || [],
        auditStatus,
      },
    })

    // 如果双方都评价完成，更新订单状态
    const reviews = await prisma.review.findMany({
      where: { orderId },
    })
    if (reviews.length === 2 && order.status === 'PENDING_REVIEW') {
      await prisma.order.update({
        where: { id: orderId },
        data: { status: 'COMPLETED' },
      })
    }

    // 更新被评价者评分统计
    await updateUserRating(revieweeId)

    return NextResponse.json({
      success: true,
      data: review,
    })
  } catch (error) {
    console.error('Create review error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// 更新用户评分统计
async function updateUserRating(userId: string) {
  const reviews = await prisma.review.findMany({
    where: {
      revieweeId: userId,
      auditStatus: 'PASSED',
    },
  })

  if (reviews.length === 0) return

  const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
  const averageRating = totalRating / reviews.length

  // 更新鸟导档案
  const guide = await prisma.guideProfile.findUnique({
    where: { userId },
  })

  if (guide) {
    await prisma.guideProfile.update({
      where: { id: guide.id },
      data: {
        rating: averageRating,
        reviewCount: reviews.length,
      },
    })
  }
}
```

- [ ] **Step 2: 实现评价回复和审核 API**

```typescript
// src/app/api/reviews/[id]/reply/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: '未登录' } },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)

    const { reply } = await request.json()

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    })

    if (!review) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: '评价不存在' } },
        { status: 404 }
      )
    }

    // 只能回复给自己的评价
    if (review.revieweeId !== payload.userId) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权回复' } },
        { status: 403 }
      )
    }

    const updated = await prisma.review.update({
      where: { id: params.id },
      data: { reply, repliedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      data: updated,
    })
  } catch (error) {
    console.error('Reply review error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: 提交评价系统代码**

```bash
git add .
git commit -m "feat: implement two-way review system with audit"
```

---

## Phase 8: 运营后台

### Task 8: 实现管理后台基础功能

**Files:**
- Create: `src/app/api/admin/guides/route.ts`
- Create: `src/app/api/admin/orders/route.ts`
- Create: `src/app/api/admin/reviews/route.ts`
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/dashboard/page.tsx`

- [ ] **Step 1: 实现鸟导审核 API**

```typescript
// src/app/api/admin/guides/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

// 验证管理员权限
async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (payload.role !== 'ADMIN') {
    return null
  }

  return payload
}

// GET - 获取鸟导列表
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const where: any = {}
    if (status) where.status = status

    const [guides, total] = await Promise.all([
      prisma.guideProfile.findMany({
        where,
        include: {
          user: {
            select: { phone: true, nickname: true, avatar: true },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.guideProfile.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: guides,
      meta: { page, limit, total },
    })
  } catch (error) {
    console.error('Admin get guides error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PATCH - 审核鸟导
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      )
    }

    const { guideId, status, level, remark } = await request.json()

    if (!['APPROVED', 'REJECTED', 'SUSPENDED'].includes(status)) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_STATUS', message: '无效的状态' } },
        { status: 400 }
      )
    }

    const updateData: any = { status }
    if (level) updateData.level = level

    // 根据等级设置抽成比例
    if (status === 'APPROVED') {
      const rateMap: Record<string, number> = {
        BASIC: 0.15,
        ADVANCED: 0.12,
        GOLD: 0.08,
        PREMIUM: 0.05,
      }
      updateData.commissionRate = rateMap[level || 'BASIC']
    }

    const guide = await prisma.guideProfile.update({
      where: { id: guideId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: guide,
    })
  } catch (error) {
    console.error('Admin audit guide error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 2: 实现评价审核 API**

```typescript
// src/app/api/admin/reviews/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from '@/lib/auth'

async function verifyAdmin(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  const token = authHeader.substring(7)
  const payload = verifyToken(token)

  if (payload.role !== 'ADMIN') return null
  return payload
}

// GET - 获取待审核评价
export async function GET(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { auditStatus: status as any },
        include: {
          reviewer: {
            select: { nickname: true },
          },
          reviewee: {
            select: { nickname: true },
          },
          order: {
            select: {
              orderNo: true,
              totalPrice: true,
            },
          },
        },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.review.count({ where: { auditStatus: status as any } }),
    ])

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: { page, limit, total },
    })
  } catch (error) {
    console.error('Admin get reviews error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}

// PATCH - 审核评价
export async function PATCH(request: NextRequest) {
  try {
    const admin = await verifyAdmin(request)
    if (!admin) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: '无权访问' } },
        { status: 403 }
      )
    }

    const { reviewId, auditStatus, remark } = await request.json()

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: {
        auditStatus,
        auditRemark: remark,
      },
    })

    // 如果审核通过，更新被评价者评分
    if (auditStatus === 'PASSED') {
      const reviews = await prisma.review.findMany({
        where: {
          revieweeId: review.revieweeId,
          auditStatus: 'PASSED',
        },
      })

      const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0)
      const averageRating = totalRating / reviews.length

      const guide = await prisma.guideProfile.findUnique({
        where: { userId: review.revieweeId },
      })

      if (guide) {
        await prisma.guideProfile.update({
          where: { id: guide.id },
          data: {
            rating: averageRating,
            reviewCount: reviews.length,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      data: review,
    })
  } catch (error) {
    console.error('Admin audit review error:', error)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: '服务器错误' } },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 3: 提交管理后台代码**

```bash
git add .
git commit -m "feat: implement admin dashboard APIs for guide and review moderation"
```

---

## Phase 9: 前端页面实现

### Task 9: 实现核心页面

**Files:**
- Create: `src/app/(main)/page.tsx` - 首页
- Create: `src/app/(main)/guides/page.tsx` - 鸟导列表
- Create: `src/app/(main)/services/page.tsx` - 服务列表
- Create: `src/app/(main)/services/[id]/page.tsx` - 服务详情
- Create: `src/components/layout/Header.tsx`
- Create: `src/components/layout/Footer.tsx`

- [ ] **Step 1: 实现布局组件**

```tsx
// src/components/layout/Header.tsx
'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: string
  nickname?: string
  avatar?: string
  role: string
}

export default function Header() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // 从 localStorage 获取用户信息
    const token = localStorage.getItem('token')
    if (token) {
      // 可以调用 API 获取用户信息
      fetch('/api/users/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setUser(data.data)
        })
    }
  }, [])

  return (
    <header className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-primary-600">
              观鸟平台
            </Link>
            <nav className="ml-8 flex space-x-4">
              <Link href="/guides" className="text-gray-600 hover:text-gray-900">
                找鸟导
              </Link>
              <Link href="/services" className="text-gray-600 hover:text-gray-900">
                找服务
              </Link>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/dashboard/orders" className="text-gray-600 hover:text-gray-900">
                  我的订单
                </Link>
                <Link href="/dashboard/profile" className="text-gray-600 hover:text-gray-900">
                  {user.nickname || '个人中心'}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900">
                  登录
                </Link>
                <Link
                  href="/register"
                  className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
```

```tsx
// src/app/(main)/layout.tsx
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: 实现首页**

```tsx
// src/app/(main)/page.tsx
import Link from 'next/link'

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">发现专业观鸟向导</h1>
          <p className="text-xl mb-8">连接观鸟爱好者与专业鸟导，开启您的观鸟之旅</p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/guides"
              className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              找鸟导
            </Link>
            <Link
              href="/guide/apply"
              className="bg-primary-600 border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
            >
              成为鸟导
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">平台特色</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-2">认证鸟导</h3>
              <p className="text-gray-600">严格审核，分级认证，确保服务质量</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-2">担保交易</h3>
              <p className="text-gray-600">平台托管资金，服务完成后再结算</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow text-center">
              <h3 className="text-xl font-semibold mb-2">真实评价</h3>
              <p className="text-gray-600">双向评价系统，选择更放心</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
```

- [ ] **Step 3: 提交前端页面代码**

```bash
git add .
git commit -m "feat: implement frontend pages - home, header, footer"
```

---

## Phase 10: 部署配置

### Task 10: 配置生产环境

**Files:**
- Modify: `next.config.js`
- Create: `.env.production`

- [ ] **Step 1: 配置 Next.js 生产环境**

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['your-cos-domain.cos.ap-guangzhou.myqcloud.com'],
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PATCH,DELETE,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
```

- [ ] **Step 2: 创建生产环境变量模板**

```bash
cat > .env.production << 'EOF'
# Database (腾讯云 TDSQL-C)
DATABASE_URL="postgresql://user:password@your-tdsql-host:5432/watchbird?sslmode=require"

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="your-production-secret"

# WeChat
WECHAT_APP_ID="your-wechat-app-id"
WECHAT_APP_SECRET="your-wechat-app-secret"
WECHAT_MCH_ID="your-merchant-id"
WECHAT_API_KEY="your-api-key"
WECHAT_NOTIFY_URL="https://your-domain.vercel.app/api/payments/callback"

# Redis (腾讯云 Redis)
REDIS_URL="redis://:password@your-redis-host:6379"

# COS (腾讯云)
COS_SECRET_ID="your-secret-id"
COS_SECRET_KEY="your-secret-key"
COS_BUCKET="your-bucket"
COS_REGION="ap-guangzhou"
EOF
```

- [ ] **Step 3: 提交部署配置**

```bash
git add .
git commit -m "chore: add production deployment configuration"
```

---

## 计划总结

| Phase | 任务 | 预估工时 |
|-------|------|----------|
| 1 | 项目初始化 | 2h |
| 2 | 数据库模型 | 3h |
| 3 | 认证系统 | 4h |
| 4 | 鸟导入驻 | 3h |
| 5 | 服务管理 | 3h |
| 6 | 订单支付 | 5h |
| 7 | 评价系统 | 3h |
| 8 | 运营后台 | 3h |
| 9 | 前端页面 | 5h |
| 10 | 部署配置 | 2h |
| **总计** | | **33h** |

---

## 后续计划（P1/P2）

- [ ] 微信支付完整集成
- [ ] 短信服务接入
- [ ] 图片上传 COS
- [ ] 微信登录 OAuth
- [ ] 消息通知系统
- [ ] 政府合作专区
- [ ] 数据报表
