import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('Electron 宿主环境能力、IPC 桥接与导出功能测试', () => {
  test.beforeEach(async ({ page }) => {
    await createNewProjectAndEnterEditor(page);
  });

  test('验证 Preload IPC 桥接 (window.electronAPI) 完整注入且原生 API 可调用', async ({ page, consoleErrors }) => {
    // 1. 检查 window.electronAPI 是否成功挂载在渲染进程上下文中
    const isElectronApiPresent = await page.evaluate(() => {
      const api = (window as any).electronAPI;
      if (!api) return false;
      const expectedMethods = [
        'getAppPaths',
        'saveProject',
        'openProject',
        'readProject',
        'uploadAsset',
        'selectDirectory',
        'saveFileBuffer',
        'setActiveWorkspace',
        'listProjects',
        'setCurrentProject',
        'readAssetFile',
        'processResponsiveImages',
        'deleteProject'
      ];
      return expectedMethods.every(method => typeof api[method] === 'function');
    });

    expect(isElectronApiPresent).toBe(true);

    // 2. 调用真实的 getAppPaths 验证 IPC 往返通信正常
    const appPaths = await page.evaluate(async () => {
      return await (window as any).electronAPI.getAppPaths();
    });

    expect(appPaths).not.toBeNull();
    expect(typeof appPaths).toBe('object');
    // userData 必须存在且是有效路径
    expect(appPaths.userData).toBeTruthy();

    // 3. 验证无控制台报错
    expect(consoleErrors).toEqual([]);
  });

  test('TopNav 导出菜单交互与导出流程无假死验证', async ({ page, consoleErrors }) => {
    // 1. 定位并点击 Export 按钮展开导出选项
    const exportBtn = page.getByRole('button', { name: /^Export$/i }).first();
    await expect(exportBtn).toBeVisible({ timeout: 10000 });
    await exportBtn.click();

    // 2. 验证弹出 Scope Options 浮层与选项
    const singleSlideOpt = page.getByRole('button', { name: /Single Slide/i });
    await expect(singleSlideOpt).toBeVisible({ timeout: 5000 });

    const fullArchiveOpt = page.getByRole('button', { name: /Full Archive/i });
    await expect(fullArchiveOpt).toBeVisible({ timeout: 5000 });

    // 3. 点击 Single Slide 触发单页导出
    await singleSlideOpt.click();

    // 4. 等待导出完成（按钮恢复为 Export 或弹窗关闭）
    await expect(exportBtn).toHaveText(/^Export$/i, { timeout: 20000 });

    // 5. 验证应用未发生卡死或渲染崩溃
    await expect(page.locator('.magazine-page').first()).toBeVisible();
    expect(consoleErrors).toEqual([]);
  });
});
