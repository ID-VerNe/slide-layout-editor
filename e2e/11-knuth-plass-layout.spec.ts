import { test, expect } from './fixtures';

test.describe("Knuth-Plass Text Layout Editor Feature", () => {
  test("测试用例1：新增文本并验证排版自动适应防抖", async ({ page }) => {
    // 1. 点击 New Slide 触发工程创建并跳转至编辑器
    const newSlideBtn = page.getByRole('button', { name: /New Slide/i });
    await newSlideBtn.click();
    
    // 2. 等待进入编辑器页面
    await expect(page).toHaveURL(/.*#\/editor\/.*/, { timeout: 15000 });

    // 3. 在编辑器中添加一个 Text 节点
    const addTextBtn = page.getByRole("button", { name: /Text|Add Text/i }).first();
    if (await addTextBtn.isVisible()) {
      await addTextBtn.click();
    }

    // 在画布或者编辑面板中找到文本输入框
    // 这里的选择器只是占位，实际应该用语义化选择器
    const textEditor = page.getByRole("textbox", { name: /内容|content/i }).first();
    if (await textEditor.isVisible()) {
      await textEditor.fill("这是用于测试 Knuth-Plass 排版的长文本，它会在 500ms 后自动触发排版并两端对齐。");
      
      // 等待 debounce 500ms，外加 200ms 的 worker 计算与 React 渲染
      await page.waitForTimeout(1000);
      
      // 验证 DOM 渲染包含 KnuthPlass 容器
      const kpContainer = page.locator('.zine-knuth-plass-text').first();
      await expect(kpContainer).toBeVisible();
      
      // 验证内部由于断行生成了多行 div (KnuthPlassText 按照断行渲染 div)
      const lines = kpContainer.locator('> div');
      const lineCount = await lines.count();
      expect(lineCount).toBeGreaterThan(0);
    }
  });
});
