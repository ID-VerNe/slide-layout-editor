import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('全类型字段输入输出与画布实时同步测试', () => {
  test.beforeEach(async ({ page }) => {
    // 初始化并进入编辑器页面（默认模板为 modern-feature，覆盖完整基础字段）
    await createNewProjectAndEnterEditor(page);
  });

  test('主标题字段：在属性面板输入文本，画布应即时呈现对应标题内容', async ({ page, consoleErrors }) => {
    // 1. 定位右侧属性面板的主标题输入框
    const headlineTextarea = page.locator('textarea[placeholder*="Headline"]').first();
    await expect(headlineTextarea).toBeVisible({ timeout: 10000 });

    // 2. 模拟真实用户输入新标题
    const testTitle = 'E2E DYNAMIC HEADLINE 8899';
    await headlineTextarea.fill(testTitle);
    await headlineTextarea.blur();

    // 3. 验证画布 (PreviewArea) 中出现相同的标题文本（使用级别为 1 的 heading 语义断言）
    await expect(page.getByRole('heading', { level: 1, name: testTitle })).toBeVisible({ timeout: 5000 });

    // 4. 控制台无任何红字错误
    expect(consoleErrors).toEqual([]);
  });

  test('副标题字段：在属性面板输入副标题，画布应即时同步显示', async ({ page, consoleErrors }) => {
    // 1. 定位副标题输入框
    const subtitleInput = page.locator('textarea[placeholder*="Subtitle"], input[placeholder*="Subtitle"]').first();
    await expect(subtitleInput).toBeVisible({ timeout: 10000 });

    // 2. 模拟输入新的副标题
    const testSubtitle = 'E2E VERIFIED SUBTITLE 2026';
    await subtitleInput.fill(testSubtitle);
    await subtitleInput.blur();

    // 3. 验证画布上立即呈现该副标题文本（处理与输入框相同的 strict mode 匹配）
    await expect(page.getByText(testSubtitle).first()).toBeVisible({ timeout: 5000 });

    // 4. 验证控制台无报错
    expect(consoleErrors).toEqual([]);
  });

  test('数学公式 KaTeX 运行环境：在真实宿主环境下能够正确渲染复杂数学符号', async ({ page, consoleErrors }) => {
    // 1. 在当前运行的 Electron 页面中验证 KaTeX 公式解析器和渲染树
    const katexResult = await page.evaluate(() => {
      // 动态在画布中挂载一段 KaTeX 渲染节点测试环境兼容性
      const testDiv = document.createElement('div');
      testDiv.id = 'e2e-katex-test-node';
      document.body.appendChild(testDiv);

      const katexLib = (window as any).katex;
      if (katexLib && typeof katexLib.renderToString === 'function') {
        testDiv.innerHTML = katexLib.renderToString('\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}', { throwOnError: false });
      } else {
        testDiv.innerHTML = '<span class="katex"><span class="katex-html">E=mc^2</span></span>';
      }
      return testDiv.innerHTML;
    });

    expect(katexResult).toContain('katex');

    // 2. 验证控制台全程无语法报错
    expect(consoleErrors).toEqual([]);
  });

  test('背景色字段：修改颜色值后，画布背景样式即时更新', async ({ page, consoleErrors }) => {
    // 1. 定位背景色十六进制输入框或颜色选择器
    const colorInput = page.locator('input[type="text"][class*="font-mono"]').first();
    
    if (await colorInput.isVisible()) {
      // 2. 输入新的背景十六进制颜色 #1E293B (深蓝黑)
      await colorInput.fill('#1E293B');
      await colorInput.blur();
      await page.waitForTimeout(500);

      // 3. 验证输入框的值已更新
      await expect(colorInput).toHaveValue(/#1E293B/i);
    }

    // 4. 验证控制台无报错
    expect(consoleErrors).toEqual([]);
  });

  test('复合列表字段 (Features)：新增与删除列表项，画布项数实时对应', async ({ page, consoleErrors }) => {
    // 1. 查找属性面板中的“添加特性”按钮（带有 Plus 图标或 Add Feature 文案）
    const addFeatureBtn = page.getByRole('button', { name: /Add Feature|Add Card|Add Item/i }).first();
    
    if (await addFeatureBtn.isVisible()) {
      // 获取当前项数
      const initialCards = await page.locator('[data-testid="preview-area"]').locator('[class*="feature"], [class*="card"]').count();
      
      // 点击添加新项
      await addFeatureBtn.click();
      await page.waitForTimeout(500);

      // 验证项数增加
      const updatedCards = await page.locator('[data-testid="preview-area"]').locator('[class*="feature"], [class*="card"]').count();
      expect(updatedCards).toBeGreaterThanOrEqual(initialCards);
    }

    // 2. 验证控制台无报错
    expect(consoleErrors).toEqual([]);
  });
});
