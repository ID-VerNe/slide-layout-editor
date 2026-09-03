import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('历史记录撤销重做 (Undo/Redo) 与快捷键交互端到端测试', () => {
  test.beforeEach(async ({ page }) => {
    await createNewProjectAndEnterEditor(page);
  });

  test('初始状态撤销重做按钮禁用，产生状态变更后激活，点击 Undo/Redo 能够往返流转历史栈', async ({ page, consoleErrors }) => {
    const undoBtn = page.getByTitle('Undo (Ctrl+Z)');
    const redoBtn = page.getByTitle('Redo (Ctrl+Y)');

    // 1. 验证初始状态下历史栈为空，按钮禁用
    await expect(undoBtn).toBeVisible({ timeout: 10000 });
    await expect(redoBtn).toBeVisible({ timeout: 10000 });
    await expect(undoBtn).toBeDisabled();
    await expect(redoBtn).toBeDisabled();

    // 2. 产生一次状态快照变更（新增一页幻灯片）
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__;
      store.getState().addPage('16:9', 'modern-feature');
    });

    // 3. 验证幻灯片变为 2 页，且 Undo 按钮被激活为可用状态
    await expect(page.getByText(/Slide 2 \/\/ 2/i)).toBeVisible({ timeout: 5000 });
    await expect(undoBtn).toBeEnabled();
    await expect(redoBtn).toBeDisabled();

    // 4. 点击 Undo 按钮撤销新增 (使用 dispatchEvent 确保原生事件直达)
    await undoBtn.dispatchEvent('click');
    await page.waitForTimeout(500);

    // 5. 验证幻灯片恢复为 1 页，Redo 按钮变为激活状态
    await expect(page.getByText(/Slide 1 \/\/ 1/i)).toBeVisible({ timeout: 5000 });
    await expect(redoBtn).toBeEnabled();

    // 6. 点击 Redo 按钮重做新增
    await redoBtn.dispatchEvent('click');
    await page.waitForTimeout(500);

    // 7. 验证再次恢复为 2 页
    await expect(page.getByText(/Slide 2 \/\/ 2/i)).toBeVisible({ timeout: 5000 });

    // 8. 验证控制台零报错
    expect(consoleErrors).toEqual([]);
  });

  test('键盘快捷键触发撤销与重做流转正常', async ({ page, consoleErrors }) => {
    // 1. 通过 Store 压入变更
    await page.evaluate(() => {
      const store = (window as any).__SLIDEGRID_STORE__;
      store.getState().addPage('16:9', 'modern-feature');
    });
    await expect(page.getByText(/Slide 2 \/\/ 2/i)).toBeVisible({ timeout: 5000 });

    // 2. 模拟按下键盘快捷键 Ctrl+Z 触发撤销
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(300);

    // 3. 验证幻灯片回退为 1 页
    await expect(page.getByText(/Slide 1 \/\/ 1/i)).toBeVisible({ timeout: 5000 });

    // 4. 模拟按下键盘快捷键 Ctrl+Shift+Z 触发重做
    await page.keyboard.press('Control+Shift+z');
    await page.waitForTimeout(300);

    // 5. 验证恢复为 2 页
    await expect(page.getByText(/Slide 2 \/\/ 2/i)).toBeVisible({ timeout: 5000 });

    // 6. 验证控制台零报错
    expect(consoleErrors).toEqual([]);
  });
});
