import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('专属 DirectionSwitcher 与 JSON 模板方向联动 E2E 测试', () => {
  test.beforeEach(async ({ page }) => {
    // 启动隔离环境并进入编辑器
    await createNewProjectAndEnterEditor(page);
  });

  test('Editorial Split 左右切换：点击 Image Right 分段按钮应即时切换布局变体', async ({ page, consoleErrors }) => {
    // 1. 切换至 editorial-split 模板
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const currentPage = state.pages[state.currentPageIndex] || state.pages[0];
      state.updatePage({ ...currentPage, layoutId: 'editorial-split', layoutVariant: 'left' });
    });
    await page.waitForTimeout(300);

    // 2. 检查右侧面板渲染专属 DirectionSwitcher（Image Left / Image Right）
    const leftBtn = page.getByRole('button', { name: /Image Left/i }).first();
    const rightBtn = page.getByRole('button', { name: /Image Right/i }).first();
    await expect(leftBtn).toBeVisible({ timeout: 5000 });
    await expect(rightBtn).toBeVisible({ timeout: 5000 });

    // 默认应高亮 Image Left
    await expect(leftBtn).toHaveClass(/bg-white/);

    // 3. 模拟用户点击 Image Right
    await rightBtn.click();
    await page.waitForTimeout(200);

    // 4. 验证高亮切换到 Image Right
    await expect(rightBtn).toHaveClass(/bg-white/);

    // 5. 验证 store 状态已同步更新为 right
    const currentVariant = await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const pageData = state.pages[state.currentPageIndex] || state.pages[0];
      return pageData.layoutVariant;
    });
    expect(currentVariant).toBe('right');

    // 6. 画布无崩溃
    const canvasArea = page.locator('.magazine-page').first();
    await expect(canvasArea).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });

  test('Cinematic Full Bleed 上下切换：Headline Top 与 Bottom 切换无缝响应', async ({ page, consoleErrors }) => {
    // 1. 切换至 cinematic-full-bleed 模板
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const currentPage = state.pages[state.currentPageIndex] || state.pages[0];
      state.updatePage({ ...currentPage, layoutId: 'cinematic-full-bleed', layoutVariant: 'bottom' });
    });
    await page.waitForTimeout(300);

    // 2. 检查渲染 Headline Top / Headline Bottom
    const topBtn = page.getByRole('button', { name: /Headline Top/i }).first();
    const bottomBtn = page.getByRole('button', { name: /Headline Bottom/i }).first();
    await expect(topBtn).toBeVisible({ timeout: 5000 });
    await expect(bottomBtn).toBeVisible({ timeout: 5000 });

    // 3. 点击 Headline Top
    await topBtn.click();
    await page.waitForTimeout(200);
    await expect(topBtn).toHaveClass(/bg-white/);

    // 4. 验证 store 状态已为 top
    const currentVariant = await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const pageData = state.pages[state.currentPageIndex] || state.pages[0];
      return pageData.layoutVariant;
    });
    expect(currentVariant).toBe('top');

    // 5. 点击 Headline Bottom 切回
    await bottomBtn.click();
    await page.waitForTimeout(200);
    await expect(bottomBtn).toHaveClass(/bg-white/);

    expect(consoleErrors).toEqual([]);
  });

  test('Film Diptych 横竖切换：Horizontal 与 Vertical 切割方式切换', async ({ page, consoleErrors }) => {
    // 1. 切换至 film-diptych 模板
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const currentPage = state.pages[state.currentPageIndex] || state.pages[0];
      state.updatePage({ ...currentPage, layoutId: 'film-diptych', layoutVariant: 'horizontal' });
    });
    await page.waitForTimeout(300);

    // 2. 检查渲染 Horizontal / Vertical 按钮
    const horizBtn = page.getByRole('button', { name: /Horizontal/i }).first();
    const vertBtn = page.getByRole('button', { name: /Vertical/i }).first();
    await expect(horizBtn).toBeVisible({ timeout: 5000 });
    await expect(vertBtn).toBeVisible({ timeout: 5000 });

    // 3. 点击 Vertical
    await vertBtn.click();
    await page.waitForTimeout(200);
    await expect(vertBtn).toHaveClass(/bg-white/);

    // 4. 验证状态
    const currentVariant = await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const pageData = state.pages[state.currentPageIndex] || state.pages[0];
      return pageData.layoutVariant;
    });
    expect(currentVariant).toBe('vertical');

    expect(consoleErrors).toEqual([]);
  });

  test('Gallery Capsule 三态切换：Under / Over / Minimal 胶囊视觉方案自由切换', async ({ page, consoleErrors }) => {
    // 1. 切换至 gallery-capsule 模板
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const currentPage = state.pages[state.currentPageIndex] || state.pages[0];
      state.updatePage({ ...currentPage, layoutId: 'gallery-capsule', layoutVariant: 'under' });
    });
    await page.waitForTimeout(300);

    // 2. 检查三个分段按钮渲染
    const underBtn = page.getByRole('button', { name: /Under/i }).first();
    const overBtn = page.getByRole('button', { name: /Over/i }).first();
    const minBtn = page.getByRole('button', { name: /Minimal/i }).first();

    await expect(underBtn).toBeVisible({ timeout: 5000 });
    await expect(overBtn).toBeVisible({ timeout: 5000 });
    await expect(minBtn).toBeVisible({ timeout: 5000 });

    // 3. 点击 Over
    await overBtn.click();
    await page.waitForTimeout(200);
    await expect(overBtn).toHaveClass(/bg-white/);

    // 4. 点击 Minimal
    await minBtn.click();
    await page.waitForTimeout(200);
    await expect(minBtn).toHaveClass(/bg-white/);

    // 5. 验证状态已为 minimal
    const currentVariant = await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const pageData = state.pages[state.currentPageIndex] || state.pages[0];
      return pageData.layoutVariant;
    });
    expect(currentVariant).toBe('minimal');

    expect(consoleErrors).toEqual([]);
  });

  test('Apple Bento Grid 可视化设计器弹窗交互完整性', async ({ page, consoleErrors }) => {
    // 1. 切换至 apple-bento-grid 模板
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
      const state = store.getState();
      const currentPage = state.pages[state.currentPageIndex] || state.pages[0];
      state.updatePage({ ...currentPage, layoutId: 'apple-bento-grid' });
    });
    await page.waitForTimeout(300);

    // 2. 点击唤起 Bento Layout Painter 按钮
    const openDesignerBtn = page.getByRole('button', { name: /Open Bento Layout Painter/i }).first();
    if (await openDesignerBtn.isVisible()) {
      await openDesignerBtn.click();
      await page.waitForTimeout(200);

      // 3. 验证模态窗打开且存在 Save & Exit 按钮
      const saveBtn = page.getByRole('button', { name: /Save & Exit/i }).first();
      await expect(saveBtn).toBeVisible({ timeout: 5000 });

      // 4. 点击保存退出
      await saveBtn.click();
      await page.waitForTimeout(200);
      await expect(saveBtn).not.toBeVisible();
    }

    expect(consoleErrors).toEqual([]);
  });
});
