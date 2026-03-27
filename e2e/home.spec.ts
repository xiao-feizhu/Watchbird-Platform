import { test, expect } from '@playwright/test'

test.describe('首页', () => {
  test('应该显示正确的标题', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveTitle(/观鸟资源整合平台/)
  })

  test('应该显示 Hero 区域', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('发现身边的观鸟圣地')).toBeVisible()
    await expect(page.getByRole('link', { name: '开始探索' })).toBeVisible()
  })

  test('应该显示导航菜单', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByRole('link', { name: '鸟导' })).toBeVisible()
    await expect(page.getByRole('link', { name: '服务' })).toBeVisible()
  })
})

test.describe('用户认证', () => {
  test('应该能访问登录页面', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: '欢迎回来' })).toBeVisible()
  })

  test('应该能访问注册页面', async ({ page }) => {
    await page.goto('/register')
    await expect(page.getByRole('heading', { name: '创建账号' })).toBeVisible()
  })
})

test.describe('服务页面', () => {
  test('应该显示服务列表', async ({ page }) => {
    await page.goto('/services')
    await expect(page.getByRole('heading', { name: '服务产品' })).toBeVisible()
  })
})
