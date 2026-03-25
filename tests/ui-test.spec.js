/**
 * TimeVoyager UI 自动化测试
 * 测试所有页面按钮和功能
 */

import { test, expect } from '@playwright/test';

test.describe('TimeVoyager UI 测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5174');
  });

  test('首页加载', async ({ page }) => {
    await expect(page).toHaveTitle(/TimeVoyager/);
    
    // 检查底部导航栏
    await expect(page.locator('.v-bottom-navigation')).toBeVisible();
    
    // 检查 5 个导航按钮
    const navButtons = page.locator('.v-bottom-navigation .v-btn');
    await expect(navButtons).toHaveCount(5);
  });

  test('底部导航栏测试', async ({ page }) => {
    // 首页按钮
    await page.click('text=首页');
    await expect(page).toHaveURL('/');
    
    // 星域按钮
    await page.click('text=星域');
    await expect(page).toHaveURL('/map');
    
    // 专注按钮
    await page.click('text=专注');
    await expect(page).toHaveURL('/timer');
    
    // 背包按钮
    await page.click('text=背包');
    await expect(page).toHaveURL('/spirits');
    
    // 我的按钮
    await page.click('text=我的');
    await expect(page).toHaveURL('/profile');
  });

  test('首页快捷按钮测试', async ({ page }) => {
    await page.goto('http://localhost:5174/');
    
    // 能量银行
    await page.click('text=能量银行');
    await expect(page).toHaveURL('/bank');
    
    // 返回首页
    await page.click('text=首页');
    
    // 商店
    await page.click('text=商店');
    await expect(page).toHaveURL('/shop');
    
    // 返回首页
    await page.click('text=首页');
    
    // 每日任务
    await page.click('text=每日任务');
    await expect(page).toHaveURL('/tasks');
    
    // 返回首页
    await page.click('text=首页');
    
    // 成就
    await page.click('text=成就');
    await expect(page).toHaveURL('/achievements');
    
    // 返回首页
    await page.click('text=首页');
    
    // 开始专注
    await page.click('text=开始专注');
    await expect(page).toHaveURL('/timer');
  });

  test('计时器功能测试', async ({ page }) => {
    await page.goto('http://localhost:5174/timer');
    
    // 检查开始按钮
    const startBtn = page.locator('text=开始');
    await expect(startBtn).toBeVisible();
    
    // 检查重置按钮
    const resetBtn = page.locator('text=重置');
    await expect(resetBtn).toBeVisible();
  });

  test('星域地图测试', async ({ page }) => {
    await page.goto('http://localhost:5174/map');
    
    // 检查地图网格
    const mapGrid = page.locator('.map-grid');
    await expect(mapGrid).toBeVisible();
    
    // 检查探索按钮
    const exploreBtn = page.locator('text=探索');
    await expect(exploreBtn).toBeVisible();
  });

  test('星灵背包测试', async ({ page }) => {
    await page.goto('http://localhost:5174/spirits');
    
    // 检查星灵图鉴标题
    await expect(page.locator('text=星灵图鉴')).toBeVisible();
    
    // 检查收集进度
    await expect(page.locator('text=收集进度')).toBeVisible();
  });
});
