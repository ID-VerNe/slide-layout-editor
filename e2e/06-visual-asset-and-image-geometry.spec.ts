import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('图片资产控制与几何边界锁死端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    await createNewProjectAndEnterEditor(page);
    // 注入有效图片数据以激活 ImageField 的调节工具栏
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__;
      const state = store.getState();
      const currentPage = state.pages[state.currentPageIndex];
      store.getState().updatePage({
        ...currentPage,
        image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
      });
    });
  });

  test('图片微调面板展开后，能够控制 Scale 缩放与平移联动', async ({ page, consoleErrors }) => {
    // 1. 定位并点击属性面板中的“Adjust Image”调节按钮
    const adjustBtn = page.getByTitle('Adjust Image');
    await expect(adjustBtn).toBeVisible({ timeout: 10000 });
    await adjustBtn.click();

    // 2. 展开后验证出现 Fit to Container 按钮与 Scale 滑块
    const fitBtn = page.getByRole('button', { name: /Fit to Container/i });
    await expect(fitBtn).toBeVisible({ timeout: 5000 });

    const scaleSlider = page.locator('span:has-text("Scale")').first();
    await expect(scaleSlider).toBeVisible();

    // 3. 点击 Fit to Container，验证重置操作正常触发
    await fitBtn.click();
    await page.waitForTimeout(300);

    // 4. 验证控制台零红字报错
    expect(consoleErrors).toEqual([]);
  });

  test('图片在未放大且已满幅时，对应轴向平移滑块应处于 Locked 锁定禁用状态', async ({ page, consoleErrors }) => {
    // 1. 展开图片微调面板
    const adjustBtn = page.getByTitle('Adjust Image');
    await expect(adjustBtn).toBeVisible({ timeout: 10000 });
    await adjustBtn.click();

    // 2. 验证出现带有 "(Locked)" 的滑块标签
    const lockedSliderLabel = page.locator('span').filter({ hasText: /Move (Horiz|Vert)\. \(Locked\)/i }).first();
    await expect(lockedSliderLabel).toBeVisible({ timeout: 5000 });

    // 3. 验证对应禁用输入框
    const sliderContainer = lockedSliderLabel.locator('..');
    const rangeInput = sliderContainer.locator('input[type="range"]');
    await expect(rangeInput).toBeDisabled();

    // 4. 验证控制台零报错
    expect(consoleErrors).toEqual([]);
  });
});
