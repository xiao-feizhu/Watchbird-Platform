# 测试指南

## 快速开始

```bash
# 安装依赖
npm install

# 运行所有单元测试
npm test

# 运行测试并监听文件变化
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 运行 E2E 测试
npm run test:e2e

# 以 UI 模式运行 E2E 测试
npm run test:e2e:ui
```

## 测试结构

```
├── src/
│   ├── components/
│   │   └── ui/
│   │       └── __tests__/          # 组件单元测试
│   │           └── ui-components.test.tsx
│   ├── app/
│   │   └── orders/
│   │       └── __tests__/          # 页面/模块单元测试
│   │           └── types.test.ts
│   └── hooks/
│       └── __tests__/              # Hooks 测试
├── e2e/                            # E2E 测试
│   └── home.spec.ts
├── __mocks__/                      # Jest Mock 文件
│   ├── fileMock.js
│   └── styleMock.js
├── jest.config.js                  # Jest 配置
├── jest.setup.js                   # Jest 初始化
└── playwright.config.ts            # Playwright 配置
```

## 单元测试（Jest）

### 测试组件

```tsx
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/Badge'

describe('Badge 组件', () => {
  it('应该正确渲染默认变体', () => {
    render(<Badge>测试</Badge>)
    expect(screen.getByText('测试')).toBeInTheDocument()
  })
})
```

### 测试 Hooks

```tsx
import { renderHook, act } from '@testing-library/react'
import { useState } from 'react'

describe('useCounter', () => {
  it('应该正确计数', () => {
    const { result } = renderHook(() => useState(0))

    act(() => {
      result.current[1](1)
    })

    expect(result.current[0]).toBe(1)
  })
})
```

### 测试工具函数

```ts
import { formatPrice } from '@/utils/format'

describe('formatPrice', () => {
  it('应该正确格式化价格', () => {
    expect(formatPrice(100)).toBe('¥100')
    expect(formatPrice(100.5)).toBe('¥100.50')
  })
})
```

## E2E 测试（Playwright）

### 测试页面导航

```ts
import { test, expect } from '@playwright/test'

test('用户应该能完成登录流程', async ({ page }) => {
  // 访问登录页
  await page.goto('/login')

  // 填写表单
  await page.getByLabel('手机号').fill('13800138000')
  await page.getByLabel('验证码').fill('123456')

  // 提交
  await page.getByRole('button', { name: '登录' }).click()

  // 验证跳转
  await expect(page).toHaveURL('/')
  await expect(page.getByText('欢迎回来')).toBeVisible()
})
```

### 测试关键用户流程

```ts
test.describe('订单流程', () => {
  test('用户应该能浏览服务并创建订单', async ({ page }) => {
    // 浏览服务
    await page.goto('/services')
    await page.getByRole('link', { name: /服务卡片/ }).first().click()

    // 在服务详情页点击预约
    await page.getByRole('button', { name: '立即预约' }).click()

    // 填写订单信息
    await page.getByLabel('出行人数').fill('2')
    await page.getByRole('button', { name: '提交订单' }).click()

    // 验证跳转到订单确认页
    await expect(page).toHaveURL(/\/orders\/.+/)
  })
})
```

## 在 CI/CD 中运行测试

### GitHub Actions 示例

```yaml
name: Test

on: [push, pull_request]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test -- --coverage

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

## 测试最佳实践

1. **测试行为而非实现**：测试用户看到什么，而不是代码如何实现
2. **AAA 模式**：Arrange（准备）→ Act（执行）→ Assert（断言）
3. **一个断言一个概念**：每个测试只验证一个行为
4. **使用有意义的描述**：测试描述应该像文档一样清晰
5. **避免测试第三方库**：专注于自己的代码逻辑

## 覆盖率要求

- 语句覆盖率：≥ 80%
- 分支覆盖率：≥ 70%
- 函数覆盖率：≥ 80%
- 行覆盖率：≥ 80%
