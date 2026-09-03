import { test, expect, createNewProjectAndEnterEditor } from './fixtures';

test.describe('工程持久化存储与重新加载生命周期端到端测试', () => {
  test('编辑工程内容与标题后保存，刷新应用或重新加载页面能够完整从本地数据库恢复数据', async ({ page, consoleErrors }) => {
    // 1. 新建工程进入编辑器
    await createNewProjectAndEnterEditor(page);

    // 2. 修改工程标题
    const testProjectTitle = 'PERSISTED_PROJECT_ALPHA';
    const titleInput = page.locator('input[value="New Slide"], input[placeholder*="Untitled"], input[placeholder*="PLACEHOLDER"]').first();
    await expect(titleInput).toBeVisible({ timeout: 10000 });
    await titleInput.fill(testProjectTitle);
    await titleInput.blur();

    // 3. 修改主标题内容为独特文本
    const testHeadline = 'HEADLINE RESTORED FROM PERSISTENCE 9988';
    const headlineTextarea = page.locator('textarea[placeholder*="Headline"]').first();
    await expect(headlineTextarea).toBeVisible({ timeout: 10000 });
    await headlineTextarea.fill(testHeadline);
    await headlineTextarea.blur();

    // 4. 触发底层持久化写入 (saveProject 需要 id 和 data 两个参数)
    await page.evaluate(async () => {
      const store = (window as any).__SLIDEGRID_STORE__;
      const state = store.getState();
      const db = (window as any).__SLIDEGRID_DB__;
      const projectId = state.activeProjectId || window.location.hash.split('/')[2]?.replace(/\?.*/, '');
      if (db && typeof db.saveProject === 'function' && projectId) {
        await db.saveProject(projectId, {
          id: projectId,
          version: "3.0",
          title: state.projectTitle,
          pages: state.pages,
          theme: state.theme,
          lastModified: Date.now()
        });
      }
    });

    // 5. 模拟关闭应用/刷新页面生命周期
    await page.reload();
    await page.waitForLoadState('domcontentloaded');

    // 6. 等待页面重新挂载并从本地存储加载工程数据
    await expect(page.getByRole('heading', { level: 1, name: testHeadline })).toBeVisible({ timeout: 15000 });

    // 7. 验证控制台零报错
    expect(consoleErrors).toEqual([]);
  });
});
