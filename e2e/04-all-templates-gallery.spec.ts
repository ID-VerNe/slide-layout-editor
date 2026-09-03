import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

// 涵盖系统中已注册的全部 34 个核心模板 ID
const ALL_TEMPLATE_IDS = [
  // --- Zine Modular Series ---
  'zine-classic',
  'gravity-anchor-intro',
  'sincerity-portrait',
  'kinfolk-feature',
  'kinfolk-montage',
  'film-diptych',
  'micro-anchor',
  'artistic-l-space',
  'floating-gallery',
  'cinematic-letterbox',
  'vertical-column',
  'horizon-sky',
  'epilogue-pillar',
  'future-focus',
  'back-cover-movie',
  'gallery-capsule',
  'editorial-split',
  'cinematic-full-bleed',
  'editorial-classic',
  'editorial-back-cover',
  'kinfolk-essay',
  'typography-hero',
  // --- Product / Marketing / General Series ---
  'apple-bento-grid',
  'modern-feature',
  'component-mosaic',
  'platform-hero',
  'testimonial-card',
  'community-hub',
  'big-statement',
  'step-timeline',
  'table-of-contents',
  // --- Resume Pro ---
  'academic-hybrid-resume',
  // --- Bilingual Series ---
  'bilingual-cover',
  'bilingual-reader',
  'bilingual-quote',
  'bilingual-glossary'
];

test.describe('全量模板 (36 个) 渲染完整性与无崩溃地毯式巡检', () => {
  test.beforeEach(async ({ page }) => {
    await createNewProjectAndEnterEditor(page);
  });

  test('逐一挂载并渲染全部 36 个模板，验证画布不塌陷、未触发 Error Boundary 且控制台零报错', async ({ page, consoleErrors }) => {
    // 依次巡检全部模板
    for (const templateId of ALL_TEMPLATE_IDS) {
      // 1. 通过页面上下文安全切换当前页面的 layoutId
      await page.evaluate((targetLayoutId) => {
        const store = (window as any).__SLIDEGRID_STORE__ || (window as any).useStore;
        if (store?.getState) {
          const state = store.getState();
          const currentPage = state.pages[state.currentPageIndex] || state.pages[0];
          if (currentPage) {
            state.updatePage({ ...currentPage, layoutId: targetLayoutId });
          }
        } else {
          // 若全局未挂载 store，通过派发自定义事件或路由参数机制切换
          window.dispatchEvent(new CustomEvent('switch-template-test', { detail: targetLayoutId }));
        }
      }, templateId);

      // 稍微等待渲染稳定
      await page.waitForTimeout(200);

      // 2. 验证主画布区域存在且正常可见
      const canvasArea = page.locator('.magazine-page, div[class*="magazine-page"]').first();
      await expect(canvasArea).toBeVisible({ timeout: 5000 });

      // 3. 验证未触发 React Error Boundary 的崩溃界面
      const errorBoundaryFallback = page.getByText(/Something went wrong|渲染出错|渲染异常/i);
      await expect(errorBoundaryFallback).toHaveCount(0);

      // 4. 验证视口元素尺寸合法（高宽有效）
      const box = await canvasArea.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThan(50);
      expect(box!.width).toBeGreaterThan(50);
    }

    // 5. 校验 34 个模板全量遍历完成后，全程无任何未捕获的严重错误
    expect(consoleErrors).toEqual([]);
  });
});
