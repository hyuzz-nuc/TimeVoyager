/**
 * TimeVoyager 全页面点击测试
 * 测试所有页面所有可点击按钮
 */

import { test, expect } from '@playwright/test';

test.describe('TimeVoyager 全页面测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
  });

  test('首页所有按钮测试', async ({ page }) => {
    console.log('📋 测试首页...');
    
    // 检查底部导航栏
    await expect(page.locator('.v-bottom-navigation')).toBeVisible();
    
    // 点击 5 个导航按钮
    await page.click('text=首页');
    await page.waitForTimeout(500);
    
    await page.click('text=星域');
    await page.waitForURL(/\/map/);
    await page.waitForTimeout(500);
    
    await page.click('text=专注');
    await page.waitForURL(/\/timer/);
    await page.waitForTimeout(500);
    
    await page.click('text=背包');
    await page.waitForURL(/\/spirits/);
    await page.waitForTimeout(500);
    
    await page.click('text=我的');
    await page.waitForURL(/\/profile/);
    await page.waitForTimeout(500);
    
    console.log('✅ 底部导航栏测试通过');
  });

  test('首页快捷入口测试', async ({ page }) => {
    await page.goto('http://localhost:5175/');
    
    // 能量银行
    const bankBtn = page.locator('text=能量银行');
    await expect(bankBtn).toBeVisible();
    await bankBtn.click();
    await page.waitForURL(/\/bank/);
    await page.waitForTimeout(500);
    
    // 返回首页
    await page.click('text=首页');
    await page.waitForTimeout(500);
    
    // 商店
    const shopBtn = page.locator('text=商店');
    await expect(shopBtn).toBeVisible();
    await shopBtn.click();
    await page.waitForURL(/\/shop/);
    await page.waitForTimeout(500);
    
    // 返回首页
    await page.click('text=首页');
    await page.waitForTimeout(500);
    
    // 每日任务
    const tasksBtn = page.locator('text=每日任务');
    await expect(tasksBtn).toBeVisible();
    await tasksBtn.click();
    await page.waitForURL(/\/tasks/);
    await page.waitForTimeout(500);
    
    // 返回首页
    await page.click('text=首页');
    await page.waitForTimeout(500);
    
    // 成就
    const achievementsBtn = page.locator('text=成就');
    await expect(achievementsBtn).toBeVisible();
    await achievementsBtn.click();
    await page.waitForURL(/\/achievements/);
    await page.waitForTimeout(500);
    
    // 返回首页
    await page.click('text=首页');
    await page.waitForTimeout(500);
    
    // 开始专注
    const startTimerBtn = page.locator('text=开始专注');
    await expect(startTimerBtn).toBeVisible();
    await startTimerBtn.click();
    await page.waitForURL(/\/timer/);
    await page.waitForTimeout(500);
    
    console.log('✅ 首页快捷入口测试通过');
  });

  test('计时器页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/timer');
    
    // 开始按钮
    const startBtn = page.locator('text=开始');
    await expect(startBtn).toBeVisible();
    await startBtn.click();
    await page.waitForTimeout(1000);
    
    // 暂停按钮
    const pauseBtn = page.locator('text=暂停');
    await expect(pauseBtn).toBeVisible();
    await pauseBtn.click();
    await page.waitForTimeout(500);
    
    // 重置按钮
    const resetBtn = page.locator('text=重置');
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
    await page.waitForTimeout(500);
    
    console.log('✅ 计时器页面测试通过');
  });

  test('星域地图页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/map');
    
    // 检查地图网格
    const mapGrid = page.locator('.map-grid');
    await expect(mapGrid).toBeVisible();
    
    // 检查探索按钮（使用更精确的选择器）
    const exploreBtn = page.locator('button:has-text("探索")');
    await expect(exploreBtn).toBeVisible();
    
    // 点击探索按钮
    await exploreBtn.click();
    await page.waitForTimeout(500);
    
    // 检查重置按钮
    const resetBtn = page.locator('text=重置');
    await expect(resetBtn).toBeVisible();
    
    // 检查图例
    const legend = page.locator('text=图例');
    await expect(legend).toBeVisible();
    
    console.log('✅ 星域地图页面测试通过');
  });

  test('星灵背包页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/spirits');
    
    // 星灵图鉴标题
    await expect(page.locator('text=星灵图鉴')).toBeVisible();
    
    // 收集进度
    await expect(page.locator('text=收集进度')).toBeVisible();
    
    console.log('✅ 星灵背包页面测试通过');
  });

  test('商店页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/shop');
    
    // 分类标签
    await expect(page.locator('text=全部')).toBeVisible();
    await expect(page.locator('text=材料')).toBeVisible();
    await expect(page.locator('text=道具')).toBeVisible();
    
    // 点击材料分类
    await page.click('text=材料');
    await page.waitForTimeout(500);
    
    // 点击道具分类
    await page.click('text=道具');
    await page.waitForTimeout(500);
    
    // 检查商品列表
    const shopItems = page.locator('.shop-item');
    const count = await shopItems.count();
    console.log(`📦 商店商品数量：${count}`);
    
    // 检查第一个商品的购买按钮
    if (count > 0) {
      const buyBtn = shopItems.first().locator('text=购买');
      await expect(buyBtn).toBeVisible();
    }
    
    console.log('✅ 商店页面测试通过');
  });

  test('个人中心页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/profile');
    
    // 检查个人中心标题
    await expect(page.locator('text=个人中心')).toBeVisible();
    
    console.log('✅ 个人中心页面测试通过');
  });

  test('成就页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/achievements');
    
    // 检查成就标题
    await expect(page.locator('text=成就')).toBeVisible();
    
    console.log('✅ 成就页面测试通过');
  });

  test('任务页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/tasks');
    
    // 检查任务标题
    await expect(page.locator('text=每日任务')).toBeVisible();
    
    console.log('✅ 任务页面测试通过');
  });

  test('能量银行页面测试', async ({ page }) => {
    await page.goto('http://localhost:5175/bank');
    
    // 检查能量银行标题
    await expect(page.locator('text=能量银行')).toBeVisible();
    
    console.log('✅ 能量银行页面测试通过');
  });
});
