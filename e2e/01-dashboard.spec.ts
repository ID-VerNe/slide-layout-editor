import { test, expect } from './fixtures';

test.describe('工作台 (Dashboard) 基础功能与全交互测试', () => {
  test('应用启动后正常展示工作台标题、导航工具栏与空状态引导', async ({ page, consoleErrors }) => {
    // 1. 验证窗口标题
    const title = await page.title();
    expect(title).toContain('SlideGrid Studio');

    // 2. 验证品牌 Logo 与主标识
    await expect(page.getByText('SlideGrid Studio').first()).toBeVisible();

    // 3. 验证顶部导航按钮存在且可交互
    const newSlideBtn = page.getByRole('button', { name: /New Slide/i });
    await expect(newSlideBtn).toBeVisible();

    const openArchiveBtn = page.getByRole('button', { name: /Open Archive/i });
    await expect(openArchiveBtn).toBeVisible();

    // 4. 验证最近项目列表区域与状态标识
    await expect(page.getByText(/Recent Projects/i)).toBeVisible();

    // 5. 验证在隔离的测试环境中正确捕获无工程空状态
    await expect(page.getByText(/No projects found/i)).toBeVisible();

    // 6. 验证全程无渲染层致命错误
    expect(consoleErrors).toEqual([]);
  });

  test('点击新建项目按钮能够成功初始化工程并无缝跳转至编辑器', async ({ page, consoleErrors }) => {
    // 1. 点击 New Slide 触发工程创建
    const newSlideBtn = page.getByRole('button', { name: /New Slide/i });
    await newSlideBtn.click();

    // 2. 验证路由正常跳转到编辑器页面
    await expect(page).toHaveURL(/.*#\/editor\/.*/, { timeout: 15000 });

    // 3. 验证编辑器主体布局正常挂载（侧边栏与核心操作区）
    await expect(page.getByTitle('Back to Dashboard')).toBeVisible({ timeout: 10000 });

    // 4. 验证全程无致命错误
    expect(consoleErrors).toEqual([]);
  });
});
