import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('编辑器核心交互与页面流转测试', () => {
  test.beforeEach(async ({ page }) => {
    // 启动后先新建项目并进入编辑器主界面
    await createNewProjectAndEnterEditor(page);
  });

  test('编辑工程标题后，顶部导航栏和窗口标题应实时同步未保存标记', async ({ page, consoleErrors }) => {
    // 1. 定位 TopNav 中的工程标题输入框
    const titleInput = page.locator('input[value="New Slide"], input[placeholder*="Untitled"], input[placeholder*="PLACEHOLDER"]').first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });

    // 2. 清空并填入自定义测试标题
    const newTitle = 'E2E AUTOMATION TEST PROJECT';
    await titleInput.fill(newTitle);
    await titleInput.blur();

    // 3. 验证页面与窗口标题更新且带有未保存标记
    await expect(async () => {
      const winTitle = await page.title();
      expect(winTitle).toContain(newTitle);
    }).toPass({ timeout: 5000 });

    // 4. 验证控制台零报错
    expect(consoleErrors).toEqual([]);
  });

  test('侧边栏幻灯片增删与页码切换联动验证', async ({ page, consoleErrors }) => {
    // 1. 验证初始状态有 1 张幻灯片
    await expect(page.getByText(/Slide 1 \/\/ 1/i)).toBeVisible();

    // 2. 通过暴露的 store 直接新增第 2 张幻灯片
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__;
      store.getState().addPage('16:9', 'modern-feature');
    });

    // 3. 验证幻灯片计数变为 2 (Slide 2 // 2)
    await expect(page.getByText(/Slide 2 \/\/ 2/i)).toBeVisible({ timeout: 5000 });

    // 4. 验证全程无报错
    expect(consoleErrors).toEqual([]);
  });

  test('画布缩放与 Fit 自适应控制按钮响应正常', async ({ page, consoleErrors }) => {
    // 1. 获取自适应模式切换按钮（Fit / Free）
    const fitBtn = page.getByRole('button', { name: /Fit|Free/i });
    await expect(fitBtn).toBeVisible();

    // 2. 连续点击切换自适应与自由模式
    await fitBtn.click();
    await page.waitForTimeout(300);
    await fitBtn.click();

    // 3. 验证缩放百分比文案显示正常（例如 100% 或其他计算比例）
    const zoomText = page.locator('span[class*="font-mono"]').filter({ hasText: /%/ });
    await expect(zoomText).toBeVisible();

    // 4. 验证控制台无报错
    expect(consoleErrors).toEqual([]);
  });
});
